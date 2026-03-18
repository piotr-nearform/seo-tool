import { describe, it, expect } from 'vitest';
import { slugify } from '../../../src/utils/slug.js';

describe('slugify', () => {
  it('should lowercase input', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz');
  });

  it('should remove special characters', () => {
    expect(slugify('hello! @world# $test')).toBe('hello-world-test');
  });

  it('should collapse multiple hyphens', () => {
    expect(slugify('foo---bar')).toBe('foo-bar');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(slugify('-hello-world-')).toBe('hello-world');
  });

  it('should handle unicode characters by stripping diacritics', () => {
    expect(slugify('cafe\u0301')).toBe('cafe'); // café
    expect(slugify('Uber\u0308')).toBe('uber'); // Über
    expect(slugify('resume\u0301')).toBe('resume'); // resumé
  });

  it('should handle precomposed unicode', () => {
    expect(slugify('\u00e9t\u00e9')).toBe('ete'); // été
    expect(slugify('na\u00efve')).toBe('naive'); // naïve
  });

  it('should truncate to 75 characters max', () => {
    const longInput = 'a-very-long-slug ' + 'word '.repeat(20);
    const result = slugify(longInput);
    expect(result.length).toBeLessThanOrEqual(75);
  });

  it('should truncate at word boundary when possible', () => {
    // Create a string that would be > 75 chars when slugified
    const words = Array.from({ length: 20 }, (_, i) => `word${i}`).join(' ');
    const result = slugify(words);
    expect(result.length).toBeLessThanOrEqual(75);
    expect(result).not.toMatch(/-$/);
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('should handle URL paths', () => {
    expect(slugify('/new-york/plumbing')).toBe('new-york-plumbing');
  });

  it('should handle underscores', () => {
    expect(slugify('hello_world')).toBe('hello-world');
  });
});
