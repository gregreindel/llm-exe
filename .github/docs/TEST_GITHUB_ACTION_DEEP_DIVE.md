# Test GitHub Action: Visual Deep Dive

Concentrated diagrams for [.github/workflows/test-github-action.yml](../workflows/test-github-action.yml). Companion to [WORKFLOW_ARCHITECTURE.md](WORKFLOW_ARCHITECTURE.md).

This workflow smoke-tests the external [llm-exe/github-action](https://github.com/llm-exe/github-action) by running a single LLM call and asserting the output. It is dispatch-only and intentionally minimal. Minimum prose. Maximum diagrams.

## Navigate

- [1. The whole picture](#1-the-whole-picture)
- [2. Triggers](#2-triggers)
- [3. The one-job DAG](#3-the-one-job-dag)
- [4. Step-by-step lifecycle](#4-step-by-step-lifecycle)
- [5. Output cascade](#5-output-cascade)
- [6. Failure modes](#6-failure-modes)
- [7. Quick reference card](#7-quick-reference-card)

---

## 1. The whole picture

How [test-github-action.yml](../workflows/test-github-action.yml) fits into the repo.

```mermaid
flowchart LR
    classDef trig fill:#0b3954,color:#fff,stroke:#000
    classDef job fill:#1e3a8a,color:#fff,stroke:#000
    classDef ext fill:#064e3b,color:#fff,stroke:#000
    classDef file fill:#374151,color:#fff,stroke:#000
    classDef out fill:#581c87,color:#fff,stroke:#000

    subgraph T["Triggers"]
        d1["workflow_dispatch\ninputs: provider + model"]:::trig
    end

    subgraph A["test-github-action.yml"]
        J["smoke job\ntimeout 5m"]:::job
    end

    subgraph S["Secrets"]
        s1["OPENAI_API_KEY"]:::file
        s2["ANTHROPIC_API_KEY"]:::file
    end

    subgraph X["External"]
        ga["llm-exe/github-action@v1"]:::ext
        llm["LLM provider API\n(OpenAI or Anthropic)"]:::ext
    end

    subgraph O["Outputs"]
        o1["pass/fail status\n(no artifacts)"]:::out
    end

    d1 --> J
    s1 --> J
    s2 --> J
    J --> ga
    ga --> llm
    ga --> o1
```

This workflow is standalone. It does not trigger any downstream workflows, does not produce artifacts, and does not interact with GitHub issues or PRs.

[Back to top](#navigate)

---

## 2. Triggers

One entry point. No cron, no PR events.

```mermaid
flowchart TB
    classDef manual fill:#9333ea,color:#fff,stroke:#000
    classDef out fill:#1f2937,color:#fff,stroke:#000

    start([event arrives])
    start --> ev{event_name?}
    ev -->|workflow_dispatch| disp["manual run\nprovider + model selected"]:::manual
    disp --> proceed[(run smoke job)]:::out
```

| Input | Type | Required | Default | Options |
|-------|------|----------|---------|---------|
| `provider` | choice | yes | `openai.chat.v1` | `openai.chat.v1`, `anthropic.chat.v1` |
| `model` | string | yes | `gpt-4o-mini` | any model string the chosen provider supports |

Source: [.github/workflows/test-github-action.yml](../workflows/test-github-action.yml) lines 3-16.

[Back to top](#navigate)

---

## 3. The one-job DAG

Single linear job. No matrix, no gates.

```mermaid
flowchart TB
    classDef job fill:#1e3a8a,color:#fff,stroke:#000
    classDef step fill:#374151,color:#fff,stroke:#000

    start([workflow_dispatch])
    start --> J

    subgraph J["Job: smoke (ubuntu-latest, timeout-minutes: 5)"]
        direction TB
        s1["Run llm-exe action\nllm-exe/github-action@v1\nprovider + model from inputs"]:::step
        s2["Assert action output\ncheck result + json are non-empty\nvalidate expected text"]:::step
        s3["Print result"]:::step
        s1 --> s2 --> s3
    end
```

Permissions are read-only: `contents: read`. This job calls an external LLM API through the GitHub Action and checks the response. No writes to the repo.

[Back to top](#navigate)

---

## 4. Step-by-step lifecycle

One run from dispatch to assertion.

```mermaid
sequenceDiagram
    autonumber
    participant D as Dispatcher
    participant J as smoke job
    participant GA as llm-exe/github-action@v1
    participant LLM as LLM provider API
    participant A as Assert step

    D->>J: workflow_dispatch (provider, model)
    J->>GA: uses llm-exe/github-action@v1
    Note over GA: with: provider, model, system, message, data, parser
    Note over GA: env: OPENAI_API_KEY, ANTHROPIC_API_KEY
    GA->>LLM: send prompt via llm-exe
    LLM-->>GA: response text
    GA-->>J: outputs.result (string), outputs.json (JSON)
    J->>A: check RESULT is non-empty
    J->>A: check JSON_RESULT is non-empty
    J->>A: assert RESULT contains "llm-exe action smoke test for GitHub Actions"
    A-->>J: pass or fail (exit 0 or exit 1)
    J->>J: echo result
```

The action receives a Handlebars-templated message (`"Return exactly this text and nothing else: llm-exe action smoke test for {{name}}"`) with data `{"name": "GitHub Actions"}`. The assertion checks the response contains the expected rendered string.

Source: [.github/workflows/test-github-action.yml](../workflows/test-github-action.yml) lines 24-64.

[Back to top](#navigate)

---

## 5. Output cascade

What this workflow produces and who eats it.

```mermaid
flowchart LR
    classDef src fill:#1e3a8a,color:#fff,stroke:#000
    classDef out fill:#581c87,color:#fff,stroke:#000

    TGA["test-github-action.yml\nrun completes"]:::src
    TGA --> O1["pass/fail check status\n(no artifacts, no PRs, no issues)"]:::out
    O1 --> H1["maintainer observes\naction is working"]:::out
```

This is a pure verification workflow. It produces no artifacts, files no issues, and triggers no downstream workflows. Its only output is the job's pass/fail status, which tells the maintainer whether the external `llm-exe/github-action` is functioning correctly with the selected provider and model.

[Back to top](#navigate)

---

## 6. Failure modes

Where this workflow can break and what falls out.

```mermaid
flowchart TB
    classDef fail fill:#7c2d12,color:#fff,stroke:#000
    classDef effect fill:#374151,color:#fff,stroke:#000
    classDef fix fill:#064e3b,color:#fff,stroke:#000

    F1["Provider API key missing or invalid"]:::fail
    F1 --> F1E["llm-exe action fails\nno response returned"]:::effect
    F1E --> F1X["check OPENAI_API_KEY or\nANTHROPIC_API_KEY secret"]:::fix

    F2["LLM returns unexpected text"]:::fail
    F2 --> F2E["assertion step fails\nexit 1 on case mismatch"]:::effect
    F2E --> F2X["model may not follow instructions precisely\ntry a different model or adjust assertion"]:::fix

    F3["llm-exe/github-action@v1 broken"]:::fail
    F3 --> F3E["action itself errors\nno outputs set"]:::effect
    F3E --> F3X["check llm-exe/github-action repo\nfor breaking changes"]:::fix

    F4["Provider API outage"]:::fail
    F4 --> F4E["timeout or error from provider"]:::effect
    F4E --> F4X["wait and re-dispatch"]:::fix

    F5["5-minute timeout exceeded"]:::fail
    F5 --> F5E["runner kills the job"]:::effect
    F5E --> F5X["provider latency issue\nre-dispatch later"]:::fix
```

[Back to top](#navigate)

---

## 7. Quick reference card

```mermaid
flowchart LR
    classDef k fill:#1e3a8a,color:#fff,stroke:#000
    classDef v fill:#374151,color:#fff,stroke:#000

    K1["File"]:::k --- V1[".github/workflows/test-github-action.yml"]:::v
    K2["Triggers"]:::k --- V2["workflow_dispatch only"]:::v
    K3["Inputs"]:::k --- V3["provider (choice), model (string)"]:::v
    K4["Permissions"]:::k --- V4["contents: read"]:::v
    K5["Runner"]:::k --- V5["ubuntu-latest"]:::v
    K6["Timeout"]:::k --- V6["5 minutes"]:::v
    K7["Concurrency"]:::k --- V7["not set"]:::v
    K8["Secrets used"]:::k --- V8["OPENAI_API_KEY, ANTHROPIC_API_KEY"]:::v
    K9["External action"]:::k --- V9["llm-exe/github-action@v1"]:::v
    K10["Job count"]:::k --- V10["1 (smoke)"]:::v
    K11["Matrix"]:::k --- V11["none"]:::v
    K12["Artifacts"]:::k --- V12["none"]:::v
    K13["Downstream"]:::k --- V13["none"]:::v
```

Direct links:

- Workflow file: [.github/workflows/test-github-action.yml](../workflows/test-github-action.yml)
- External action: [llm-exe/github-action](https://github.com/llm-exe/github-action)
- Full architecture doc: [WORKFLOW_ARCHITECTURE.md](WORKFLOW_ARCHITECTURE.md)

[Back to top](#navigate)
