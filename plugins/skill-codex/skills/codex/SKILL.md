---
name: codex
description: Use when the user asks to run Codex CLI (codex exec, codex resume) or references OpenAI Codex for code analysis, refactoring, or automated editing
---

# Codex Skill Guide

## Cross-Platform Wrapper

This skill uses `codex-run.js` for portable execution across Windows, macOS, and Linux. The wrapper handles stderr suppression, prompt piping, and argument assembly without shell-specific syntax.

The wrapper lives at: `plugins/skill-codex/scripts/codex-run.js`

Run it via: `node <path-to-wrapper>/codex-run.js [options] --prompt <text>`

To resolve the wrapper path, use `${CLAUDE_PLUGIN_ROOT}` if available, otherwise locate it relative to this skill file at `../../scripts/codex-run.js`.

## Running a Task
1. Ask the user (via `AskUserQuestion`) which model to run (`gpt-5.3-codex-spark`, `gpt-5.3-codex`, or `gpt-5.2`) AND which reasoning effort to use (`xhigh`, `high`, `medium`, or `low`) in a **single prompt with two questions**.
2. Select the sandbox mode required for the task; default to `--sandbox read-only` unless edits or network access are necessary.
3. Assemble the command using the wrapper:
   ```
   node codex-run.js -m <MODEL> --reasoning <LEVEL> --sandbox <MODE> --full-auto -C <DIR> --prompt <TEXT>
   ```
4. Always use the wrapper instead of raw `codex exec` — it handles stderr suppression and cross-platform piping automatically.
5. When continuing a previous session, use the `--resume` flag:
   ```
   node codex-run.js --resume --prompt "your follow-up prompt here"
   ```
6. To show thinking tokens for debugging, add `--show-stderr`.
7. Run the command, capture stdout, and summarize the outcome for the user.
8. **After Codex completes**, inform the user: "You can resume this Codex session at any time by saying 'codex resume' or asking me to continue with additional analysis or changes."

### Wrapper Options
| Option | Description |
| --- | --- |
| `-m, --model <MODEL>` | Codex model to use |
| `--reasoning <LEVEL>` | Reasoning effort: xhigh, high, medium, low |
| `--sandbox <MODE>` | read-only (default), workspace-write, danger-full-access |
| `--full-auto` | Enable full-auto mode |
| `-C, --dir <DIR>` | Working directory |
| `--resume` | Resume last session (prompt piped via stdin automatically) |
| `--show-stderr` | Show thinking tokens instead of suppressing |
| `--prompt <TEXT>` | Prompt text (required, must be last option) |

### Quick Reference
| Use case | Command |
| --- | --- |
| Read-only analysis | `node codex-run.js -m MODEL --reasoning LEVEL --sandbox read-only -C DIR --prompt "..."` |
| Apply local edits | `node codex-run.js -m MODEL --reasoning LEVEL --sandbox workspace-write --full-auto -C DIR --prompt "..."` |
| Full access | `node codex-run.js -m MODEL --reasoning LEVEL --sandbox danger-full-access --full-auto -C DIR --prompt "..."` |
| Resume session | `node codex-run.js --resume --prompt "follow-up prompt"` |
| Debug with stderr | `node codex-run.js --show-stderr -m MODEL --reasoning LEVEL --prompt "..."` |

## Following Up
- After every `codex` command, immediately use `AskUserQuestion` to confirm next steps, collect clarifications, or decide whether to resume.
- When resuming, use `--resume`: `node codex-run.js --resume --prompt "new prompt"`. The resumed session automatically uses the same model, reasoning effort, and sandbox mode from the original session.
- Restate the chosen model, reasoning effort, and sandbox mode when proposing follow-up actions.

## Critical Evaluation of Codex Output

Codex is powered by OpenAI models with their own knowledge cutoffs and limitations. Treat Codex as a **colleague, not an authority**.

### Guidelines
- **Trust your own knowledge** when confident. If Codex claims something you know is incorrect, push back directly.
- **Research disagreements** using WebSearch or documentation before accepting Codex's claims. Share findings with Codex via resume if needed.
- **Remember knowledge cutoffs** - Codex may not know about recent releases, APIs, or changes that occurred after its training data.
- **Don't defer blindly** - Codex can be wrong. Evaluate its suggestions critically, especially regarding:
  - Model names and capabilities
  - Recent library versions or API changes
  - Best practices that may have evolved

### When Codex is Wrong
1. State your disagreement clearly to the user
2. Provide evidence (your own knowledge, web search, docs)
3. Optionally resume the Codex session to discuss the disagreement. **Identify yourself as Claude** so Codex knows it's a peer AI discussion:
   ```
   node codex-run.js --resume --prompt "This is Claude (<your current model name>) following up. I disagree with [X] because [evidence]. What's your take on this?"
   ```
4. Frame disagreements as discussions, not corrections - either AI could be wrong
5. Let the user decide how to proceed if there's genuine ambiguity

## Error Handling
- Stop and report failures whenever `codex --version` or a wrapper command exits non-zero; request direction before retrying.
- Before you use high-impact flags (`--full-auto`, `--sandbox danger-full-access`) ask the user for permission using AskUserQuestion unless it was already given.
- When output includes warnings or partial results, summarize them and ask how to adjust using `AskUserQuestion`.
