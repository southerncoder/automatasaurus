import { mkdir, cp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTemplateDir, getProjectPaths, getVersion, SUBDIR_SYMLINK_DIRS, FILE_SYMLINK_DIRS } from '../lib/paths.js';
import { symlinkDirectory, symlinkSubdirectories } from '../lib/symlinks.js';
import { mergeBlockIntoFile } from '../lib/block-merge.js';
import { readManifest, writeManifest, createManifest, updateManifest } from '../lib/manifest.js';

export async function init({ force = false } = {}) {
  const projectRoot = process.cwd();
  const paths = getProjectPaths(projectRoot);
  const templateDir = getTemplateDir();
  const version = await getVersion();

  console.log(`\nInitializing automatasaurus v${version}...\n`);

  // Check if already initialized
  const existingManifest = await readManifest(projectRoot);
  if (existingManifest && !force) {
    console.log(`Already initialized (v${existingManifest.version}).`);
    console.log('Run with --force to reinitialize, or use "update" to update.');
    return;
  }

  // 1. Create .automatasaurus directory and copy template files
  console.log('Copying framework files to .automatasaurus/...');
  await mkdir(paths.automatasaurus, { recursive: true });

  const copyDirs = ['agents', 'skills', 'commands', 'hooks', 'artifacts'];
  for (const dir of copyDirs) {
    const sourceDir = join(templateDir, dir);
    const targetDir = join(paths.automatasaurus, dir);
    try {
      await cp(sourceDir, targetDir, { recursive: true, force: true });
      console.log(`  Copied ${dir}/`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      // Directory doesn't exist in template, skip
    }
  }

  // 2. Create .github directory structure
  await mkdir(paths.github, { recursive: true });
  await mkdir(paths.githubAgents, { recursive: true });
  await mkdir(paths.githubSkills, { recursive: true });

  // 3. Create symlinks from .github to .automatasaurus
  console.log('\nCreating symlinks in .github/...');
  const allSymlinks = [];

  // Subdirectory-level symlinks (skills)
  for (const dir of SUBDIR_SYMLINK_DIRS) {
    const sourceDir = join(paths.automatasaurus, dir);
    const targetDir = paths.githubSkills;
    try {
      const created = await symlinkSubdirectories(sourceDir, targetDir);
      for (const subdir of created) {
        const symlinkPath = `.github/skills/${subdir}`;
        allSymlinks.push(symlinkPath);
        console.log(`  Linked ${symlinkPath}/`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  // File-level symlinks (agents)
  for (const dir of FILE_SYMLINK_DIRS) {
    const sourceDir = join(paths.automatasaurus, dir);
    const targetDir = paths.githubAgents;
    try {
      const created = await symlinkDirectory(sourceDir, targetDir);
      for (const file of created) {
        const symlinkPath = `.github/agents/${file}`;
        allSymlinks.push(symlinkPath);
        console.log(`  Linked ${symlinkPath}`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  // 4. Block-merge .github/copilot-instructions.md
  console.log('\nMerging copilot instructions...');
  const instructionsTemplate = join(templateDir, 'copilot-instructions.block.md');
  try {
    const blockContent = await readFile(instructionsTemplate, 'utf-8');
    const result = await mergeBlockIntoFile(paths.copilotInstructions, 'CORE', blockContent);
    console.log(`  ${result.created ? 'Created' : 'Updated'} .github/copilot-instructions.md`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log('  No copilot instructions template found, skipping');
  }

  // 5. Block-merge .github/automatasaurus-commands.md
  console.log('\nMerging project commands...');
  const commandsTemplate = join(templateDir, 'automatasaurus-commands.block.md');
  try {
    const blockContent = await readFile(commandsTemplate, 'utf-8');
    const result = await mergeBlockIntoFile(paths.projectCommands, 'COMMANDS', blockContent);
    console.log(`  ${result.created ? 'Created' : 'Updated'} .github/automatasaurus-commands.md`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log('  No project commands template found, skipping');
  }

  // 6. Write manifest
  const manifest = createManifest(version);
  manifest.symlinks = allSymlinks;
  manifest.merged_blocks = [
    { file: '.github/copilot-instructions.md', block: 'CORE' },
    { file: '.github/automatasaurus-commands.md', block: 'COMMANDS' },
  ];
  await writeManifest(projectRoot, manifest);
  console.log('\nWrote manifest file.');

  console.log(`
Automatasaurus initialized successfully!

Next steps:
  1. Review .github/copilot-instructions.md
  2. Update .github/automatasaurus-commands.md with your project-specific commands
  3. Install GitHub Copilot CLI and authenticate
  4. Run: npx automatasaurus discovery "your feature request"

Run "automatasaurus status" to see installation details.
`);
}
