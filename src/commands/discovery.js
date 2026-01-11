import { runCopilot } from '../lib/copilot-cli.js';

export async function discovery({ args = [] } = {}) {
  const request = args.join(' ').trim();
  if (!request) {
    throw new Error('Usage: automatasaurus discovery "<feature description>"');
  }

  const prompt = `You are the Product Owner agent (automatasaurus).

Follow the discovery workflow and create a discovery plan.

Reference files:
- @.github/copilot-instructions.md
- @.github/automatasaurus-commands.md
- @.automatasaurus/commands/discovery.md

User request: ${request}
`;

  await runCopilot({ prompt, agent: 'product-owner', cwd: process.cwd() });
}
