import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  loadBuildManifest,
  saveBuildManifest,
  hasEntryChanged,
} from '../../../src/core/cache.js';
import type { BuildManifest, PageEntry } from '../../../src/schemas/index.js';

describe('core/cache', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `seo-cache-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  const sampleManifest: BuildManifest = {
    version: '1.0.0',
    builtAt: '2026-01-01T00:00:00.000Z',
    configHash: 'abc123',
    templateHash: 'def456',
    entries: {
      'page-1': {
        inputHash: 'hash-1',
        outputFiles: ['page-1/index.html'],
        builtAt: '2026-01-01T00:00:00.000Z',
        contentHash: 'content-hash-1',
      },
      'page-2': {
        inputHash: 'hash-2',
        outputFiles: ['page-2/index.html'],
        builtAt: '2026-01-01T00:00:00.000Z',
        contentHash: 'content-hash-2',
      },
    },
  };

  describe('loadBuildManifest', () => {
    it('should return null when no manifest exists', async () => {
      const result = await loadBuildManifest(tmpDir);
      expect(result).toBeNull();
    });

    it('should load a valid manifest', async () => {
      await saveBuildManifest(tmpDir, sampleManifest);
      const result = await loadBuildManifest(tmpDir);
      expect(result).not.toBeNull();
      expect(result!.version).toBe('1.0.0');
      expect(Object.keys(result!.entries)).toHaveLength(2);
    });

    it('should return null for invalid JSON', async () => {
      const filePath = path.join(tmpDir, 'build-manifest.json');
      await mkdir(tmpDir, { recursive: true });
      const { writeFile } = await import('node:fs/promises');
      await writeFile(filePath, 'not-valid-json', 'utf-8');
      const result = await loadBuildManifest(tmpDir);
      expect(result).toBeNull();
    });

    it('should return null for JSON missing required fields', async () => {
      const filePath = path.join(tmpDir, 'build-manifest.json');
      const { writeFile } = await import('node:fs/promises');
      await writeFile(filePath, JSON.stringify({ foo: 'bar' }), 'utf-8');
      const result = await loadBuildManifest(tmpDir);
      expect(result).toBeNull();
    });
  });

  describe('saveBuildManifest', () => {
    it('should create cache directory and save manifest', async () => {
      const nestedDir = path.join(tmpDir, 'nested', 'cache');
      await saveBuildManifest(nestedDir, sampleManifest);

      const raw = await readFile(path.join(nestedDir, 'build-manifest.json'), 'utf-8');
      const parsed = JSON.parse(raw);
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.entries['page-1'].inputHash).toBe('hash-1');
    });

    it('should overwrite existing manifest', async () => {
      await saveBuildManifest(tmpDir, sampleManifest);

      const updated: BuildManifest = {
        ...sampleManifest,
        builtAt: '2026-02-01T00:00:00.000Z',
      };
      await saveBuildManifest(tmpDir, updated);

      const result = await loadBuildManifest(tmpDir);
      expect(result!.builtAt).toBe('2026-02-01T00:00:00.000Z');
    });
  });

  describe('hasEntryChanged', () => {
    const entry: PageEntry = {
      id: 'page-1',
      slug: 'page-1',
      url: '/page-1',
      title: 'Page 1',
      description: 'Description',
      dimensions: { city: 'nyc' },
      data: {},
      inputHash: 'hash-1',
    };

    it('should return false when entry hash matches manifest', () => {
      expect(hasEntryChanged(entry, sampleManifest)).toBe(false);
    });

    it('should return true when entry hash differs', () => {
      const changed: PageEntry = { ...entry, inputHash: 'different-hash' };
      expect(hasEntryChanged(changed, sampleManifest)).toBe(true);
    });

    it('should return true when entry is not in manifest', () => {
      const newEntry: PageEntry = { ...entry, id: 'page-new' };
      expect(hasEntryChanged(newEntry, sampleManifest)).toBe(true);
    });
  });
});
