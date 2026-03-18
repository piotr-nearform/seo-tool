import { describe, it, expect } from 'vitest';
import {
  checkUniqueness,
  shingleize,
  minHashSignature,
  jaccardFromSignatures,
} from '../../../src/audit/uniqueness.js';

describe('shingleize', () => {
  it('should produce 3-word shingles', () => {
    const shingles = shingleize('the quick brown fox jumps');
    expect(shingles.size).toBe(3); // "the quick brown", "quick brown fox", "brown fox jumps"
  });

  it('should return empty set for text shorter than n', () => {
    const shingles = shingleize('hello world');
    expect(shingles.size).toBe(0);
  });

  it('should be case-insensitive', () => {
    const s1 = shingleize('The Quick Brown');
    const s2 = shingleize('the quick brown');
    expect(s1).toEqual(s2);
  });
});

describe('minHashSignature', () => {
  it('should produce a signature of the specified length', () => {
    const shingles = shingleize('the quick brown fox jumps over the lazy dog');
    const sig = minHashSignature(shingles, 64);
    expect(sig.length).toBe(64);
  });

  it('should produce identical signatures for identical inputs', () => {
    const s1 = shingleize('the quick brown fox');
    const s2 = shingleize('the quick brown fox');
    const sig1 = minHashSignature(s1);
    const sig2 = minHashSignature(s2);
    expect(jaccardFromSignatures(sig1, sig2)).toBe(1.0);
  });
});

describe('jaccardFromSignatures', () => {
  it('should return 1.0 for identical signatures', () => {
    const sig = new Uint32Array([1, 2, 3, 4]);
    expect(jaccardFromSignatures(sig, sig)).toBe(1.0);
  });

  it('should return 0.0 for completely different signatures', () => {
    const sig1 = new Uint32Array([1, 2, 3, 4]);
    const sig2 = new Uint32Array([5, 6, 7, 8]);
    expect(jaccardFromSignatures(sig1, sig2)).toBe(0.0);
  });
});

describe('checkUniqueness', () => {
  it('should detect identical content as highly similar', () => {
    const content = 'This is a test page with enough words to generate multiple shingles for the minhash algorithm to work properly on the content';
    const pages = [
      { url: '/page-1', content },
      { url: '/page-2', content },
    ];
    const results = checkUniqueness(pages, 0.3);
    expect(results.length).toBe(2);
    expect(results[0].score).toBeGreaterThan(0.9);
  });

  it('should not flag completely different content', () => {
    const pages = [
      { url: '/page-1', content: 'alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima mike' },
      { url: '/page-2', content: 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen' },
    ];
    const results = checkUniqueness(pages, 0.3);
    expect(results.length).toBe(0);
  });

  it('should detect partially similar content above threshold', () => {
    const base = 'the quick brown fox jumps over the lazy dog near the river bank in the morning sun';
    const pages = [
      { url: '/page-1', content: base },
      { url: '/page-2', content: base + ' with extra unique words added here to make it slightly different but still quite similar overall' },
    ];
    const results = checkUniqueness(pages, 0.1);
    // Should flag at least one
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return empty for a single page', () => {
    const results = checkUniqueness([{ url: '/page-1', content: 'some content here and more' }]);
    expect(results).toEqual([]);
  });

  it('should include page and nearestSibling in results', () => {
    const content = 'Repeated content that is long enough for shingles to be generated properly by the algorithm here we go';
    const pages = [
      { url: '/a', content },
      { url: '/b', content },
    ];
    const results = checkUniqueness(pages, 0.3);
    expect(results.length).toBe(2);
    const r = results.find((r) => r.page === '/a');
    expect(r?.nearestSibling).toBe('/b');
  });
});
