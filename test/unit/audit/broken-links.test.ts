import { describe, it, expect } from 'vitest';
import { checkBrokenLinks } from '../../../src/audit/broken-links.js';

describe('checkBrokenLinks', () => {
  it('should detect broken internal links', () => {
    const pages = [
      { url: '/page-1', links: ['/page-2', '/page-3'] },
      { url: '/page-2', links: ['/page-1'] },
    ];
    const results = checkBrokenLinks(pages);
    expect(results.length).toBe(1);
    expect(results[0]).toEqual({ source: '/page-1', target: '/page-3' });
  });

  it('should not flag valid internal links', () => {
    const pages = [
      { url: '/page-1', links: ['/page-2'] },
      { url: '/page-2', links: ['/page-1'] },
    ];
    const results = checkBrokenLinks(pages);
    expect(results.length).toBe(0);
  });

  it('should skip external links', () => {
    const pages = [
      { url: '/page-1', links: ['https://example.com', 'http://foo.com', '/page-2'] },
      { url: '/page-2', links: [] },
    ];
    const results = checkBrokenLinks(pages);
    expect(results.length).toBe(0);
  });

  it('should skip anchor-only links', () => {
    const pages = [
      { url: '/page-1', links: ['#section-1', '#top'] },
    ];
    const results = checkBrokenLinks(pages);
    expect(results.length).toBe(0);
  });

  it('should handle links with hash fragments', () => {
    const pages = [
      { url: '/page-1', links: ['/page-2#section'] },
      { url: '/page-2', links: [] },
    ];
    const results = checkBrokenLinks(pages);
    expect(results.length).toBe(0);
  });

  it('should report multiple broken links from same page', () => {
    const pages = [
      { url: '/page-1', links: ['/missing-a', '/missing-b'] },
    ];
    const results = checkBrokenLinks(pages);
    expect(results.length).toBe(2);
  });

  it('should handle empty pages list', () => {
    expect(checkBrokenLinks([])).toEqual([]);
  });
});
