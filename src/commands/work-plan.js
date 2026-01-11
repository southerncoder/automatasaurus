import { runCopilot } from '../lib/copilot-cli.js';

export async function workPlan() {
  const prompt = `You are the Product Owner agent (automatasaurus).

Create or update an implementation plan for the open issues in this repository.

Reference files:
- @.github/copilot-instructions.md
- @.github/automatasaurus-commands.md
- @.automatasaurus/commands/work-plan.md
`;

  await runCopilot({ prompt, agent: 'product-owner', cwd: process.cwd() });
}
