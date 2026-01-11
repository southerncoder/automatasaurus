import { runProcess } from './process.js';

export async function gh(args, { cwd, echo = false } = {}) {
  const result = await runProcess('gh', args, { cwd, echo });
  return result.stdout;
}

export async function ensureGhAuth({ cwd } = {}) {
  // This prints helpful output if auth is missing.
  await runProcess('gh', ['auth', 'status'], { cwd, echo: true });
}

export async function getIssue({ number, cwd }) {
  const stdout = await gh(['issue', 'view', String(number), '--json', 'number,title,body,state,labels'], { cwd });
  return JSON.parse(stdout);
}

export async function listOpenIssues({ cwd, limit = 100 } = {}) {
  const stdout = await gh(['issue', 'list', '--state', 'open', '--limit', String(limit), '--json', 'number,title,body,labels'], { cwd });
  return JSON.parse(stdout);
}

export async function getPullRequest({ number, cwd }) {
  const stdout = await gh(['pr', 'view', String(number), '--json', 'number,state,comments,title,url'], { cwd });
  return JSON.parse(stdout);
}

export function parseDependencies(issueBody) {
  const deps = [];
  const re = /Depends on\s+#(\d+)/gi;
  let match;
  while ((match = re.exec(issueBody || ''))) {
    deps.push(Number(match[1]));
  }
  return [...new Set(deps)];
}

export function hasLabel(issue, labelName) {
  return (issue.labels || []).some((l) => (typeof l === 'string' ? l === labelName : l?.name === labelName));
}

export function getLabelNames(issue) {
  return (issue.labels || []).map((l) => (typeof l === 'string' ? l : l?.name)).filter(Boolean);
}

export function isUiIssue(issue) {
  const labels = getLabelNames(issue).map((l) => String(l).toLowerCase());
  if (labels.some((l) => ['ui', 'frontend', 'design'].includes(l))) return true;
  const body = (issue.body || '').toLowerCase();
  return body.includes('ui') || body.includes('frontend') || body.includes('user interface');
}

export function extractPrNumberFromText(text) {
  const match = /AUTOMATASAURUS_PR_NUMBER\s*=\s*(\d+)/.exec(text);
  if (match) return Number(match[1]);
  const fallback = /\bPR\s*#(\d+)\b/i.exec(text);
  return fallback ? Number(fallback[1]) : null;
}

export function getMarkersFromComments(comments) {
  const bodies = (comments || []).map((c) => c?.body || '').join('\n');
  return {
    architectApproved: bodies.includes('✅ APPROVED - Architect'),
    architectChanges: bodies.includes('❌ CHANGES REQUESTED - Architect'),
    designerApproved: bodies.includes('✅ APPROVED - Designer'),
    designerChanges: bodies.includes('❌ CHANGES REQUESTED - Designer'),
    testerApproved: bodies.includes('✅ APPROVED - Tester'),
    testerChanges: bodies.includes('❌ CHANGES REQUESTED - Tester'),
  };
}
