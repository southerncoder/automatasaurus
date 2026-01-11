import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Get the package root directory (where package.json is)
 */
export function getPackageRoot() {
  return join(__dirname, '..', '..');
}

/**
 * Get the template directory
 */
export function getTemplateDir() {
  return join(getPackageRoot(), 'template');
}

/**
 * Get the version from package.json
 */
export async function getVersion() {
  const { readFile } = await import('node:fs/promises');
  const pkgPath = join(getPackageRoot(), 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
  return pkg.version;
}

/**
 * Standard paths for installation
 */
export function getProjectPaths(projectRoot) {
  return {
    automatasaurus: join(projectRoot, '.automatasaurus'),
    github: join(projectRoot, '.github'),
    githubAgents: join(projectRoot, '.github', 'agents'),
    githubSkills: join(projectRoot, '.github', 'skills'),
    copilotInstructions: join(projectRoot, '.github', 'copilot-instructions.md'),
    projectCommands: join(projectRoot, '.github', 'automatasaurus-commands.md'),
    manifest: join(projectRoot, '.automatasaurus', '.automatasaurus.manifest.json'),
  };
}

/**
 * Directories that get symlinked at subdirectory level (each subdir is a symlink)
 * Use for directories containing multiple independent modules (agents, skills)
 */
export const SUBDIR_SYMLINK_DIRS = ['skills'];

/**
 * Directories that get symlinked at file level (each file is a symlink)
 * Use for directories containing flat files (hooks, commands)
 */
export const FILE_SYMLINK_DIRS = ['agents'];
