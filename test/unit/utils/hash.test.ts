import { describe, it, expect } from 'vitest';
import { sha256, pageId } from '../../../src/utils/hash.js';

describe('sha256', () => {
  it('should produce a 64-char hex string', () => {
    const result = sha256('hello');
    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[a-f0-9]+$/);
  });

  it('should be deterministic', () => {
    expect(sha256('test')).toBe(sha256('test'));
  });

  it('should produce different hashes for different inputs', () => {
    expect(sha256('a')).not.toBe(sha256('b'));
  });
});

describe('pageId', () => {
  it('should produce deterministic IDs from dimensions', () => {
    const dims = { city: 'new-york', service: 'plumbing' };
    const id1 = pageId(dims);
    const id2 = pageId(dims);
    expect(id1).toBe(id2);
  });

  it('should produce same ID regardless of key order', () => {
    const id1 = pageId({ city: 'ny', service: 'plumbing' });
    const id2 = pageId({ service: 'plumbing', city: 'ny' });
    expect(id1).toBe(id2);
  });

  it('should produce different IDs for different values', () => {
    const id1 = pageId({ city: 'ny' });
    const id2 = pageId({ city: 'la' });
    expect(id1).not.toBe(id2);
  });

  it('should produce a 64-char hex string', () => {
    const id = pageId({ x: 'y' });
    expect(id).toHaveLength(64);
    expect(id).toMatch(/^[a-f0-9]+$/);
  });
});
