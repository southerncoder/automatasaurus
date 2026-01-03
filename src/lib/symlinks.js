import { symlink, unlink, readlink, mkdir, readdir, stat } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';

/**
 * Create a symlink, creating parent directories if needed
 */
export async function createSymlink(source, target) {
  // Ensure target directory exists
  await mkdir(dirname(target), { recursive: true });

  // Calculate relative path from target to source
  const relativePath = relative(dirname(target), source);

  // Remove existing symlink if present
  try {
    await unlink(target);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  await symlink(relativePath, target);
}

/**
 * Check if a path is a symlink
 */
export async function isSymlink(path) {
  try {
    const stats = await stat(path, { throwIfNoEntry: false });
    if (!stats) return false;

    const lstats = await import('node:fs').then(fs =>
      fs.promises.lstat(path)
    );
    return lstats.isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Get all files in a directory recursively
 */
export async function getFilesRecursive(dir, baseDir = dir) {
  const files = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = relative(baseDir, fullPath);

      if (entry.isDirectory()) {
        const subFiles = await getFilesRecursive(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return files;
}

/**
 * Create symlinks for all files from source directory to target directory
 */
export async function symlinkDirectory(sourceDir, targetDir, exclude = []) {
  const files = await getFilesRecursive(sourceDir);
  const created = [];

  for (const file of files) {
    if (exclude.some(pattern => file.includes(pattern))) {
      continue;
    }

    const source = join(sourceDir, file);
    const target = join(targetDir, file);

    await createSymlink(source, target);
    created.push(file);
  }

  return created;
}
