---
name: tester-guidance
description: Detailed tester procedures: running automated tests, Playwright MCP usage, manual verification checklists, cleanup steps and reporting templates.
---

# Tester Guidance Skill

This skill contains the detailed examples and templates that were previously embedded in the Tester AGENT.md. Use this skill when running test suites, performing manual verification with Playwright MCP, or drafting verification comments for PRs.

## Test Verification Template

```bash
# Run project-specific tests from .claude/commands.md or use common commands
npm test
pytest
# or custom command
```

## Playwright MCP Quick Reference

- Navigate to dev server URL
- Perform user actions matching acceptance criteria
- Take screenshots for documentation
- Verify expected elements/states
- Close browser when done: mcp__playwright__browser_close

## PR Verification Comment Templates

**Success:**
```markdown
**[Tester]**

✅ APPROVED - Tester

**Automated Tests:** All passing
**Manual Verification:** [Completed/N/A]

Acceptance criteria verified:
- [x] Criterion 1
- [x] Criterion 2

Ready for merge.
```

**Failure:**
```markdown
**[Tester]**

❌ CHANGES REQUESTED - Tester

**Test Failures:**
- [Test name]: [Error]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]

Please fix and request re-verification.
```

## Cleanup Checklist

- docker compose down (if used)
- Stop dev servers started directly
- Close Playwright browser
- Remove temporary test files

## Test Plan Template

```markdown
# Test Plan: [Feature]

## Scope
[What is being tested]

## Test Cases

### TC-001: [Test Name]
**Type**: Unit | Integration | E2E
**Steps**:
1. [Step]
2. [Step]
**Expected**: [Result]
```
