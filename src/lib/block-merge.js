import { readFile, writeFile } from 'node:fs/promises';

const START_MARKER = (blockId) => `<!-- AUTOMATASAURUS:${blockId}:START -->`;
const END_MARKER = (blockId) => `<!-- AUTOMATASAURUS:${blockId}:END -->`;
const WARNING = '<!-- Do not manually edit this section. Run `npx automatasaurus update` to refresh. -->';

/**
 * Extract block markers from content
 */
export function findBlock(content, blockId) {
  const startMarker = START_MARKER(blockId);
  const endMarker = END_MARKER(blockId);

  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    return null;
  }

  return {
    startIndex,
    endIndex: endIndex + endMarker.length,
    content: content.slice(startIndex, endIndex + endMarker.length),
  };
}

/**
 * Wrap content with block markers
 */
export function wrapBlock(blockId, content) {
  return `${START_MARKER(blockId)}\n${WARNING}\n\n${content.trim()}\n\n${END_MARKER(blockId)}`;
}

/**
 * Merge a block into existing file content
 * If block exists, replace it. If not, append it.
 */
export function mergeBlock(existingContent, blockId, newBlockContent) {
  const wrappedBlock = wrapBlock(blockId, newBlockContent);
  const existing = findBlock(existingContent, blockId);

  if (existing) {
    // Replace existing block
    return (
      existingContent.slice(0, existing.startIndex) +
      wrappedBlock +
      existingContent.slice(existing.endIndex)
    );
  }

  // Append block at end
  const separator = existingContent.endsWith('\n') ? '\n' : '\n\n';
  return existingContent + separator + wrappedBlock + '\n';
}

/**
 * Read a file and merge a block into it
 */
export async function mergeBlockIntoFile(filePath, blockId, newBlockContent) {
  let existingContent = '';

  try {
    existingContent = await readFile(filePath, 'utf-8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    // File doesn't exist, will create new
  }

  const merged = mergeBlock(existingContent, blockId, newBlockContent);
  await writeFile(filePath, merged, 'utf-8');

  return {
    created: existingContent === '',
    updated: existingContent !== '' && existingContent !== merged,
  };
}

/**
 * Check if a block exists in file content
 */
export function hasBlock(content, blockId) {
  return findBlock(content, blockId) !== null;
}
