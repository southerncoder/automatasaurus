import { runCopilot } from '../lib/copilot-cli.js';
import { ensureGhAuth, getIssue, getPullRequest, parseDependencies, listOpenIssues, isUiIssue, extractPrNumberFromText, getMarkersFromComments } from '../lib/gh.js';
import { runProcess } from '../lib/process.js';

async function isDependencyOpen(depNumber, openIssueNumbers, cwd) {
  if (openIssueNumbers.has(depNumber)) return true;
  // If not in open list, double-check state.
  const issue = await getIssue({ number: depNumber, cwd });
  return String(issue.state).toLowerCase() === 'open';
}

async function maybeMerge({ prNumber, cwd }) {
  await runProcess('gh', ['pr', 'merge', String(prNumber), '--squash', '--delete-branch'], { cwd, echo: true });
}

export async function work({ args = [], merge = false } = {}) {
  const issueNumber = Number(args[0]);
  if (!issueNumber || Number.isNaN(issueNumber)) {
    throw new Error('Usage: automatasaurus work <issue-number> [--merge]');
  }

  const cwd = process.cwd();
  await ensureGhAuth({ cwd });

  const issue = await getIssue({ number: issueNumber, cwd });
  const deps = parseDependencies(issue.body);

  const openIssues = await listOpenIssues({ cwd, limit: 200 });
  const openIssueNumbers = new Set(openIssues.map((i) => i.number));

  for (const dep of deps) {
    const open = await isDependencyOpen(dep, openIssueNumbers, cwd);
    if (open) {
      console.log(`\nBLOCKED: Issue #${issueNumber} is blocked on #${dep}`);
      return;
    }
  }

  const needsUi = isUiIssue(issue);

  if (needsUi) {
    const prompt = `You are the Designer.

Add UI/UX specs as a comment on GitHub issue #${issueNumber}.

Reference files:
- @.github/copilot-instructions.md
- @.github/automatasaurus-commands.md

Requirements:
- Comment starts with **[Designer]**
- If truly no UI impact, comment N/A

Now do the work.`;

    await runCopilot({ prompt, agent: 'designer', cwd });
  }

  // Implement
  const devPrompt = `You are the Developer.

Implement GitHub issue #${issueNumber}.

Reference files:
- @.github/copilot-instructions.md
- @.github/automatasaurus-commands.md

Requirements:
- Create a branch named ${issueNumber}-<slug>
- Open a PR that includes "Closes #${issueNumber}" in the body
- At the end print: AUTOMATASAURUS_PR_NUMBER=<number>

Now do the work.`;

  const devResult = await runCopilot({ prompt: devPrompt, agent: 'developer', cwd });
  const prNumber = extractPrNumberFromText(devResult.stdout + devResult.stderr);

  if (!prNumber) {
    throw new Error('Developer did not print AUTOMATASAURUS_PR_NUMBER=... (cannot continue).');
  }

  // Review/verify loop (max 3 cycles)
  for (let cycle = 1; cycle <= 3; cycle++) {
    const archPrompt = `You are the Architect.

Review PR #${prNumber} in this repo.

Requirements:
- Leave a PR comment starting with **[Architect]**
- Include exactly one marker on its own line:
  - ✅ APPROVED - Architect
  - ❌ CHANGES REQUESTED - Architect

Now do the review.`;

    await runCopilot({ prompt: archPrompt, agent: 'architect', cwd });

    if (needsUi) {
      const designerReviewPrompt = `You are the Designer.

Review PR #${prNumber} for UI/UX and accessibility.

Requirements:
- Leave a PR comment starting with **[Designer]**
- If no UI changes, comment N/A
- Otherwise include exactly one marker on its own line:
  - ✅ APPROVED - Designer
  - ❌ CHANGES REQUESTED - Designer

Now do the review.`;

      await runCopilot({ prompt: designerReviewPrompt, agent: 'designer', cwd });
    }

    const testerPrompt = `You are the Tester.

Verify PR #${prNumber}.

Requirements:
- Run the relevant tests using .github/automatasaurus-commands.md
- Leave a PR comment starting with **[Tester]**
- Include exactly one marker on its own line:
  - ✅ APPROVED - Tester
  - ❌ CHANGES REQUESTED - Tester

Now do the verification.`;

    await runCopilot({ prompt: testerPrompt, agent: 'tester', cwd });

    const pr = await getPullRequest({ number: prNumber, cwd });
    const markers = getMarkersFromComments(pr.comments);

    const requiredApproved = markers.architectApproved && markers.testerApproved && (!needsUi || markers.designerApproved);
    const anyChangesRequested = markers.architectChanges || markers.testerChanges || (needsUi && markers.designerChanges);

    if (requiredApproved && !anyChangesRequested) {
      console.log(`\nSUCCESS: PR #${prNumber} is ready${merge ? ' (merging...)' : ''}`);
      if (merge) await maybeMerge({ prNumber, cwd });
      return;
    }

    if (anyChangesRequested) {
      if (cycle === 3) {
        console.log(`\nESCALATED: PR #${prNumber} still has change requests after ${cycle} cycles.`);
        return;
      }

      const fixPrompt = `You are the Developer.

Address review feedback on PR #${prNumber}.

Steps:
- Read PR comments
- Make requested changes
- Push updates
- Comment with what changed using **[Developer]**

At the end print: AUTOMATASAURUS_PR_NUMBER=${prNumber}
`;

      await runCopilot({ prompt: fixPrompt, agent: 'developer', cwd });
      continue;
    }

    // No approvals yet but also no explicit changes requested. Continue loop.
  }
}
