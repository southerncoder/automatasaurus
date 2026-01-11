#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { init } from '../src/commands/init.js';
import { update } from '../src/commands/update.js';
import { status } from '../src/commands/status.js';
import { discovery } from '../src/commands/discovery.js';
import { workPlan } from '../src/commands/work-plan.js';
import { work } from '../src/commands/work.js';
import { workAll } from '../src/commands/work-all.js';

const helpText = `
automatasaurus - Copilot CLI automation framework

Usage:
  automatasaurus <command> [options]

Commands:
  init      Install automatasaurus into current project
  update    Update framework files to latest version
  status    Show installation status and version info
  discovery Start a discovery session (Copilot CLI)
  work-plan Create a sequenced implementation plan (Copilot CLI)
  work      Work a single GitHub issue (Copilot CLI)
  work-all  Work all ready issues (Copilot CLI)

Options:
  --help    Show this help message
  --force   Force overwrite of modified files (update only)
  --merge   Merge PRs when ready (work/work-all only)

Examples:
  npx automatasaurus init
  npx automatasaurus update
  npx automatasaurus update --force
  npx automatasaurus status
  npx automatasaurus discovery "user authentication"
  npx automatasaurus work-plan
  npx automatasaurus work 42
  npx automatasaurus work-all --merge
`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    help: { type: 'boolean', short: 'h' },
    force: { type: 'boolean', short: 'f' },
    merge: { type: 'boolean', short: 'm' },
  },
});

const command = positionals[0];

if (values.help || !command) {
  console.log(helpText);
  process.exit(0);
}

const commands = {
  init,
  update,
  status,
  discovery,
  'work-plan': workPlan,
  work,
  'work-all': workAll,
};

if (!commands[command]) {
  console.error(`Unknown command: ${command}`);
  console.log(helpText);
  process.exit(1);
}

try {
  await commands[command]({ force: values.force, merge: values.merge, args: positionals.slice(1) });
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
