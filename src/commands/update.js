import { mkdir, cp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTemplateDir, getProjectPaths, getVersion, SUBDIR_SYMLINK_DIRS, FILE_SYMLINK_DIRS } from '../lib/paths.js';
import { symlinkDirectory, symlinkSubdirectories } from '../lib/symlinks.js';
import { mergeBlockIntoFile } from '../lib/block-merge.js';
import { readManifest, writeManifest, updateManifest } from '../lib/manifest.js';

export async function update({ force = false } = {}) {
  const projectRoot = process.cwd();
  const paths = getProjectPaths(projectRoot);
  const templateDir = getTemplateDir();
  const version = await getVersion();

  // Check if initialized
  const manifest = await readManifest(projectRoot);
  if (!manifest) {
    console.log('Automatasaurus is not initialized in this project.');
    console.log('Run "automatasaurus init" first.');
    return;
  }

  console.log(`\nUpdating automatasaurus from v${manifest.version} to v${version}...\n`);

  if (manifest.version === version && !force) {
    console.log('Already at latest version. Use --force to reinstall.');
    return;
  }

  // 1. Update .automatasaurus directory
  console.log('Updating framework files in .automatasaurus/...');

  const copyDirs = ['agents', 'skills', 'commands', 'hooks', 'artifacts'];
  for (const dir of copyDirs) {
    const sourceDir = join(templateDir, dir);
    const targetDir = join(paths.automatasaurus, dir);
    try {
      await cp(sourceDir, targetDir, { recursive: true, force: true });
      console.log(`  Updated ${dir}/`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  // 2. Recreate symlinks (in case new items were added)
  console.log('\nUpdating symlinks in .github/...');
  const allSymlinks = [];

  // Ensure .github dirs exist
  await mkdir(paths.github, { recursive: true });
  await mkdir(paths.githubAgents, { recursive: true });
  await mkdir(paths.githubSkills, { recursive: true });

  // Subdirectory-level symlinks (skills)
  for (const dir of SUBDIR_SYMLINK_DIRS) {
    const sourceDir = join(paths.automatasaurus, dir);
    const targetDir = paths.githubSkills;
    try {
      const created = await symlinkSubdirectories(sourceDir, targetDir);
      for (const subdir of created) {
        allSymlinks.push(`.github/skills/${subdir}`);
      }
      console.log(`  Updated ${dir}/ (${created.length} subdirs)`);
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
        allSymlinks.push(`.github/agents/${file}`);
      }
      console.log(`  Updated ${dir}/ (${created.length} files)`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  // 3. Update block-merged files
  console.log('\nUpdating merged files...');

  // .github/copilot-instructions.md
  const instructionsTemplate = join(templateDir, 'copilot-instructions.block.md');
  try {
    const blockContent = await readFile(instructionsTemplate, 'utf-8');
    await mergeBlockIntoFile(paths.copilotInstructions, 'CORE', blockContent);
    console.log('  Updated .github/copilot-instructions.md');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  // .github/automatasaurus-commands.md
  const commandsTemplate = join(templateDir, 'automatasaurus-commands.block.md');
  try {
    const blockContent = await readFile(commandsTemplate, 'utf-8');
    await mergeBlockIntoFile(paths.projectCommands, 'COMMANDS', blockContent);
    console.log('  Updated .github/automatasaurus-commands.md');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  // 4. Update manifest
  const updatedManifest = updateManifest(manifest, {
    version,
    symlinks: allSymlinks,
  });
  await writeManifest(projectRoot, updatedManifest);

  console.log(`
Update complete! v${manifest.version} -> v${version}

Review the changes with:
  git diff

Commit when ready:
  git add -A && git commit -m "chore: update automatasaurus to v${version}"
`);
}
