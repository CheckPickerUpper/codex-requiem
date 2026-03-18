# Codex Requiem — Roadmap

What separates this fork from upstream skill-codex; the Requiem arrow evolves the Stand.

## 1. Cross-Platform Wrapper

The current SKILL.md uses raw bash (`2>/dev/null`, pipe via `echo`). This breaks on Windows/Pwsh.

- ~~Create `plugins/skill-codex/scripts/codex-run.js`~~ DONE
- ~~Handle stderr suppression portably~~ DONE
- ~~Handle prompt piping without shell-specific syntax~~ DONE
- ~~Update SKILL.md to use the wrapper~~ DONE
- ~~Test on Windows~~ DONE
- Test on macOS/Linux (community)

## 2. Dynamic Model Discovery

The skill hardcodes `gpt-5.3-codex-spark`, `gpt-5.3-codex`, `gpt-5.2`. These will go stale.

- Query `codex` CLI at runtime for available models
- Cache results in `.codex-requiem/cache/models.json`
- Present actual available models to `AskUserQuestion` dynamically
- Fall back to hardcoded list if discovery fails

## 3. Structured JSON Output

Raw text output forces Claude to guess at structure when summarizing. A schema fixes that.

- Define output schema: `summary`, `files_changed`, `commands_run`, `risks`, `next_steps`
- Prepend schema instruction to Codex prompts automatically
- Validate JSON in the wrapper; fall back to raw text if invalid
- Optionally persist runs to `.codex-requiem/runs/<session-id>.json`

## 4. Safe Edit Pipeline

`workspace-write` + `--full-auto` is powerful but risky without guardrails.

- Add `.codex-requiem.yaml` for repo-specific preflight/postflight checks
- Preflight: assert clean `git status`, snapshot baseline commit
- Postflight: `git diff` summary, run configured checks (lint, test, typecheck)
- On failure: offer auto-revert to baseline and rerun with tighter constraints
- Update SKILL.md so write mode implies this pipeline by default

## 5. PR Review Workflow

Turn "review this PR" into a single command instead of manual copy/paste.

- New skill at `plugins/skill-codex/skills/codex-pr-review/SKILL.md`
- Accept PR URL or number as input
- Fetch context via `gh pr diff` / `gh pr view`
- Run Codex in read-only to generate review formatted as GitHub comments
- Optionally post via `gh pr review --comment` behind explicit confirmation

