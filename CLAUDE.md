# Automatasaurus - Claude Code Automation Framework

This project is an automated software development workflow powered by Claude Code. It uses specialized subagents, stop hooks, and skills to coordinate work across multiple personas.

## Project Overview

Automatasaurus enables extended, autonomous software development sessions by coordinating multiple specialized agents that work together through GitHub issues and PRs.

**This repository contains the workflow orchestration framework.** It is designed to be installed into target projects as a CLI tool.

## Project Commands

**IMPORTANT**: Always check `.claude/commands.md` for project-specific commands before running any development, test, or build commands. Each target project will have its own commands configured.

Common command categories:
- `install` - Install dependencies
- `dev` - Start development server
- `test` - Run tests
- `test:e2e` - Run E2E tests with Playwright
- `build` - Build for production
- `lint` - Check code style

## Personas/Agents

The following agents are available in `.claude/agents/`:

| Agent | Role | Model | Special Tools |
|-------|------|-------|---------------|
| `product-owner` | Requirements, user stories, acceptance criteria | Opus | GitHub CLI |
| `product-manager` | Roadmap, milestones, release coordination | Sonnet | GitHub CLI |
| `architect` | System design, ADRs, technical decisions | Opus | - |
| `developer` | Feature implementation, bug fixes, PRs | Sonnet | Full edit access |
| `tester` | Test planning, automated tests, QA, E2E testing | Sonnet | Playwright MCP |
| `secops` | Security reviews, vulnerability assessment | Opus | - |
| `ui-ux` | User experience, accessibility, design specs | Sonnet | - |

## MCP Integrations

### Playwright MCP
The tester agent has access to Playwright MCP for browser-based testing:
- Visual verification of UI changes
- E2E user flow testing
- Screenshot capture
- Interactive debugging

Usage: `Use playwright mcp to open a browser to [URL]`

## Workflow Coordination

Work is coordinated through GitHub:
- **Issues**: Track features, bugs, and tasks
- **Pull Requests**: Code changes with reviews
- **Milestones**: Group related work for releases
- **Labels**: Categorize and prioritize work

## Stop Hook Behavior

The system uses intelligent stop hooks to ensure:
1. Tasks are fully completed before stopping
2. All relevant personas have been consulted
3. Work is properly documented in GitHub
4. No errors or failing tests remain

## Development Conventions

### Git Workflow
- Branch naming: `feature/issue-123-description`, `fix/issue-456-bug-name`
- Commit messages: `feat: description (#123)`, `fix: description (#456)`
- PRs require review and passing tests before merge

### Code Style
- Follow existing patterns in the codebase
- Keep functions small and focused
- Write tests for new functionality
- Handle errors appropriately

### Documentation
- Update README for user-facing changes
- Create ADRs for significant architectural decisions
- Document APIs and complex logic

## Agent Invocation

Agents can be invoked explicitly:
```
Use the architect agent to design the authentication system
Use the secops agent to review this PR for security issues
Use the tester agent to create a test plan for this feature
Use the tester agent with playwright to verify the login flow
```

Or they are automatically selected based on task context.

## GitHub Integration

This project uses the `gh` CLI for GitHub operations. Ensure you are authenticated:
```bash
gh auth status
```

## Skills

Available skills in `.claude/skills/`:

### Workflow Skills
- `github-workflow` - Issue and PR templates, milestone management
- `agent-coordination` - Multi-agent workflow patterns
- `project-commands` - Finding and using project-specific commands
- `notifications` - User notification system for questions, approvals, and alerts

### Language Standards
- `python-standards` - Python coding conventions, typing, testing patterns
- `javascript-standards` - JS/TS conventions, React patterns, testing
- `css-standards` - CSS/SCSS conventions, layouts, accessibility

**Note**: Load the appropriate language skill before writing code in that language.

## Notification System

Agents can alert the user when attention is needed:

```bash
# Question that blocks progress
.claude/hooks/request-attention.sh question "Which approach should I take?"

# Approval needed
.claude/hooks/request-attention.sh approval "PR is ready for review"

# Got stuck
.claude/hooks/request-attention.sh stuck "Cannot resolve this error"

# Work complete
.claude/hooks/request-attention.sh complete "All tasks finished"
```

Notifications are also sent automatically on stop based on context.
