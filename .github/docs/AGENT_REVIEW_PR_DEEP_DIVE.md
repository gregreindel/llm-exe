# agent-review-pr: Visual Deep Dive

Concentrated diagrams for [.github/workflows/agent-review-pr.yml](../workflows/agent-review-pr.yml), the bot-PR review gate. Companion to [WORKFLOW_ARCHITECTURE.md](WORKFLOW_ARCHITECTURE.md).

Minimum prose. Maximum diagrams.

## Navigate

- [1. The whole picture](#1-the-whole-picture)
- [2. Triggers and the agent/* filter](#2-triggers-and-the-agent-filter)
- [3. The one-job DAG](#3-the-one-job-dag)
- [4. Step-by-step lifecycle](#4-step-by-step-lifecycle)
- [5. Anatomy of the review prompt](#5-anatomy-of-the-review-prompt)
- [6. Filesystem reads](#6-filesystem-reads)
- [7. External calls](#7-external-calls)
- [8. The verdict tree](#8-the-verdict-tree)
- [9. Output cascade](#9-output-cascade)
- [10. State machine](#10-state-machine)
- [11. Failure modes](#11-failure-modes)
- [12. Quick reference card](#12-quick-reference-card)

---

## 1. The whole picture

How [agent-review-pr.yml](../workflows/agent-review-pr.yml) sits between bot output and the maintainer.

```mermaid
flowchart LR
    classDef trig fill:#0b3954,color:#fff,stroke:#000
    classDef gate fill:#7c2d12,color:#fff,stroke:#000
    classDef job fill:#1e3a8a,color:#fff,stroke:#000
    classDef ext fill:#064e3b,color:#fff,stroke:#000
    classDef file fill:#374151,color:#fff,stroke:#000
    classDef out fill:#581c87,color:#fff,stroke:#000

    subgraph U["Upstream producer"]
        AR["agent-run.yml\nopens PR from agent/*"]:::trig
    end

    subgraph T["Trigger"]
        t1["pull_request: opened\nbranches: main, development"]:::trig
        f1["job if:\nstartsWith(head_ref, 'agent/')"]:::gate
    end

    subgraph A["agent-review-pr.yml"]
        R["review job\ntimeout 15m"]:::job
    end

    subgraph S["Secrets and Identity"]
        s1["APP_ID + APP_PRIVATE_KEY"]:::file
        s2["CLAUDE_CODE_OAUTH_TOKEN"]:::file
        bot["llm-exe-bot[bot]\nshort-lived token"]:::file
    end

    subgraph F["Files read"]
        cfg["scripts/agents/config.sh"]:::file
        pr["scripts/agents/prompts/reviewer.md"]:::file
        tmp["/tmp/review-prompt.txt\n(assembled prompt)"]:::file
        cmd["CLAUDE.md (project context)"]:::file
    end

    subgraph X["External"]
        gh["GitHub API\n(pr diff, pr view, review, close)"]:::ext
        ant["Anthropic Claude\nclaude-opus-4-6"]:::ext
    end

    subgraph O["Outputs"]
        v1["approve review"]:::out
        v2["request-changes review"]:::out
        v3["pr close"]:::out
        log["reviewer log file\n(clock_in / clock_out)"]:::out
    end

    subgraph D["Downstream consumers"]
        man["maintainer triage"]:::job
        tst["tests.yml\n(unaffected by verdict)"]:::job
        next["next agent-run\nreads PR feedback"]:::job
    end

    AR --> t1
    t1 --> f1
    f1 -->|head_ref starts with agent/| R
    f1 -.->|other branches| skip(["skip"])
    s1 --> bot
    bot --> R
    s2 --> R
    R --> cfg
    cfg --> pr
    pr --> tmp
    R --> cmd
    tmp --> ant
    R --> gh
    R --> v1
    R --> v2
    R --> v3
    R --> log
    v1 --> man
    v2 --> next
    v3 --> next
```

[Back to top](#navigate)

---

## 2. Triggers and the agent/* filter

One trigger. One job-level filter. Anything that fails the filter is invisible to billing.

```mermaid
flowchart TB
    classDef trig fill:#0e7490,color:#fff,stroke:#000
    classDef gate fill:#7c2d12,color:#fff,stroke:#000
    classDef out fill:#1f2937,color:#fff,stroke:#000

    start([pull_request event])
    start --> typ{action == 'opened'?}
    typ -->|no| nop1([no workflow run])
    typ -->|yes| brn{base branch in (main, development)?}
    brn -->|no| nop2([no workflow run])
    brn -->|yes| job[[workflow starts]]

    job --> filt{head_ref starts with 'agent/'?}
    filt -->|no| skipJob[(job evaluated to false\nshows as skipped\nno billable minutes)]:::gate
    filt -->|yes| run[(review job runs)]:::out
```

Source: [.github/workflows/agent-review-pr.yml](../workflows/agent-review-pr.yml) lines 3-6 (trigger) and 16 (job-level if).

Why the filter is on the job rather than the workflow: it lets human PRs into the same branches without ever spending a runner minute, while keeping a single workflow definition.

[Back to top](#navigate)

---

## 3. The one-job DAG

One job. Six steps. Linear.

```mermaid
flowchart TB
    classDef job fill:#1e3a8a,color:#fff,stroke:#000
    classDef step fill:#374151,color:#fff,stroke:#000
    classDef gate fill:#7c2d12,color:#fff,stroke:#000

    start([pull_request opened on main or development])
    start --> filt{head_ref starts with agent/?}
    filt -->|no| stop([skip job])
    filt -->|yes| J1

    subgraph J1["Job: review (ubuntu-latest, timeout-minutes: 15)"]
        direction TB
        s1["Generate bot token\nactions/create-github-app-token@v1"]:::step
        s2["Checkout (fetch-depth: 0)\nwith bot token"]:::step
        s3["Setup Node 20\ncache: npm"]:::step
        s4["npm ci"]:::step
        s5["Build review prompt\nclock_in + sed substitution"]:::step
        s6["Review PR\nclaude-code-action@v1\n(max-turns 30)"]:::step
        s7["Clock out (if: always())"]:::step
        s1 --> s2 --> s3 --> s4 --> s5 --> s6 --> s7
    end
```

No concurrency group defined. Two PRs opened simultaneously fan out into two parallel review runs. The 15-minute timeout caps cost at roughly half an agent-run.

[Back to top](#navigate)

---

## 4. Step-by-step lifecycle

One review run from PR open to verdict.

```mermaid
sequenceDiagram
    autonumber
    participant E as Event (PR opened)
    participant J as review job
    participant T as Token mint
    participant G as Git
    participant N as Node + npm
    participant C as config.sh
    participant P as prompts/reviewer.md
    participant L as logs/reviewer/
    participant TMP as /tmp/review-prompt.txt
    participant CCA as claude-code-action@v1
    participant API as Anthropic + GitHub

    E->>J: head_ref starts with agent/, job runs
    J->>T: create-github-app-token@v1 (APP_ID, APP_PRIVATE_KEY)
    T-->>J: bot token (short-lived)
    J->>G: checkout fetch-depth 0 with bot token
    J->>N: setup-node@v4 + npm ci
    J->>C: source scripts/agents/config.sh
    C->>L: clock_in "reviewer" "PR #N" writes skeleton .md
    L-->>C: log file path
    C->>P: sed substitute $PR_NUMBER and $LOG_FILE
    P-->>C: rendered template
    C->>TMP: write rendered prompt
    J->>CCA: run prompt = "Read /tmp/review-prompt.txt"
    CCA->>API: streaming inference (claude-opus-4-6)
    API-->>CCA: tool calls (Bash, Read, Glob, Grep, WebFetch)
    CCA->>API: gh pr diff N
    CCA->>API: gh pr view N
    CCA->>API: gh pr review N --approve OR --request-changes OR gh pr close N
    CCA->>L: rewrite Summary, Files Changed, Next Steps
    J->>C: clock_out (always) maps job.status to exit code
    C->>L: stamp Finished UTC + Status completed or interrupted
```

Source: [.github/workflows/agent-review-pr.yml](../workflows/agent-review-pr.yml) lines 14-71.

[Back to top](#navigate)

---

## 5. Anatomy of the review prompt

Two layers concatenated into `/tmp/review-prompt.txt`. Simpler than agent-run.yml because there is no prior context.

```mermaid
flowchart TB
    classDef l1 fill:#0e7490,color:#fff,stroke:#000
    classDef l2 fill:#155e75,color:#fff,stroke:#000
    classDef sub fill:#7c2d12,color:#fff,stroke:#000

    A["LAYER 1: Reviewer template\nscripts/agents/prompts/reviewer.md"]:::l1
    B["LAYER 2: Substitutions via sed"]:::sub
    B1["$PR_NUMBER\nfrom github.event.pull_request.number"]:::sub
    B2["$LOG_FILE\nfrom clock_in stdout"]:::sub

    A --> X[("write /tmp/review-prompt.txt")]
    B1 --> X
    B2 --> X
    B --> B1
    B --> B2
    X --> R[("Claude reads it as its only prompt")]
    R --> Q1["pull diff with gh pr diff"]:::l2
    R --> Q2["pull description with gh pr view"]:::l2
    R --> Q3["read CLAUDE.md for context"]:::l2
    R --> Q4["check scope, correctness, regressions, common agent mistakes"]:::l2
    R --> Q5["emit one of three verdicts"]:::l2
```

What the prompt explicitly tells the reviewer to check:

| Concern | Why it matters |
|---------|----------------|
| Scope drift | docs agent must not touch src/, tester must not fix bugs |
| Correctness | the change does what it claims |
| Regressions | broken patterns or sloppy mistakes |
| Test quality | tests test behavior, not implementation noise |
| Doc accuracy | docs match the current API |
| Padding | formatting-only churn dressed up as work |
| Placeholders | TODO comments left behind |

[Back to top](#navigate)

---

## 6. Filesystem reads

Reviewer's tool allowlist is read-only by design. Color: blue is read, purple is read plus write to log.

```mermaid
flowchart LR
    classDef read fill:#1e3a8a,color:#fff,stroke:#000
    classDef both fill:#581c87,color:#fff,stroke:#000
    classDef tmp fill:#374151,color:#fff,stroke:#000

    subgraph reads["READ (allowlist: Bash, Read, Glob, Grep, WebFetch)"]
        r1["CLAUDE.md\nproject conventions"]:::read
        r2["scripts/agents/config.sh\nshared bash helpers"]:::read
        r3["scripts/agents/prompts/reviewer.md\nthe review template"]:::read
        r4["src/, docs/, examples/, *.test.ts\nwhatever the diff touches"]:::read
        r5["package.json\nfor version sanity checks"]:::read
    end

    subgraph tmpfs["EPHEMERAL (runner-local, /tmp)"]
        t1["/tmp/review-prompt.txt\nassembled prompt"]:::tmp
    end

    subgraph both["READ + WRITE (only log file)"]
        b1["scripts/agents/logs/reviewer/&lt;ts&gt;.md\nclock_in writes skeleton\nclock_out updates status\nagent rewrites Summary blocks"]:::both
    end

    r2 --> b1
    r3 --> t1
    r2 --> t1
```

Notice what's missing: no `Write`, no `Edit` in the allowlist. The reviewer cannot modify source, tests, or docs. It can only emit GitHub side effects via the `gh` CLI through `Bash`, plus log file updates the action handles via its own GitHub identity.

Source: [.github/workflows/agent-review-pr.yml](../workflows/agent-review-pr.yml) line 62.

[Back to top](#navigate)

---

## 7. External calls

Who is contacted, with what credential, why.

```mermaid
flowchart LR
    classDef pre fill:#155e75,color:#fff,stroke:#000
    classDef llm fill:#581c87,color:#fff,stroke:#000
    classDef gh fill:#1f2937,color:#fff,stroke:#000
    classDef web fill:#064e3b,color:#fff,stroke:#000

    subgraph Pre["Before the reviewer starts"]
        c1["actions/create-github-app-token@v1\nauth: APP_ID + APP_PRIVATE_KEY\nwhy: bot identity to post reviews"]:::pre
        c2["actions/checkout@v4\nauth: bot token\nwhy: full history (depth 0)"]:::pre
        c3["actions/setup-node@v4\nauth: none\nwhy: prime npm cache (used by tools)"]:::pre
    end

    subgraph During["While the reviewer runs"]
        d1["api.anthropic.com\nauth: CLAUDE_CODE_OAUTH_TOKEN\nwhy: model inference (claude-opus-4-6)\ncost meter: --max-turns 30"]:::llm
        d2["api.github.com (gh CLI)\nauth: bot token\nwhy: gh pr diff/view/review/close"]:::gh
        d3["allowed_bots: llm-exe-bot[bot]\nwhy: lets the action operate on bot PRs\n(default action behavior skips bot PRs)"]:::gh
        d4["WebFetch (allowed but rarely used)\nauth: anonymous\nwhy: external link verification only"]:::web
    end

    c1 --> c2
    c2 --> c3
    c3 --> d1
    d1 --> d2
    d2 --> d3
    d1 --> d4
```

Tool allowlist passed to `claude-code-action@v1`:

```
--allowedTools "Bash,Read,Glob,Grep,WebFetch"
--max-turns 30
--model claude-opus-4-6
```

The `allowed_bots: "llm-exe-bot[bot]"` input is the load-bearing piece: by default the action refuses to run on PRs authored by bots. This explicit allowlist lets it review the very PRs `agent-run.yml` produces.

[Back to top](#navigate)

---

## 8. The verdict tree

Three outcomes. The prompt tells the model exactly which `gh` command to run for each.

```mermaid
flowchart TB
    classDef start fill:#1e3a8a,color:#fff,stroke:#000
    classDef dec fill:#7c2d12,color:#fff,stroke:#000
    classDef good fill:#064e3b,color:#fff,stroke:#000
    classDef bad fill:#9a3412,color:#fff,stroke:#000
    classDef close fill:#581c87,color:#fff,stroke:#000

    A["Reviewer has read diff,\ndescription, CLAUDE.md"]:::start
    A --> B{scope respected?}
    B -->|no| Q1{worth fixing?}
    B -->|yes| C{correctness ok?}

    C -->|no| Q2{fixable feedback?}
    C -->|yes| D{tests / docs meaningful?}

    D -->|no| Q3{salvageable?}
    D -->|yes| E[approve]:::good

    Q1 -->|yes| F[request-changes]:::bad
    Q1 -->|no| G[close]:::close
    Q2 -->|yes| F
    Q2 -->|no| G
    Q3 -->|yes| F
    Q3 -->|no| G

    E -->|gh pr review N --approve| OutA[("body: Reviewed by the reviewer agent...")]:::good
    F -->|gh pr review N --request-changes| OutB[("body: specific actionable feedback")]:::bad
    G -->|gh pr close N| OutC[("comment: reason, doesn't meet the bar")]:::close
```

Source: [scripts/agents/prompts/reviewer.md](../../scripts/agents/prompts/reviewer.md) lines 30-43.

The prompt explicitly forbids vague "consider improving" feedback. Request-changes bodies must say exactly what to fix.

[Back to top](#navigate)

---

## 9. Output cascade

What each verdict triggers downstream.

```mermaid
flowchart LR
    classDef src fill:#1e3a8a,color:#fff,stroke:#000
    classDef good fill:#064e3b,color:#fff,stroke:#000
    classDef bad fill:#9a3412,color:#fff,stroke:#000
    classDef close fill:#581c87,color:#fff,stroke:#000
    classDef cons fill:#374151,color:#fff,stroke:#000
    classDef human fill:#7c2d12,color:#fff,stroke:#000

    AR["agent-review-pr.yml\nverdict emitted"]:::src

    AR --> V1[approve]:::good
    AR --> V2[request-changes]:::bad
    AR --> V3[close]:::close

    V1 --> C1["PR enters 'approved' state\non GitHub"]:::cons
    C1 --> M1["maintainer sees green check\nin review queue"]:::human
    M1 --> M2["maintainer merges to development"]:::human
    M2 --> D1["draft-main-pr.yml\nupdates dev to main draft"]:::cons
    M2 --> D2["pack-package.yml\nuploads .tgz artifact"]:::cons

    V2 --> C2["PR stays open with\nrequest-changes review"]:::cons
    C2 --> N1["next agent-run for same role\nreads prior log + open PR feedback"]:::cons
    C2 --> M3["maintainer may close or fix\nmanually"]:::human

    V3 --> C3["PR closed, branch retained"]:::cons
    C3 --> N2["next agent-run starts fresh\nfrom development"]:::cons
    C3 --> X[("noise pruned without\nmaintainer attention")]:::cons

    AR --> L["reviewer log file committed\nscripts/agents/logs/reviewer/&lt;ts&gt;.md"]:::cons
    L --> DG["agent-digest.yml\nweekly summary includes reviews"]:::cons
```

The close verdict is the asymmetric value of this workflow: it discards low-quality bot output before a human ever sees it, which is the entire point of having an automated reviewer.

[Back to top](#navigate)

---

## 10. State machine

A single review run as a finite state machine.

```mermaid
stateDiagram-v2
    [*] --> Queued: PR opened on main or development
    Queued --> Filtered: job-level if evaluated
    Filtered --> Skipped: head_ref not starting with agent/
    Filtered --> Ready: head_ref starts with agent/
    Ready --> Booting: review job starts
    Booting --> Setup: checkout + node + npm ci
    Setup --> PromptBuilt: config.sh writes log skeleton + /tmp/review-prompt.txt
    PromptBuilt --> Running: claude-code-action started
    Running --> Reading: gh pr diff + gh pr view + CLAUDE.md
    Reading --> Analyzing: scope + correctness + test/doc quality
    Analyzing --> Approved: gh pr review --approve
    Analyzing --> RequestedChanges: gh pr review --request-changes
    Analyzing --> Closed: gh pr close
    Approved --> Logging: rewrite Summary / Files Changed / Next Steps
    RequestedChanges --> Logging
    Closed --> Logging
    Logging --> ClockOut: status mapped to exit code
    ClockOut --> Completed: exit 0
    ClockOut --> Interrupted: any non-zero
    Running --> TimedOut: 15-minute job timeout OR max-turns 30
    TimedOut --> ClockOut
    Skipped --> [*]
    Completed --> [*]
    Interrupted --> [*]
```

`if: always()` on the clock-out step means even `TimedOut` and `Interrupted` paths stamp a finish time. The reviewer log file is never left in `running` state.

[Back to top](#navigate)

---

## 11. Failure modes

Where things break, what happens, what to do.

```mermaid
flowchart TB
    classDef fail fill:#7c2d12,color:#fff,stroke:#000
    classDef effect fill:#374151,color:#fff,stroke:#000
    classDef fix fill:#064e3b,color:#fff,stroke:#000

    F1["Human opens PR from agent/* branch"]:::fail
    F1 --> F1E["filter still matches, reviewer runs\non a human PR"]:::effect
    F1E --> F1X["rename branch off agent/* prefix\nor accept the review as bonus signal"]:::fix

    F2["Bot token mint fails\nAPP_ID or APP_PRIVATE_KEY wrong"]:::fail
    F2 --> F2E["job fails at token step\nno log file written"]:::effect
    F2X["rotate App key, re-add secret"]:::fix
    F2E --> F2X

    F3["npm ci fails"]:::fail
    F3 --> F3E["job fails before reviewer starts"]:::effect
    F3X["check package-lock alignment"]:::fix
    F3E --> F3X

    F4["Claude hits --max-turns 30"]:::fail
    F4 --> F4E["reviewer returns whatever it has\nmay leave PR without a verdict"]:::effect
    F4X["maintainer reviews manually\nor re-runs the workflow"]:::fix
    F4E --> F4X

    F5["Job exceeds 15-minute timeout"]:::fail
    F5 --> F5E["runner kills the step\nclock_out still runs (if: always())\nstatus=interrupted in log"]:::effect
    F5X["re-run workflow on PR\nor maintainer reviews manually"]:::fix
    F5E --> F5X

    F6["Reviewer is wrong (false approve)"]:::fail
    F6 --> F6E["bad PR gets green check\nstill blocked by branch protection"]:::effect
    F6X["maintainer is final gate\nbranch protections require human merge"]:::fix
    F6E --> F6X

    F7["Reviewer is wrong (false close)"]:::fail
    F7 --> F7E["good PR gets closed\nbranch still on origin"]:::effect
    F7X["maintainer reopens manually\nor next agent-run resumes from log"]:::fix
    F7E --> F7X

    F8["allowed_bots input missing"]:::fail
    F8 --> F8E["claude-code-action refuses to act\non bot-authored PR"]:::effect
    F8X["keep allowed_bots: llm-exe-bot[bot]\nin yaml line 58"]:::fix
    F8E --> F8X

    F9["Anthropic API outage"]:::fail
    F9 --> F9E["claude-code-action returns error\nclock_out marks interrupted"]:::effect
    F9X["re-run workflow when API recovers"]:::fix
    F9E --> F9X
```

Critical asymmetry: a wrong approval is cheap because branch protection still requires human merge. A wrong close is more annoying but the branch persists on origin, so nothing is lost.

[Back to top](#navigate)

---

## 12. Quick reference card

```mermaid
flowchart LR
    classDef k fill:#1e3a8a,color:#fff,stroke:#000
    classDef v fill:#374151,color:#fff,stroke:#000

    K1["File"]:::k --- V1[".github/workflows/agent-review-pr.yml"]:::v
    K2["Trigger"]:::k --- V2["pull_request opened on main or development"]:::v
    K3["Job filter"]:::k --- V3["startsWith(head_ref, 'agent/')"]:::v
    K4["Permissions"]:::k --- V4["contents: read, PR/issues: write, id-token: write"]:::v
    K5["Timeout"]:::k --- V5["15 minutes"]:::v
    K6["Concurrency"]:::k --- V6["none (parallel reviews allowed)"]:::v
    K7["Identity"]:::k --- V7["llm-exe-bot[bot] via App token"]:::v
    K8["Model"]:::k --- V8["claude-opus-4-6"]:::v
    K9["Max turns"]:::k --- V9["30"]:::v
    K10["Tool allowlist"]:::k --- V10["Bash, Read, Glob, Grep, WebFetch (read-only)"]:::v
    K11["allowed_bots"]:::k --- V11["llm-exe-bot[bot]"]:::v
    K12["Verdicts"]:::k --- V12["approve, request-changes, close"]:::v
    K13["Prompt file"]:::k --- V13["scripts/agents/prompts/reviewer.md"]:::v
    K14["Assembled prompt"]:::k --- V14["/tmp/review-prompt.txt"]:::v
    K15["Substitutions"]:::k --- V15["$PR_NUMBER, $LOG_FILE"]:::v
    K16["Log path"]:::k --- V16["scripts/agents/logs/reviewer/&lt;ts&gt;.md"]:::v
```

Direct links:

- Workflow file: [.github/workflows/agent-review-pr.yml](../workflows/agent-review-pr.yml)
- Upstream producer: [agent-run.yml](../workflows/agent-run.yml) and [coder-run.yml](../workflows/coder-run.yml)
- Reviewer prompt: [scripts/agents/prompts/reviewer.md](../../scripts/agents/prompts/reviewer.md)
- Shared helpers: [scripts/agents/config.sh](../../scripts/agents/config.sh)
- Companion deep dive: [AGENT_RUN_DEEP_DIVE.md](AGENT_RUN_DEEP_DIVE.md)
- Full architecture doc: [WORKFLOW_ARCHITECTURE.md](WORKFLOW_ARCHITECTURE.md)

[Back to top](#navigate)
