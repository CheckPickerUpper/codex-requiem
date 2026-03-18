# Codex Requiem

<p align="center">
  <img src="logo.png" alt="Codex Requiem" width="400" />
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![GitHub Stars](https://img.shields.io/github/stars/CheckPickerUpper/codex-requiem)
![Last Commit](https://img.shields.io/github/last-commit/CheckPickerUpper/codex-requiem)
![Fork](https://img.shields.io/badge/Fork-skills--directory%2Fskill--codex-blue)

An evolved fork of [skill-codex](https://github.com/skills-directory/skill-codex); Codex CLI integration for Claude Code, pierced by the Requiem arrow.

## What is this?

A Claude Code plugin that lets you invoke OpenAI's Codex CLI (`codex exec`) from within Claude Code for code analysis, refactoring, and editing workflows.

## Prerequisites

- `codex` CLI installed and on `PATH`
- Codex configured with valid credentials
- Verify with `codex --version`

## Installation

```
/plugin marketplace add CheckPickerUpper/codex-requiem
/plugin install codex-requiem@skill-codex
```

Or standalone:

```bash
git clone --depth 1 git@github.com:CheckPickerUpper/codex-requiem.git /tmp/codex-requiem && \
mkdir -p ~/.claude/skills && \
cp -r /tmp/codex-requiem/plugins/skill-codex/skills/codex ~/.claude/skills/codex && \
rm -rf /tmp/codex-requiem
```

## Usage

Prompt Claude Code naturally:

```
Use codex to analyze this repository and suggest improvements.
```

Claude will:
1. Ask which model to use (`gpt-5.3-codex-spark`, `gpt-5.3-codex`, or `gpt-5.2`)
2. Ask reasoning effort level (`low`, `medium`, `high`)
3. Pick a sandbox mode; defaults to `read-only` for analysis
4. Run Codex via the cross-platform wrapper and summarize the results

Thinking tokens are suppressed by default. Ask Claude to show them if you need to debug.

See [`plugins/skill-codex/skills/codex/SKILL.md`](plugins/skill-codex/skills/codex/SKILL.md) for full operational docs.

## What's different from upstream?

- **Cross-platform wrapper** (`codex-run.js`) — replaces bash-only `2>/dev/null` and `echo | pipe` patterns; works on Windows, macOS, and Linux
- More improvements planned — see [ROADMAP.md](ROADMAP.md)

## Upstream

Forked from [skills-directory/skill-codex](https://github.com/skills-directory/skill-codex). Original work by skills-directory under MIT.

## License

MIT — see [LICENSE](LICENSE).
