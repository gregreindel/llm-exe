# Maintenance Agents

Automated agents that maintain the llm-exe repo — docs, tests, code fixes, and user-perspective QA.

## What runs automatically

**Daily at 6am UTC** — the `agent-run` workflow runs all agents in order:

| Step | Agent | What it does |
|------|-------|-------------|
| 1 | `all` | Runs 4 persona agents (beginner, harsh-critic, speed-runner, enterprise) then the curator reviews their findings and files issues |
| 2 | `docs` | Checks docs accuracy, opens a PR with fixes |
| 3 | `tester` | Finds coverage gaps, opens a PR with new tests |
| 4 | `coder` | Picks up an open issue, opens a PR with a fix |

**On agent PRs** — when any agent opens a PR from an `agent/*` branch, the `agent-review-pr` workflow triggers the reviewer agent to approve or request changes.

Each agent gets a 10-minute time budget with a hard timeout.

## What you do

1. **Check PRs** — agents open PRs, the reviewer reviews them, but only you can merge. Look at the changes and the review, then merge or close.
2. **Check issues** — the curator files issues from persona findings. Triage them like any other issue.
3. **Monitor runs** — check the Actions tab if something seems off. Agent logs are in `scripts/agents/logs/`.

## Running manually

```bash
./scripts/maintain.sh docs
./scripts/maintain.sh tester
./scripts/maintain.sh coder
./scripts/maintain.sh beginner       # single persona
./scripts/maintain.sh personas       # all personas
./scripts/maintain.sh curator
./scripts/maintain.sh all            # personas + curator
./scripts/maintain.sh review 42      # review PR #42

# From GitHub Actions (non-interactive)
# Go to Actions → Agent Run → Run workflow → pick an agent
```

## File structure

```
scripts/
  maintain.sh                    # Entry point
  agents/
    config.sh                    # Shared helpers (run_claude, clock_in/out, etc.)
    README.md                    # This file
    prompts/
      docs.md                    # Docs agent prompt
      tester.md                  # Test agent prompt
      coder.md                   # Code agent prompt
      curator.md                 # Curator prompt
      reviewer.md                # PR reviewer prompt
      _persona.md                # Base persona template
      personas/
        beginner.md
        harsh-critic.md
        speed-runner.md
        enterprise.md

    logs/                          # Agent log files (committed to repo)

.github/workflows/
  agent-run.yml                  # Daily schedule + manual dispatch
  agent-review-pr.yml            # Auto-review agent PRs
```
