# publish-release: Visual Deep Dive

Concentrated diagrams for [.github/workflows/publish-release.yml](../workflows/publish-release.yml) and the composite actions it leans on. Companion to [WORKFLOW_ARCHITECTURE.md](WORKFLOW_ARCHITECTURE.md).

Minimum prose. Maximum diagrams.

## Navigate

- [1. The whole picture](#1-the-whole-picture)
- [2. Triggers](#2-triggers)
- [3. The two-job DAG](#3-the-two-job-dag)
- [4. The two-layer guard](#4-the-two-layer-guard)
- [5. Step-by-step lifecycle](#5-step-by-step-lifecycle)
- [6. Version routing](#6-version-routing)
- [7. External calls](#7-external-calls)
- [8. The rollback path](#8-the-rollback-path)
- [9. Output cascade](#9-output-cascade)
- [10. State machine](#10-state-machine)
- [11. Failure modes](#11-failure-modes)
- [12. Quick reference card](#12-quick-reference-card)

---

## 1. The whole picture

How [publish-release.yml](../workflows/publish-release.yml) plugs into npm, GitHub Releases, and OIDC provenance, including the rollback edge.

```mermaid
flowchart LR
    classDef trig fill:#0b3954,color:#fff,stroke:#000
    classDef gate fill:#7c2d12,color:#fff,stroke:#000
    classDef job fill:#1e3a8a,color:#fff,stroke:#000
    classDef ext fill:#064e3b,color:#fff,stroke:#000
    classDef file fill:#374151,color:#fff,stroke:#000
    classDef out fill:#581c87,color:#fff,stroke:#000
    classDef bad fill:#991b1b,color:#fff,stroke:#000

    subgraph T["Triggers"]
        t1["release.published\n(typical path)"]:::trig
        t2["workflow_dispatch\n(manual republish)"]:::trig
    end

    subgraph W["publish-release.yml"]
        J1["check-release-branch\ntarget_commitish == 'main'?"]:::gate
        J2["publish-npm-package\nactor in ALLOWED_PUBLISHERS?"]:::job
    end

    subgraph S["Secrets and Identity"]
        s1["APP_ID + APP_PRIVATE_KEY"]:::file
        s2["NODE_AUTH_TOKEN\n(npm auth via registry-url)"]:::file
        s3["OIDC token\nid-token: write"]:::file
        bot["llm-exe-bot[bot]\nshort-lived GitHub token"]:::file
    end

    subgraph F["Local artifacts"]
        pkg["package.json\nversion string"]:::file
        dist["dist/ tarball\nbuilt by tsup"]:::file
    end

    subgraph X["External"]
        npm["registry.npmjs.org\n(npm publish)"]:::ext
        gh["api.github.com\n(PATCH releases on failure)"]:::ext
    end

    subgraph O["Outputs"]
        ok["npm tarball\n(latest or beta tag)"]:::out
        prov["sigstore provenance\n(OIDC attestation)"]:::out
        rel["GitHub Release\nremains published"]:::out
        bad1["GitHub Release\nreverted to draft + warning"]:::bad
    end

    t1 --> J1
    t2 --> J2
    J1 -->|main| J2
    J1 -->|not main| stop1([fail])
    s1 --> bot
    bot --> J2
    s2 --> J2
    s3 --> J2
    J2 --> pkg
    J2 --> dist
    dist --> npm
    npm --> ok
    s3 --> prov
    npm --> prov
    J2 --> rel
    J2 -.failure + release event.-> gh
    gh --> bad1
```

[Back to top](#navigate)

---

## 2. Triggers

Two entry points. One is the normal automated path, the other is the manual escape hatch.

```mermaid
flowchart TB
    classDef rel fill:#0e7490,color:#fff,stroke:#000
    classDef manual fill:#9333ea,color:#fff,stroke:#000
    classDef out fill:#1f2937,color:#fff,stroke:#000
    classDef stop fill:#7c2d12,color:#fff,stroke:#000

    start([event arrives])
    start --> ev{event_name?}

    ev -->|release| relA{action?}
    ev -->|workflow_dispatch| disp["manual run\n(no payload validation)"]:::manual

    relA -->|published| relB["release payload available\n(release.target_commitish, release.id, release.body)"]:::rel
    relA -->|any other| skip([ignored])

    relB --> J1{target_commitish\n== 'main'?}
    J1 -->|yes| ok1[/proceed to publish-npm-package/]:::out
    J1 -->|no| fail1([exit 1, fail check-release-branch]):::stop

    disp --> J1bypass["check-release-branch step is skipped\n(its 'if' requires event_name == release)"]:::manual
    J1bypass --> ok1
```

Source: [.github/workflows/publish-release.yml](../workflows/publish-release.yml) lines 3-8 (triggers), 18-25 (branch check).

Note on the manual path: the branch check step's `if` clause requires `github.event_name == 'release'`, so a `workflow_dispatch` run hits an effectively empty `check-release-branch` job that always succeeds. The actor allowlist (Section 4) is what stops unauthorized manual republishes.

[Back to top](#navigate)

---

## 3. The two-job DAG

```mermaid
flowchart TB
    classDef job fill:#1e3a8a,color:#fff,stroke:#000
    classDef step fill:#374151,color:#fff,stroke:#000
    classDef gate fill:#7c2d12,color:#fff,stroke:#000
    classDef cleanup fill:#581c87,color:#fff,stroke:#000

    start([Workflow event])
    start --> J1

    subgraph J1["Job: check-release-branch (ubuntu-latest)"]
        direction TB
        c1["Check if release is from main branch\nif: event_name == release && action == published\nrun: jq target_commitish, fail if not main"]:::gate
    end

    J1 -->|needs| J2

    subgraph J2["Job: publish-npm-package (ubuntu-latest)"]
        direction TB
        s1["actions/checkout@v4"]:::step
        s2["Generate bot token\n(create-github-app-token@v1)"]:::step
        s3["Validate Publisher\n(actor allowlist)"]:::gate
        s4["./.github/actions/setup-node\n(Node 24.x + npm registry-url)"]:::step
        s5["./.github/actions/cache\n(~/.npm + node_modules)"]:::step
        s6["npm install"]:::step
        s7["npm run build:package\n(tsup CJS+ESM+DTS)"]:::step
        s8["Publish (route by version)"]:::step
        s9["Revert release to draft on failure\nif: failure() && event_name == release"]:::cleanup
        s1 --> s2 --> s3 --> s4 --> s5 --> s6 --> s7 --> s8 --> s9
    end
```

`needs: check-release-branch` enforces sequential ordering. No concurrency group is declared, so two concurrent dispatch runs are theoretically possible but npm itself rejects duplicate versions.

[Back to top](#navigate)

---

## 4. The two-layer guard

Two independent gates. Both must pass.

```mermaid
flowchart TB
    classDef gate fill:#7c2d12,color:#fff,stroke:#000
    classDef pass fill:#064e3b,color:#fff,stroke:#000
    classDef fail fill:#991b1b,color:#fff,stroke:#000
    classDef note fill:#374151,color:#fff,stroke:#000

    start([Event payload arrives])

    start --> L1{Layer 1: branch gate\nevent_name == release?}
    L1 -->|no, dispatch| L1skip["step skipped by 'if'\nlayer passes by default"]:::note
    L1 -->|yes| L1c{target_commitish == 'main'?}
    L1c -->|no| X1([exit 1\ncheck-release-branch fails\npublish-npm-package never runs]):::fail
    L1c -->|yes| L1pass[Layer 1 OK]:::pass
    L1skip --> L2
    L1pass --> L2

    L2{Layer 2: actor gate\ngithub.actor in 'gregreindel'?}
    L2 -->|no| X2([exit 1\nstep fails after checkout\nbefore install or build]):::fail
    L2 -->|yes| ok([proceed: install, build, publish]):::pass
```

Why two layers?

- Layer 1 stops accidental publishes from a feature branch tag. A release cut from `development` will fail before any code runs.
- Layer 2 stops the wrong human from triggering `workflow_dispatch` (which bypasses Layer 1).

Together they cover both the automated and manual entry points. Neither alone is sufficient.

Source: [publish-release.yml](../workflows/publish-release.yml) lines 18-25 (Layer 1), 42-50 (Layer 2).

[Back to top](#navigate)

---

## 5. Step-by-step lifecycle

One successful publish from event to npm registry.

```mermaid
sequenceDiagram
    autonumber
    participant E as Event
    participant C1 as check-release-branch
    participant J as publish-npm-package
    participant T as Token mint
    participant N as Node + npm
    participant B as tsup build
    participant R as registry.npmjs.org
    participant S as sigstore (OIDC)

    E->>C1: release.published (target_commitish=main)
    C1->>C1: jq target_commitish from GITHUB_EVENT_PATH
    C1-->>J: needs satisfied
    J->>J: actions/checkout@v4
    J->>T: create-github-app-token@v1 (APP_ID, APP_PRIVATE_KEY)
    T-->>J: bot token (used later on failure)
    J->>J: Validate Publisher (actor in allowlist)
    J->>N: setup-node@v4 Node 24.x, registry-url npmjs.org
    Note over N: registry-url makes npm write an .npmrc with NODE_AUTH_TOKEN
    J->>N: cache restore (~/.npm + node_modules)
    J->>N: npm install
    J->>B: npm run build:package (tsup CJS + ESM + DTS, externals listed)
    B-->>J: dist/ ready
    J->>J: read package.json version
    alt version contains "beta"
        J->>R: npm publish --tag beta
    else
        J->>R: npm publish
    end
    R->>S: request provenance attestation
    S-->>R: signed attestation (OIDC id-token)
    R-->>J: 200 OK, tarball live
```

Source: [publish-release.yml](../workflows/publish-release.yml) lines 32-74.

[Back to top](#navigate)

---

## 6. Version routing

The published package.json version string determines the npm dist-tag.

```mermaid
flowchart LR
    classDef read fill:#1e3a8a,color:#fff,stroke:#000
    classDef dec fill:#7c2d12,color:#fff,stroke:#000
    classDef main fill:#064e3b,color:#fff,stroke:#000
    classDef beta fill:#581c87,color:#fff,stroke:#000

    A["node -p require('./package.json').version"]:::read
    A --> D{version string\ncontains 'beta'?}

    D -->|yes\ne.g. 2.4.0-beta.1| B1["echo Publishing beta version"]:::beta
    B1 --> B2["npm run publish-beta\n= npm publish --tag beta"]:::beta
    B2 --> B3["dist-tag: beta\nlatest unchanged"]:::beta

    D -->|no\ne.g. 2.3.6| M1["echo Publishing main version"]:::main
    M1 --> M2["npm run publish-main\n= npm publish"]:::main
    M2 --> M3["dist-tag: latest\n(default)"]:::main
```

Source: [publish-release.yml](../workflows/publish-release.yml) lines 64-74. Scripts in [package.json](../../package.json) lines 56-57.

Why this matters: `npm publish` with no flag overwrites the `latest` dist-tag. Beta releases must use `--tag beta` so they do not become the default install for `npm i llm-exe`. The check is a plain substring match; a version like `2.3.6-beta.0` matches, while `2.3.6` does not.

[Back to top](#navigate)

---

## 7. External calls

Who is contacted, with what credential, why.

```mermaid
flowchart LR
    classDef pre fill:#155e75,color:#fff,stroke:#000
    classDef pub fill:#064e3b,color:#fff,stroke:#000
    classDef rb fill:#7c2d12,color:#fff,stroke:#000

    subgraph Pre["Before the publish step"]
        c1["actions/create-github-app-token@v1\nauth: APP_ID + APP_PRIVATE_KEY\nwhy: bot token for rollback PATCH (used only on failure)"]:::pre
        c2["actions/checkout@v4\nauth: GITHUB_TOKEN (default)\nwhy: source for build"]:::pre
        c3["actions/setup-node@v4 (composite)\nauth: none\nwhy: Node 24.x + npm registry-url"]:::pre
        c4["actions/cache@v4 (composite)\nauth: none\nwhy: speed up npm install"]:::pre
    end

    subgraph Pub["Publish"]
        d1["registry.npmjs.org\nauth: NODE_AUTH_TOKEN (from npm secret + registry-url)\nwhy: npm publish (main or beta tag)"]:::pub
        d2["sigstore via OIDC\nauth: GitHub-issued id-token\nwhy: npm provenance attestation"]:::pub
    end

    subgraph Rb["Failure rollback (release event only)"]
        d3["api.github.com PATCH /releases/:id\nauth: bot token from step 'bot-token'\nwhy: flip published release to draft and prepend warning"]:::rb
    end

    c1 --> c2 --> c3 --> c4 --> d1
    d1 --> d2
    d1 -.failure.-> d3
```

The npm token (used by `npm publish`) is configured by `setup-node@v4` consuming the `registry-url` and the `NODE_AUTH_TOKEN` env var. Provenance is automatic when both `id-token: write` is granted (top of file) and the registry supports it. The bot token from `create-github-app-token@v1` is only used by the rollback step.

[Back to top](#navigate)

---

## 8. The rollback path

Triggered only on the failure of a release-event run. Preserves the original body.

```mermaid
flowchart TB
    classDef trig fill:#7c2d12,color:#fff,stroke:#000
    classDef step fill:#374151,color:#fff,stroke:#000
    classDef out fill:#064e3b,color:#fff,stroke:#000
    classDef fail fill:#991b1b,color:#fff,stroke:#000

    A["any earlier step failed\n(validate, install, build, publish)"]:::trig
    A --> B{event_name == release?}
    B -->|no, dispatch| skip([no rollback; failure surfaces in run logs]):::fail
    B -->|yes| C["read release.id and release.body\nfrom GITHUB_EVENT_PATH via jq"]:::step

    C --> D["heredoc release_body.txt\nwith [!WARNING] banner referencing WORKFLOW_URL"]:::step
    D --> E["sed -i replace WORKFLOW_URL with\nserver_url/repository/actions/runs/run_id"]:::step
    E --> F["append ORIGINAL_BODY to banner\n(separator line, then full original notes)"]:::step
    F --> G["jq -Rs '.' to JSON-escape the file"]:::step
    G --> H["curl PATCH /repos/:repo/releases/:id\nbody: {draft:true, body: BODY_JSON}\nAuth: bot token from step output"]:::step
    H --> I{response has .id?}
    I -->|yes| OK["Release reverted to draft with original notes preserved"]:::out
    I -->|no| WARN["log warning, dump response\n(workflow still marked failed)"]:::fail
```

Source: [publish-release.yml](../workflows/publish-release.yml) lines 76-108.

Key invariants:

- Original release body is never lost. The banner is prepended; the original is appended verbatim from the event payload.
- The workflow URL is computed from `github.server_url`, `github.repository`, `github.run_id`. No magic strings.
- The PATCH uses the bot token (App identity) rather than `GITHUB_TOKEN`, which lets the change look like the bot acted rather than the GitHub Actions service account.
- `failure()` only fires for hard failures of earlier steps in the same job. A failure of `check-release-branch` short-circuits before `publish-npm-package` ever runs, so this rollback never executes for a wrong-branch release. That is intentional: a wrong-branch release should not be auto-drafted by this workflow.

[Back to top](#navigate)

---

## 9. Output cascade

What this workflow produces and who consumes it.

```mermaid
flowchart LR
    classDef src fill:#1e3a8a,color:#fff,stroke:#000
    classDef ok fill:#064e3b,color:#fff,stroke:#000
    classDef bad fill:#991b1b,color:#fff,stroke:#000
    classDef cons fill:#374151,color:#fff,stroke:#000
    classDef human fill:#7c2d12,color:#fff,stroke:#000

    W["publish-release.yml"]:::src

    W -->|success| O1["npm tarball at\nregistry.npmjs.org/llm-exe"]:::ok
    W -->|success| O2["sigstore provenance attestation\n(visible on npm package page)"]:::ok
    W -->|success| O3["GitHub Release remains in\npublished state"]:::ok
    W -.failure on release event.-> O4["GitHub Release flipped to draft\nwith warning banner"]:::bad
    W -.failure on dispatch.-> O5["workflow run marked failed\nno rollback"]:::bad

    O1 --> C1["users running\nnpm i llm-exe (latest)\nor npm i llm-exe@beta"]:::cons
    O2 --> C2["consumers verifying supply chain\nvia npm audit signatures"]:::cons
    O3 --> C3["GitHub Release feed,\ndependabot, downstream tools"]:::cons
    O4 --> C4["maintainer fixes issue,\nedits draft, republishes"]:::human
    O5 --> C4
```

[Back to top](#navigate)

---

## 10. State machine

A single run as a finite state machine.

```mermaid
stateDiagram-v2
    [*] --> Triggered: release.published or workflow_dispatch
    Triggered --> BranchChecking: check-release-branch job starts
    BranchChecking --> WrongBranch: target_commitish != main
    BranchChecking --> BranchOK: main OR dispatch (step skipped)
    WrongBranch --> [*]: workflow fails, no rollback
    BranchOK --> ActorChecking: publish-npm-package starts
    ActorChecking --> WrongActor: actor not in allowlist
    ActorChecking --> ActorOK: actor == gregreindel
    WrongActor --> RollbackEligible: if release event
    ActorOK --> Installing: setup-node + cache + npm install
    Installing --> InstallFailed: npm install error
    InstallFailed --> RollbackEligible
    Installing --> Building: npm run build:package
    Building --> BuildFailed: tsup error
    BuildFailed --> RollbackEligible
    Building --> Routing: read version, branch on 'beta'
    Routing --> PublishingMain: no 'beta' substring
    Routing --> PublishingBeta: contains 'beta'
    PublishingMain --> PublishFailed: registry error
    PublishingBeta --> PublishFailed
    PublishingMain --> Published: 200 OK + provenance
    PublishingBeta --> Published
    PublishFailed --> RollbackEligible
    RollbackEligible --> Drafted: event_name == release, PATCH 200
    RollbackEligible --> DraftFailed: dispatch OR PATCH non-200
    Published --> [*]
    Drafted --> [*]
    DraftFailed --> [*]
```

Failure of the publish step is the only path that produces a partial outcome (tarball pushed but provenance failed). npm's transactional semantics make this rare in practice.

[Back to top](#navigate)

---

## 11. Failure modes

```mermaid
flowchart TB
    classDef fail fill:#7c2d12,color:#fff,stroke:#000
    classDef effect fill:#374151,color:#fff,stroke:#000
    classDef fix fill:#064e3b,color:#fff,stroke:#000

    F1["Release cut from non-main branch\n(target_commitish != main)"]:::fail
    F1 --> F1E["check-release-branch exits 1\npublish-npm-package never starts\nno rollback fires"]:::effect
    F1E --> F1X["delete/edit the release,\nrecreate it targeting main,\nor merge to main first"]:::fix

    F2["workflow_dispatch by non-allowed actor"]:::fail
    F2 --> F2E["Validate Publisher step exits 1\nbefore install or build"]:::effect
    F2X["edit ALLOWED_PUBLISHERS in workflow\nor request the owner to publish"]:::fix
    F2E --> F2X

    F3["npm install fails\n(lockfile drift, registry down)"]:::fail
    F3 --> F3E["job fails before build\nrollback fires on release event"]:::effect
    F3X["fix package-lock alignment,\nthen rerun via dispatch"]:::fix
    F3E --> F3X

    F4["build:package fails\n(type error, tsup error)"]:::fail
    F4 --> F4E["job fails before publish\nrollback fires on release event"]:::effect
    F4X["fix code, cut a new release\nor rerun dispatch after fix"]:::fix
    F4E --> F4X

    F5["npm publish fails\n(version already exists, auth, network)"]:::fail
    F5 --> F5E["job fails at publish step\nrollback fires on release event\ntarball NOT live"]:::effect
    F5X["bump version, recreate release\n(npm versions are immutable)"]:::fix
    F5E --> F5X

    F6["OIDC provenance fails\nbut tarball already published"]:::fail
    F6 --> F6E["step exit non-zero,\nrollback flips release to draft,\nbut npm tarball is live"]:::effect
    F6X["unpublish within 72h or publish patch\nthat supersedes; investigate id-token perms"]:::fix
    F6E --> F6X

    F7["Rollback PATCH itself fails\n(bot token revoked, GitHub API down)"]:::fail
    F7 --> F7E["warning printed, response dumped\nrelease stays published\nworkflow still marked failed"]:::effect
    F7X["manually edit the release to draft\nadd warning banner by hand"]:::fix
    F7E --> F7X

    F8["Two simultaneous dispatch runs"]:::fail
    F8 --> F8E["no concurrency group;\nsecond run will fail at npm publish\n(version conflict)"]:::effect
    F8X["wait for first run,\nor add concurrency group if this recurs"]:::fix
    F8E --> F8X
```

[Back to top](#navigate)

---

## 12. Quick reference card

```mermaid
flowchart LR
    classDef k fill:#1e3a8a,color:#fff,stroke:#000
    classDef v fill:#374151,color:#fff,stroke:#000

    K1["File"]:::k --- V1[".github/workflows/publish-release.yml"]:::v
    K2["Triggers"]:::k --- V2["release.published + workflow_dispatch"]:::v
    K3["Jobs"]:::k --- V3["check-release-branch then publish-npm-package"]:::v
    K4["Permissions"]:::k --- V4["id-token: write, contents: write"]:::v
    K5["Branch guard"]:::k --- V5["release.target_commitish == 'main'"]:::v
    K6["Actor guard"]:::k --- V6["ALLOWED_PUBLISHERS = gregreindel"]:::v
    K7["Node version"]:::k --- V7["24.x via ./.github/actions/setup-node"]:::v
    K8["Registry"]:::k --- V8["registry.npmjs.org"]:::v
    K9["Cache"]:::k --- V9["~/.npm and node_modules (composite)"]:::v
    K10["Build"]:::k --- V10["npm run build:package (tsup CJS+ESM+DTS)"]:::v
    K11["Publish (main)"]:::k --- V11["npm publish (latest dist-tag)"]:::v
    K12["Publish (beta)"]:::k --- V12["npm publish --tag beta"]:::v
    K13["Routing key"]:::k --- V13["substring 'beta' in package.json version"]:::v
    K14["Provenance"]:::k --- V14["OIDC id-token, automatic on publish"]:::v
    K15["Bot identity"]:::k --- V15["llm-exe-bot[bot] via App token"]:::v
    K16["Rollback"]:::k --- V16["PATCH releases/:id draft=true, banner + original body"]:::v
    K17["Rollback condition"]:::k --- V17["failure() && event_name == release"]:::v
```

Direct links:

- Workflow file: [.github/workflows/publish-release.yml](../workflows/publish-release.yml)
- Composite actions: [actions/setup-node](../actions/setup-node/action.yml), [actions/cache](../actions/cache/action.yml)
- Publish scripts: [package.json](../../package.json) lines 56-57
- Build script: [package.json](../../package.json) line 46 (`build:package`)
- Full architecture doc: [WORKFLOW_ARCHITECTURE.md](WORKFLOW_ARCHITECTURE.md)

[Back to top](#navigate)
