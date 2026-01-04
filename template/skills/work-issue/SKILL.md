---
name: work-issue
description: Core implementation logic for working on a single GitHub issue. Used by both /work command and /work-all subagents to ensure consistent behavior.
---

# Work Issue Skill

This skill contains the implementation logic for working on a single GitHub issue. It is loaded by:
- `/work {n}` command (direct invocation)
- `/work-all` subagents (spawned for context isolation)

## Input

This skill expects an `ISSUE_NUMBER` to be provided by the caller.

## Workflow

```
1. GET ISSUE DETAILS
2. CHECK DEPENDENCIES → If blocked, report and stop
3. GET DESIGN SPECS (if UI) → Invoke designer agent
4. IMPLEMENT → Invoke developer agent
5. COORDINATE REVIEWS → Architect (required), Designer (if UI), Tester (required)
6. HANDLE CHANGE REQUESTS → Loop until all approved
7. REPORT RESULT → Success, Blocked, or Escalated
```

---

## Step 1: Get Issue Details

```bash
gh issue view {ISSUE_NUMBER}
```

Extract:
- Title
- Acceptance criteria
- Dependencies
- Labels (UI-related?)

---

## Step 2: Check Dependencies

Parse "Depends on #X" from issue body:

```bash
gh issue view {ISSUE_NUMBER} --json body --jq '.body' | grep -oE 'Depends on #[0-9]+' | grep -oE '[0-9]+'
```

For each dependency, check if closed:

```bash
gh issue view {dep_number} --json state --jq '.state'
```

**If any dependency is OPEN:**
```
Report: "BLOCKED: Issue #{ISSUE_NUMBER} is blocked on #{dep_number}"
Stop here.
```

---

## Step 3: Get Design Specs (If UI Work)

Check if issue involves UI (labels contain "ui", "frontend", or issue mentions UI work).

If UI work needed and no design specs in comments:

```
Use the designer agent to add UI/UX specifications to issue #{ISSUE_NUMBER}.

Review the issue requirements and add design specs as a comment.
```

---

## Step 4: Implement

Update issue label:
```bash
gh issue edit {ISSUE_NUMBER} --add-label "in-progress" --remove-label "ready"
```

Invoke developer agent:

```
Use the developer agent to implement issue #{ISSUE_NUMBER}.

Context:
- Issue: {title}
- Acceptance criteria: {from issue body}
- Design specs: {from designer comment, if applicable}

Create a PR when implementation is complete. The PR must include "Closes #{ISSUE_NUMBER}".
```

Wait for developer to create PR. Get PR number from output or:
```bash
gh pr list --search "head:{ISSUE_NUMBER}-" --json number --jq '.[0].number'
```

---

## Step 5: Coordinate Reviews

Update issue label:
```bash
gh issue edit {ISSUE_NUMBER} --add-label "needs-review" --remove-label "in-progress"
```

### Architect Review (Required)

```
Use the architect agent to review PR #{pr_number} for technical quality.

Post a standardized review comment:
- ✅ APPROVED - Architect (if acceptable)
- ❌ CHANGES REQUESTED - Architect (if issues found)
```

### Designer Review (If UI Changes)

```
Use the designer agent to review PR #{pr_number} for UI/UX quality.

If no UI changes: Post "**[Designer]** N/A - No UI changes in this PR."

Otherwise post standardized review comment:
- ✅ APPROVED - Designer
- ❌ CHANGES REQUESTED - Designer
```

### Tester Review (Required)

```
Use the tester agent to verify PR #{pr_number}.

Run tests and perform manual verification if needed.
Post a standardized review comment:
- ✅ APPROVED - Tester
- ❌ CHANGES REQUESTED - Tester
```

---

## Step 6: Handle Change Requests

Check PR comments for review status:
```bash
gh pr view {pr_number} --comments
```

**If any `❌ CHANGES REQUESTED`:**

```
Use the developer agent to address the review feedback on PR #{pr_number}.

Feedback to address:
{summary of requested changes}
```

After developer pushes fixes, re-request the relevant review(s).

Repeat until all required approvals are present.

---

## Step 7: Report Result

### Check for All Approvals

Required approvals (check PR comments):
- `✅ APPROVED - Architect` (always)
- `✅ APPROVED - Tester` (always)
- `✅ APPROVED - Designer` (if UI changes)

No outstanding `❌ CHANGES REQUESTED`.

### Success

If all approvals present:

```
Report: "SUCCESS: PR #{pr_number} is ready for merge"

Include:
- PR number
- Issue number
- Summary of what was implemented
```

### Blocked

If dependencies not met (from Step 2):

```
Report: "BLOCKED: Issue #{ISSUE_NUMBER} is blocked on #{dep_number}"
```

### Escalated

If developer escalated to architect, and architect also stuck:

```
Report: "ESCALATED: Issue #{ISSUE_NUMBER} requires human intervention"

Include:
- What was tried
- Where it got stuck
- Error details
```

---

## Exit States

The caller (either /work command or /work-all orchestrator) will parse the output for these indicators:

| State | Output Contains | Meaning |
|-------|-----------------|---------|
| SUCCESS | "PR #X is ready for merge" | All reviews approved, ready to merge |
| BLOCKED | "blocked on #" | Dependencies not met |
| ESCALATED | "requires human intervention" or "Escalating" | Stuck, needs human |

---

## Commands Reference

```bash
# Issue operations
gh issue view {n}
gh issue edit {n} --add-label "X" --remove-label "Y"

# PR operations
gh pr list --search "head:{issue}-"
gh pr view {n} --comments
gh pr comment {n} --body "..."

# Dependency check
gh issue view {n} --json body --jq '.body' | grep -oE 'Depends on #[0-9]+'
gh issue view {n} --json state --jq '.state'
```
