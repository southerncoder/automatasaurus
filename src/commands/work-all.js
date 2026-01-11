import { ensureGhAuth, listOpenIssues, parseDependencies, getIssue, hasLabel, getLabelNames } from '../lib/gh.js';
import { work } from './work.js';

function priorityRank(issue) {
  const labels = getLabelNames(issue).map((l) => String(l).toLowerCase());
  if (labels.includes('priority:high')) return 0;
  if (labels.includes('priority:medium')) return 1;
  if (labels.includes('priority:low')) return 2;
  return 3;
}

export async function workAll({ merge = false } = {}) {
  const cwd = process.cwd();
  await ensureGhAuth({ cwd });

  const maxIssuesPerRun = Number(process.env.AUTOMATASAURUS_MAX_ISSUES_PER_RUN || '20');

  const openIssues = await listOpenIssues({ cwd, limit: 200 });
  const openIssueNumbers = new Set(openIssues.map((i) => i.number));

  const ordered = [...openIssues]
    .filter((i) => !hasLabel(i, 'blocked'))
    .sort((a, b) => {
      const pr = priorityRank(a) - priorityRank(b);
      if (pr !== 0) return pr;
      return a.number - b.number;
    });

  let processed = 0;

  for (const issue of ordered) {
    if (processed >= maxIssuesPerRun) {
      console.log(`\nLimit reached: processed ${processed}/${maxIssuesPerRun} issues.`);
      return;
    }

    const deps = parseDependencies(issue.body);
    const blockedBy = [];

    for (const dep of deps) {
      if (openIssueNumbers.has(dep)) {
        blockedBy.push(dep);
        continue;
      }
      const depIssue = await getIssue({ number: dep, cwd });
      if (String(depIssue.state).toLowerCase() === 'open') blockedBy.push(dep);
    }

    if (blockedBy.length > 0) {
      continue;
    }

    console.log(`\n=== Working issue #${issue.number}: ${issue.title} ===`);
    await work({ args: [String(issue.number)], merge });
    processed++;
  }

  console.log(`\nWork-all complete. Processed ${processed} issues.`);
}
