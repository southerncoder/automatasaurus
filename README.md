# Automatasaurus

An automated software development workflow powered by Claude Code. Uses specialized subagents, stop hooks, and skills to enable extended autonomous development sessions with multiple coordinated personas.

## Overview

Automatasaurus creates a team of AI personas that work together through GitHub issues and PRs to build software. Each persona has specific expertise and responsibilities, and they coordinate their work using established software development practices.

**This repository contains the workflow orchestration framework.** Install it into your project to enable AI-assisted software development with coordinated agents.

## Personas

| Persona | Expertise | Responsibilities |
|---------|-----------|------------------|
| **Product Owner** | Requirements | User stories, acceptance criteria, backlog prioritization |
| **Product Manager** | Coordination | Roadmaps, milestones, release planning, stakeholder communication |
| **Architect** | Design | System design, ADRs, technology decisions, patterns |
| **Developer** | Implementation | Feature development, bug fixes, PRs, code quality |
| **Tester** | Quality | Test planning, automated tests, E2E testing with Playwright |
| **SecOps** | Security | Security reviews, vulnerability assessment, compliance |
| **UI/UX Designer** | Experience | User flows, component specs, accessibility |

## Features

- **Stop Hooks**: Intelligent evaluation ensures tasks are complete before stopping
- **Subagent Coordination**: Specialized agents for each role with appropriate tools and models
- **GitHub Integration**: All work coordinated through issues, PRs, and milestones
- **Playwright MCP**: Browser automation for E2E testing and visual verification
- **Notifications**: Desktop alerts when agents need attention, approval, or finish work
- **Language Skills**: On-demand coding standards for Python, JavaScript, CSS
- **Project Commands**: Configurable commands for any project stack
- **Extended Sessions**: Designed for autonomous work over extended periods

## Prerequisites

