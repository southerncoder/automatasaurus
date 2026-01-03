import { readFile, writeFile } from 'node:fs/promises';

/**
 * Deep merge two objects, with source taking precedence
 * Arrays are concatenated and deduplicated
 */
export function deepMerge(target, source) {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] === null || source[key] === undefined) {
      continue;
    }

    if (Array.isArray(source[key])) {
      // Merge arrays, deduplicate
      const targetArray = Array.isArray(result[key]) ? result[key] : [];
      result[key] = [...new Set([...targetArray, ...source[key]])];
    } else if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      // Recursively merge objects
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      // Overwrite primitives
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Merge JSON settings files
 * The framework settings are merged into the project settings
 */
export async function mergeJsonFile(projectFilePath, frameworkSettings) {
  let projectSettings = {};

  try {
    const content = await readFile(projectFilePath, 'utf-8');
    projectSettings = JSON.parse(content);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    // File doesn't exist, start fresh
  }

  const merged = deepMerge(projectSettings, frameworkSettings);
  await writeFile(projectFilePath, JSON.stringify(merged, null, 2) + '\n', 'utf-8');

  return {
    created: Object.keys(projectSettings).length === 0,
    updated: JSON.stringify(projectSettings) !== JSON.stringify(merged),
  };
}
