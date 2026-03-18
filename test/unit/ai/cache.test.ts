import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  computeCacheKey,
  readCache,
  writeCache,
  type CacheEntry,
} from '../../../src/ai/cache.js';

// --- Story 5.4: AI response caching ---

describe('AI cache', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'seo-cache-test-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe('computeCacheKey', () => {
    it('should return a consistent hash for the same inputs', () => {
      const key1 = computeCacheKey('prompt', 'gpt-4o', 0.7, 1000);
      const key2 = computeCacheKey('prompt', 'gpt-4o', 0.7, 1000);
      expect(key1).toBe(key2);
    });

    it('should return different hashes for different prompts', () => {
      const key1 = computeCacheKey('prompt1', 'gpt-4o', 0.7, 1000);
      const key2 = computeCacheKey('prompt2', 'gpt-4o', 0.7, 1000);
      expect(key1).not.toBe(key2);
    });

    it('should return different hashes for different models', () => {
      const key1 = computeCacheKey('prompt', 'gpt-4o', 0.7, 1000);
      const key2 = computeCacheKey('prompt', 'gpt-4o-mini', 0.7, 1000);
      expect(key1).not.toBe(key2);
    });

    it('should return different hashes for different temperatures', () => {
      const key1 = computeCacheKey('prompt', 'gpt-4o', 0.7, 1000);
      const key2 = computeCacheKey('prompt', 'gpt-4o', 0.9, 1000);
      expect(key1).not.toBe(key2);
    });

    it('should return a 64-character hex string (SHA-256)', () => {
      const key = computeCacheKey('prompt', 'gpt-4o', 0.7, 1000);
      expect(key).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('writeCache / readCache', () => {
    const entry: CacheEntry = {
      prompt: 'Write about London',
      response: 'London is a great city.',
      model: 'gpt-4o',
      createdAt: new Date().toISOString(),
      tokens: 50,
    };

    it('should write and read a cache entry', async () => {
      const key = 'test-key-1';
      await writeCache(key, entry, { cacheDir: tmpDir });

      const result = await readCache(key, { cacheDir: tmpDir });
      expect(result).not.toBeNull();
      expect(result!.entry.prompt).toBe('Write about London');
      expect(result!.entry.response).toBe('London is a great city.');
      expect(result!.stale).toBe(false);
    });

    it('should return null for cache miss', async () => {
      const result = await readCache('nonexistent', { cacheDir: tmpDir });
      expect(result).toBeNull();
    });

    it('should detect stale entries based on TTL', async () => {
      const oldEntry: CacheEntry = {
        ...entry,
        createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const key = 'stale-key';
      await writeCache(key, oldEntry, { cacheDir: tmpDir });

      const result = await readCache(key, { cacheDir: tmpDir, ttlDays: 30 });
      expect(result).not.toBeNull();
      expect(result!.stale).toBe(true);
    });

    it('should not mark recent entries as stale', async () => {
      const freshEntry: CacheEntry = {
        ...entry,
        createdAt: new Date().toISOString(),
      };

      const key = 'fresh-key';
      await writeCache(key, freshEntry, { cacheDir: tmpDir });

      const result = await readCache(key, { cacheDir: tmpDir, ttlDays: 30 });
      expect(result).not.toBeNull();
      expect(result!.stale).toBe(false);
    });

    it('should use custom TTL', async () => {
      const twoDaysOld: CacheEntry = {
        ...entry,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const key = 'ttl-key';
      await writeCache(key, twoDaysOld, { cacheDir: tmpDir });

      // With 1-day TTL, should be stale
      const staleResult = await readCache(key, { cacheDir: tmpDir, ttlDays: 1 });
      expect(staleResult!.stale).toBe(true);

      // With 7-day TTL, should be fresh
      const freshResult = await readCache(key, { cacheDir: tmpDir, ttlDays: 7 });
      expect(freshResult!.stale).toBe(false);
    });

    it('should handle corrupted cache files', async () => {
      const { writeFile } = await import('node:fs/promises');
      await writeFile(path.join(tmpDir, 'bad.json'), 'not json', 'utf-8');

      const result = await readCache('bad', { cacheDir: tmpDir });
      expect(result).toBeNull();
    });
  });
});
