# Automatasaurus (Copilot CLI)

This repository uses Automatasaurus, an AI-assisted workflow for building software via GitHub Issues and PRs.

## How to use (Copilot CLI)

- Keep project-specific build/test commands in `.github/automatasaurus-commands.md`.
- Use `npx automatasaurus discovery`, `work-plan`, `work`, and `work-all` to run the workflow using GitHub Copilot CLI.

## Conventions

### Required identity header

All GitHub comments, issue bodies, PR descriptions, and reviews MUST start with the agent identity header:

- `**[Product Owner]**`
- `**[Developer]**`
- `**[Architect]**`
- `**[Designer]**`
- `**[Tester]**`

### Review markers (for automation)

When reviewing PRs, use these exact markers on their own line:

- `✅ APPROVED - Architect`
- `❌ CHANGES REQUESTED - Architect`
- `✅ APPROVED - Designer`
- `❌ CHANGES REQUESTED - Designer`
- `✅ APPROVED - Tester`
- `❌ CHANGES REQUESTED - Tester`

### Branch naming

Use `{issue-number}-{slug}` (example: `42-user-authentication`).

### PR requirements

- PR body includes `Closes #<issue>`
- Mention tests run (or why not)

## Skills

Automatasaurus provides skills under `.github/skills/` (symlinked from `.automatasaurus/`). Load them when relevant, especially:

- `workflow-orchestration`
- `github-workflow`
- `github-issues`
- `pr-writing`
- language standards (`python-standards`, `javascript-standards`, `css-standards`)
