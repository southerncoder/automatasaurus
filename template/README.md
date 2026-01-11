# Automatasaurus Framework Files

This folder contains the Automatasaurus framework - an automated software development workflow powered by GitHub Copilot CLI.

**Do not edit files in this folder directly.** They are managed by the installer and will be overwritten on updates.

## What's Here

| Folder | Purpose |
|--------|---------|
| `agents/` | Specialized AI personas (Developer, Architect, Tester, etc.) |
| `skills/` | Knowledge modules (coding standards, workflows, etc.) |
| `hooks/` | Shell scripts for notifications and workflow control |
| `commands/` | Prompt templates used by the Automatasaurus CLI (discovery/planning) |

## How It Works

Files in `.github/` (agents/skills) are symlinked to this folder. When you run:

```bash
npx automatasaurus update
```

This folder gets updated and symlinks are refreshed.

## Customization

- **Add your own agents/skills**: Create files directly in `.claude/agents/` or `.claude/skills/` (not symlinks)
- **Add your own agents/skills**: Create files directly in `.github/agents/` or `.github/skills/` (not symlinks)
- **Project commands**: Edit `.github/automatasaurus-commands.md` outside the marked block

## Learn More

- GitHub: https://github.com/[your-org]/automatasaurus
- Run `npx automatasaurus status` to see installation info
- Run `npx automatasaurus --help` for available commands
