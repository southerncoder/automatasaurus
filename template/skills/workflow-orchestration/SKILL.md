---
name: workflow-orchestration
description: Defines the autonomous development workflow. Use when orchestrating work between agents, managing issue lifecycles, or understanding the development loop.
---

---
name: workflow-orchestration
description: Patterns and templates for orchestrating multi-agent workflows, discovery, sequencing, escalation and ADR creation.
---

# Workflow Orchestration Skill

This skill captures the longer example sections moved out of agent prompts: discovery review templates, escalation workflows, ADR templates, and step-by-step orchestration patterns used by Product Owner / Architect / Developer.

## Discovery Plan Review Template

Use when performing a discovery review. Provide a structured response containing feasibility, alignment, scalability, security, and dependencies.

### Template

```markdown
**[Architect]**

## Discovery Plan Review

### Technical Feasibility
[Assessment: Feasible / Concerns / Blockers]

### Architecture Alignment
[How it fits with existing system]

### Concerns
1. [Technical concern and mitigation]

### Recommendations
1. [Specific technical recommendation]
```

## Escalation Workflow

When Developer escalates after 5 attempts:
1. Review escalation (issue, attempts, errors)
2. Analyze context and code
3. Provide actionable guidance and code snippets where helpful
4. If still unresolved, call human attention hook

## ADR Template

```markdown
# ADR-{number}: {Title}

## Status: Proposed | Accepted | Deprecated

## Context
[What issue motivates this decision?]

## Decision
[What change are we making?]

## Consequences
- Positive: [Benefits]
- Negative: [Trade-offs]
- Risks: [Risk and mitigation]
```

## PR Handoff and Merge Checklist

- Developer includes `Closes #<issue>` in PR body
- Required reviewers listed (Architect required, Designer if UI, Tester always)
- Tests included and passing
- Self-review checklist completed
- Branch merged cleanly against main (no conflicts)
