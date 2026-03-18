import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { BuildManifest, PageEntry } from '../schemas/index.js';

const MANIFEST_FILE = 'build-manifest.json';

/**
 * Load a build manifest from the cache directory.
 * Returns null if no manifest exists or if it's invalid.
 */
export async function loadBuildManifest(cacheDir: string): Promise<BuildManifest | null> {
  const filePath = path.join(cacheDir, MANIFEST_FILE);
  let raw: string;
  try {
    raw = await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as BuildManifest;
    // Basic validation
    if (!parsed.version || !parsed.entries || typeof parsed.entries !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Save a build manifest to the cache directory.
 */
export async function saveBuildManifest(cacheDir: string, manifest: BuildManifest): Promise<void> {
  const filePath = path.join(cacheDir, MANIFEST_FILE);
  await mkdir(cacheDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(manifest, null, 2), 'utf-8');
}

/**
 * Check whether a page entry has changed compared to the previous manifest.
 * Returns true if the entry is new or its inputHash differs.
 */
export function hasEntryChanged(entry: PageEntry, manifest: BuildManifest): boolean {
  const prev = manifest.entries[entry.id];
  if (!prev) return true;
  return prev.inputHash !== entry.inputHash;
}
