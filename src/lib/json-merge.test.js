import { test, describe } from 'node:test';
import assert from 'node:assert';
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deepMerge, mergeLayeredSettings, createLocalSettingsTemplate } from './json-merge.js';

describe('deepMerge', () => {
  test('source values override target values for primitives', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3 };
    const result = deepMerge(target, source);
    assert.deepStrictEqual(result, { a: 1, b: 3 });
  });

  test('recursively merges nested objects', () => {
    const target = { outer: { a: 1, b: 2 } };
    const source = { outer: { b: 3 } };
    const result = deepMerge(target, source);
    assert.deepStrictEqual(result, { outer: { a: 1, b: 3 } });
  });

  test('user overrides take precedence over framework defaults', () => {
    const framework = {
      automatasaurus: {
        limits: {
          maxIssuesPerRun: 20,
          maxRetries: 5,
        },
      },
      permissions: { allow: ['git'] },
    };

    const userOverrides = {
      automatasaurus: {
        limits: {
          maxIssuesPerRun: 50,
        },
      },
    };

    const result = deepMerge(framework, userOverrides);

    // User override should win
    assert.strictEqual(result.automatasaurus.limits.maxIssuesPerRun, 50);
    // Framework default should be preserved
    assert.strictEqual(result.automatasaurus.limits.maxRetries, 5);
    // Other framework settings should be preserved
    assert.deepStrictEqual(result.permissions, { allow: ['git'] });
  });

  test('arrays are merged and deduplicated', () => {
    const target = { arr: ['a', 'b'] };
    const source = { arr: ['b', 'c'] };
    const result = deepMerge(target, source);
    assert.deepStrictEqual(result.arr, ['a', 'b', 'c']);
  });

  test('null and undefined source values are skipped', () => {
    const target = { a: 1, b: 2 };
    const source = { a: null, b: undefined };
    const result = deepMerge(target, source);
    assert.deepStrictEqual(result, { a: 1, b: 2 });
  });
});

describe('mergeLayeredSettings', () => {
  const testDir = join(process.cwd(), '.test-tmp-json-merge');
  const settingsPath = join(testDir, 'settings.json');
  const localPath = join(testDir, 'settings.local.json');

  test('creates settings.json from framework defaults when no local overrides exist', async () => {
    await mkdir(testDir, { recursive: true });
    try {
      const frameworkSettings = {
        automatasaurus: {
          limits: { maxIssuesPerRun: 20 },
        },
      };

      const result = await mergeLayeredSettings(settingsPath, localPath, frameworkSettings);

      assert.strictEqual(result.created, true);
      assert.strictEqual(result.hasLocalOverrides, false);

      const written = JSON.parse(await readFile(settingsPath, 'utf-8'));
      assert.strictEqual(written.automatasaurus.limits.maxIssuesPerRun, 20);
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  test('merges local overrides on top of framework defaults', async () => {
    await mkdir(testDir, { recursive: true });
    try {
      // Create local overrides file
      const localOverrides = {
        automatasaurus: {
          limits: { maxIssuesPerRun: 50 },
        },
      };
      await writeFile(localPath, JSON.stringify(localOverrides, null, 2));

      const frameworkSettings = {
        automatasaurus: {
          limits: {
            maxIssuesPerRun: 20,
            maxRetries: 5,
          },
        },
      };

      const result = await mergeLayeredSettings(settingsPath, localPath, frameworkSettings);

      assert.strictEqual(result.hasLocalOverrides, true);

      const written = JSON.parse(await readFile(settingsPath, 'utf-8'));
      // Local override wins
      assert.strictEqual(written.automatasaurus.limits.maxIssuesPerRun, 50);
      // Framework default preserved
      assert.strictEqual(written.automatasaurus.limits.maxRetries, 5);
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  test('framework update preserves local overrides', async () => {
    await mkdir(testDir, { recursive: true });
    try {
      // User has customized settings
      const localOverrides = {
        automatasaurus: {
          limits: { maxIssuesPerRun: 100 },
        },
      };
      await writeFile(localPath, JSON.stringify(localOverrides, null, 2));

      // Initial framework settings
      const frameworkV1 = {
        automatasaurus: { limits: { maxIssuesPerRun: 20 } },
      };
      await mergeLayeredSettings(settingsPath, localPath, frameworkV1);

      // Framework update with new defaults
      const frameworkV2 = {
        automatasaurus: {
          limits: {
            maxIssuesPerRun: 25,  // Changed default
            newSetting: 'added',  // New setting
          },
        },
      };
      const result = await mergeLayeredSettings(settingsPath, localPath, frameworkV2);

      const written = JSON.parse(await readFile(settingsPath, 'utf-8'));
      // User override still wins
      assert.strictEqual(written.automatasaurus.limits.maxIssuesPerRun, 100);
      // New framework setting added
      assert.strictEqual(written.automatasaurus.limits.newSetting, 'added');
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });
});

describe('createLocalSettingsTemplate', () => {
  const testDir = join(process.cwd(), '.test-tmp-template');
  const localPath = join(testDir, 'settings.local.json');

  test('creates empty settings.local.json if it does not exist', async () => {
    await mkdir(testDir, { recursive: true });
    try {
      const created = await createLocalSettingsTemplate(localPath);
      assert.strictEqual(created, true);

      const content = JSON.parse(await readFile(localPath, 'utf-8'));
      assert.deepStrictEqual(content, {});
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  test('does not overwrite existing settings.local.json', async () => {
    await mkdir(testDir, { recursive: true });
    try {
      // Create existing file with user content
      const userContent = { custom: 'value' };
      await writeFile(localPath, JSON.stringify(userContent, null, 2));

      const created = await createLocalSettingsTemplate(localPath);
      assert.strictEqual(created, false);

      // Content should be unchanged
      const content = JSON.parse(await readFile(localPath, 'utf-8'));
      assert.deepStrictEqual(content, userContent);
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });
});
