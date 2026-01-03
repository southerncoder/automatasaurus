import { mkdir, cp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTemplateDir, getProjectPaths, getVersion, SYMLINK_DIRS } from '../lib/paths.js';
import { symlinkDirectory, isSymlink } from '../lib/symlinks.js';
import { mergeBlockIntoFile } from '../lib/block-merge.js';
import { mergeJsonFile } from '../lib/json-merge.js';
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

  for (const dir of SYMLINK_DIRS) {
    const sourceDir = join(templateDir, dir);
    const targetDir = join(paths.automatasaurus, dir);
    try {
      await cp(sourceDir, targetDir, { recursive: true, force: true });
      console.log(`  Updated ${dir}/`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  // 2. Recreate symlinks (in case new files were added)
  console.log('\nUpdating symlinks in .claude/...');
  const allSymlinks = [];

  for (const dir of SYMLINK_DIRS) {
    const sourceDir = join(paths.automatasaurus, dir);
    const targetDir = join(paths.claude, dir);
    try {
      const created = await symlinkDirectory(sourceDir, targetDir);
      for (const file of created) {
        const symlinkPath = join(dir, file);
        allSymlinks.push(symlinkPath);
      }
      console.log(`  Updated ${dir}/ (${created.length} files)`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  // 3. Update block-merged files
  console.log('\nUpdating merged files...');

  // CLAUDE.md
  const claudeMdTemplate = join(templateDir, 'CLAUDE.md.block');
  try {
    const blockContent = await readFile(claudeMdTemplate, 'utf-8');
    await mergeBlockIntoFile(paths.claudeMd, 'CORE', blockContent);
    console.log('  Updated CLAUDE.md');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  // settings.json
  const settingsTemplate = join(templateDir, 'settings.json');
  try {
    const settingsContent = await readFile(settingsTemplate, 'utf-8');
    const frameworkSettings = JSON.parse(settingsContent);
    await mergeJsonFile(paths.settings, frameworkSettings);
    console.log('  Updated settings.json');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  // commands.md
  const commandsTemplate = join(templateDir, 'commands.md.block');
  try {
    const blockContent = await readFile(commandsTemplate, 'utf-8');
    await mergeBlockIntoFile(paths.commands, 'COMMANDS', blockContent);
    console.log('  Updated commands.md');
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