- [Claude Code CLI](https://claude.ai/code) installed and authenticated
- [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- Node.js (for Playwright MCP and npm-based projects)

**GitHub CLI Setup:**
```bash
# Install (macOS)
brew install gh

# Authenticate
gh auth login

# Verify
gh auth status
```

The agents use GitHub CLI to create issues, pull requests, manage milestones, and coordinate work.

## Project Structure

```
automatasaurus/
├── CLAUDE.md                              # Claude Code project context
├── README.md                              # This file
├── .mcp.json                              # MCP server configuration (Playwright)
└── .claude/
    ├── settings.json                      # Claude Code settings with hooks
    ├── commands.md                        # Project-specific commands
    ├── commands.template.md               # Template for new projects
    ├── hooks/                             # Notification and stop hooks
    │   ├── notify.sh                      # Desktop notification system
    │   ├── on-stop.sh                     # Auto-notify on stop
    │   └── request-attention.sh           # Explicit attention requests
    ├── agents/                            # Persona subagents
    │   ├── product-owner/
    │   ├── product-manager/
    │   ├── architect/
    │   ├── developer/
    │   ├── tester/                        # Includes Playwright MCP access
    │   ├── secops/
    │   └── ui-ux/
    └── skills/                            # Reusable skills
        ├── github-workflow/               # Issue/PR management
        ├── agent-coordination/            # Multi-agent patterns
        ├── project-commands/              # Command discovery
        ├── notifications/                 # Alert system docs
        ├── python-standards/              # Python conventions
        ├── javascript-standards/          # JS/TS conventions
        └── css-standards/                 # CSS/SCSS conventions
```

## Installation

### Future: CLI Tool (Coming Soon)

```bash
# Install globally
npm install -g automatasaurus

# Initialize in your project
cd your-project
automatasaurus init
```

### Current: Manual Installation

1. Clone this repository
2. Copy the `.claude` folder and `.mcp.json` to your project
3. Customize `.claude/commands.md` with your project's commands
4. Ensure GitHub CLI is authenticated: `gh auth status`
5. Start Claude Code:

```bash
claude
```

## Configuration

### Project Commands

After installation, edit `.claude/commands.md` to configure your project's commands:

```markdown
## Quick Reference

| Action | Command |
|--------|---------|
| Install dependencies | `npm install` |
| Start development server | `npm run dev` |
| Run all tests | `npm test` |
| Run E2E tests | `npx playwright test` |
```

A template is provided in `.claude/commands.template.md` with placeholders for common stacks.

### MCP Servers

The `.mcp.json` file configures Playwright for browser testing:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Notifications

Configure notification behavior via environment variables:

```bash
# Disable sound alerts
export AUTOMATASAURUS_SOUND=false

# Custom log location
export AUTOMATASAURUS_LOG=/path/to/log
```

## Usage

### Starting a Session

```bash
claude
```

### High-Level Requests

Begin with a high-level request:

```
Create a user authentication system with login, logout, and password reset
```

The system will automatically:
- Break down requirements (Product Owner)
- Design the architecture (Architect)
- Review security implications (SecOps)
- Implement the solution (Developer)
- Write and run tests (Tester with Playwright)
- Create GitHub issues and PRs along the way
- Notify you when questions arise or work completes

### Invoking Specific Agents

```
Use the architect agent to review the database schema
Use the secops agent to audit our dependencies
Use the tester agent to create a test plan for the API
Use the tester agent with playwright to verify the checkout flow
```

### Browser Testing with Playwright

The tester agent can perform visual verification:

```
Use playwright mcp to open a browser to http://localhost:3000
Use playwright mcp to click the login button
Use playwright mcp to fill the email field with test@example.com
Use playwright mcp to take a screenshot
```

## Notifications

Agents send desktop notifications when they need your attention:

| Type | Trigger | Sound |
|------|---------|-------|
| **Question** | Agent has a blocking question | Submarine |
| **Approval** | PR or decision needs approval | Submarine |
| **Stuck** | Agent encountered an issue | Basso |
| **Complete** | All work finished | Hero |

Agents can also explicitly request attention:
```bash
.claude/hooks/request-attention.sh question "Which database should we use?"
.claude/hooks/request-attention.sh complete "Feature implementation done"
```

## How It Works

### Stop Hooks

The system uses prompt-based stop hooks that evaluate:
- Has the task been fully completed?
- Are there errors or failing tests?
- Has work been documented in GitHub?
- Have relevant personas been consulted?

If any checks fail, Claude continues working rather than stopping prematurely.

### Subagent Stop Hooks

Each persona has their own stop evaluation to ensure they've fulfilled their role before handing off to the next persona in the workflow.

### Workflow Patterns

**New Feature:**
```
Product Owner → Architect → UI/UX → SecOps → Developer → Tester → Product Owner (accept)
```

**Bug Fix:**
```
Tester → Developer → (Architect if complex) → Tester (verify)
```

**Security Issue:**
```
SecOps → Architect → Developer → SecOps (verify)
```

## Language Skills

The developer agent loads language-specific skills on demand:

| Language | Skill | Covers |
|----------|-------|--------|
| Python | `python-standards` | PEP 8, type hints, pytest, async patterns |
| JavaScript/TypeScript | `javascript-standards` | ESM, React, testing, error handling |
| CSS/SCSS | `css-standards` | BEM, CSS variables, flexbox/grid, accessibility |

Skills are loaded automatically based on the files being worked on.

## Customization

### Adding a New Persona

1. Create `.claude/agents/<persona-name>/AGENT.md`
2. Define the frontmatter:
   ```yaml
   ---
   name: persona-name
   description: When to use this agent
   tools: Read, Edit, Write, Bash, Grep, Glob
   model: sonnet
   ---
   ```
3. Write a detailed system prompt
4. Update `CLAUDE.md` with the new persona

### Creating Skills

1. Create `.claude/skills/<skill-name>/SKILL.md`
2. Add frontmatter:
   ```yaml
   ---
   name: skill-name
   description: What this skill does and when to use it
   ---
   ```
3. Document the workflow or knowledge
4. Skills are loaded on-demand when relevant

### Configuring Commands for Your Stack

Edit `.claude/commands.md` or use the template:

**Node.js:**
```
{{install}}: npm install
{{dev}}: npm run dev
{{test}}: npm test
```

**Python:**
```
{{install}}: pip install -r requirements.txt
{{dev}}: python manage.py runserver
{{test}}: pytest
```

**Go:**
```
{{install}}: go mod download
{{dev}}: go run .
{{test}}: go test ./...
```

## Roadmap

- [ ] CLI tool for easy installation (`automatasaurus init`)
- [ ] Project detection and automatic command configuration
- [ ] Additional MCP integrations (database, API testing)
- [ ] Custom persona templates
- [ ] Workflow visualization
- [ ] Integration with CI/CD

## Contributing

Contributions welcome:
- New persona definitions
- Improved stop hook prompts
- Additional skills and language standards
- Workflow patterns
- CLI tool development

## References

- [Claude Code Documentation](https://code.claude.com/docs)
- [Subagents Reference](https://code.claude.com/docs/en/sub-agents)
- [Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Skills Reference](https://code.claude.com/docs/en/skills)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [GitHub CLI](https://cli.github.com/)
- [Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

## License

MIT
