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
 * Read a JSON file, returning empty object if it doesn't exist
 */
async function readJsonFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

/**
 * Merge JSON settings files (legacy - kept for compatibility)
 * The framework settings are merged into the project settings
 */
export async function mergeJsonFile(projectFilePath, frameworkSettings) {
  const projectSettings = await readJsonFile(projectFilePath);
  const merged = deepMerge(projectSettings, frameworkSettings);
  await writeFile(projectFilePath, JSON.stringify(merged, null, 2) + '\n', 'utf-8');

  return {
    created: Object.keys(projectSettings).length === 0,
    updated: JSON.stringify(projectSettings) !== JSON.stringify(merged),
  };
}

/**
 * Layered settings merge for automatasaurus
 *
 * This implements a layered configuration approach:
 * 1. Framework defaults are written as the base
 * 2. User overrides from settings.local.json are merged on top
 * 3. The final merged result is written to settings.json
 *
 * This allows framework updates to refresh defaults while preserving
 * user customizations in the separate local file.
 *
 * @param {string} settingsPath - Path to settings.json (output)
 * @param {string} localPath - Path to settings.local.json (user overrides)
 * @param {object} frameworkSettings - Default settings from framework
 * @returns {object} - { created, updated, hasLocalOverrides }
 */
export async function mergeLayeredSettings(settingsPath, localPath, frameworkSettings) {
  // Read existing settings to check if this is a create or update
  const existingSettings = await readJsonFile(settingsPath);
  const isCreate = Object.keys(existingSettings).length === 0;

  // Read user's local overrides (if they exist)
  const localOverrides = await readJsonFile(localPath);
  const hasLocalOverrides = Object.keys(localOverrides).length > 0;

  // Merge: framework defaults + user overrides (user wins)
  const merged = deepMerge(frameworkSettings, localOverrides);

  // Write the final merged settings
  await writeFile(settingsPath, JSON.stringify(merged, null, 2) + '\n', 'utf-8');

  return {
    created: isCreate,
    updated: JSON.stringify(existingSettings) !== JSON.stringify(merged),
    hasLocalOverrides,
  };
}

/**
 * Create a settings.local.json template file if it doesn't exist
 *
 * @param {string} localPath - Path to settings.local.json
 * @returns {boolean} - true if file was created, false if it already exists
 */
export async function createLocalSettingsTemplate(localPath) {
  try {
    await readFile(localPath, 'utf-8');
    return false; // File already exists
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  // Create a minimal template with example structure
  // Users will add their own overrides here
  const template = {};

  await writeFile(localPath, JSON.stringify(template, null, 2) + '\n', 'utf-8');
  return true;
}
