import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

export interface CacheEntry {
  prompt: string;
  response: string;
  model: string;
  createdAt: string;
  tokens: number;
}

export interface CacheOptions {
  cacheDir?: string;
  ttlDays?: number;
}

const DEFAULT_CACHE_DIR = '.seo-cache/ai-cache';
const DEFAULT_TTL_DAYS = 30;

export function computeCacheKey(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number,
): string {
  const input = JSON.stringify({ prompt, model, temperature, maxTokens });
  return createHash('sha256').update(input).digest('hex');
}

function getCachePath(cacheDir: string, key: string): string {
  return path.join(cacheDir, `${key}.json`);
}

function isExpired(createdAt: string, ttlDays: number): boolean {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
  return now - created > ttlMs;
}

export async function readCache(
  key: string,
  options: CacheOptions = {},
): Promise<{ entry: CacheEntry; stale: boolean } | null> {
  const cacheDir = options.cacheDir ?? DEFAULT_CACHE_DIR;
  const ttlDays = options.ttlDays ?? DEFAULT_TTL_DAYS;
  const filePath = getCachePath(cacheDir, key);

  let raw: string;
  try {
    raw = await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }

  let entry: CacheEntry;
  try {
    entry = JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }

  const stale = isExpired(entry.createdAt, ttlDays);
  return { entry, stale };
}

export async function writeCache(
  key: string,
  entry: CacheEntry,
  options: CacheOptions = {},
): Promise<void> {
  const cacheDir = options.cacheDir ?? DEFAULT_CACHE_DIR;
  const filePath = getCachePath(cacheDir, key);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(entry, null, 2), 'utf-8');
}
