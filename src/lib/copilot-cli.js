import { runProcess } from './process.js';

function splitCommandLine(commandLine) {
  // Minimal split: supports quoted segments with double quotes.
  const tokens = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < commandLine.length; index++) {
    const char = commandLine[index];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && /\s/.test(char)) {
      if (current) tokens.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  if (current) tokens.push(current);
  return tokens;
}

export function getCopilotCommand() {
  const raw = process.env.AUTOMATASAURUS_COPILOT_COMMAND?.trim();
  if (!raw) return { command: 'copilot', prefixArgs: [] };

  const parts = splitCommandLine(raw);
  return { command: parts[0], prefixArgs: parts.slice(1) };
}

export async function runCopilot({
  prompt,
  agent,
  allowTools = ["write", "shell(gh)", "shell(git)"],
  allowUrls = ["github.com"],
  cwd,
}) {
  const { command, prefixArgs } = getCopilotCommand();

  const args = [...prefixArgs];

  if (agent) args.push(`--agent=${agent}`);
  args.push('-p', prompt);

  for (const tool of allowTools) {
    args.push('--allow-tool', tool);
  }

  for (const url of allowUrls) {
    args.push('--allow-url', url);
  }

  return await runProcess(command, args, { cwd, echo: true });
}
