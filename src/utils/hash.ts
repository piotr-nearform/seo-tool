import { createHash } from 'node:crypto';

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Generate a deterministic page ID from sorted dimension key-value pairs.
 */
export function pageId(dimensions: Record<string, string>): string {
  const sorted = Object.keys(dimensions)
    .sort()
    .map((k) => `${k}=${dimensions[k]}`)
    .join('|');
  return sha256(sorted);
}
