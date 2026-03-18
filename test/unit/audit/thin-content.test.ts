import { describe, it, expect } from 'vitest';
import { checkThinContent } from '../../../src/audit/thin-content.js';

describe('checkThinContent', () => {
  it('should flag pages below the threshold', () => {
    const pages = [
      { url: '/short', content: 'Just a few words here' },
    ];
    const results = checkThinContent(pages, 300);
    expect(results.length).toBe(1);
    expect(results[0].page).toBe('/short');
    expect(results[0].wordCount).toBe(5);
    expect(results[0].threshold).toBe(300);
  });

  it('should not flag pages above the threshold', () => {
    const longContent = Array(301).fill('word').join(' ');
    const pages = [{ url: '/long', content: longContent }];
    const results = checkThinContent(pages, 300);
    expect(results.length).toBe(0);
  });

  it('should strip HTML tags before counting', () => {
    const pages = [
      { url: '/html', content: '<p>One</p> <strong>Two</strong> <em>Three</em>' },
    ];
    const results = checkThinContent(pages, 5);
    expect(results.length).toBe(1);
    expect(results[0].wordCount).toBe(3);
  });

  it('should use default threshold of 300', () => {
    const pages = [
      { url: '/a', content: Array(50).fill('word').join(' ') },
    ];
    const results = checkThinContent(pages);
    expect(results.length).toBe(1);
    expect(results[0].threshold).toBe(300);
  });

  it('should handle mixed pages', () => {
    const pages = [
      { url: '/short', content: 'short page' },
      { url: '/long', content: Array(500).fill('word').join(' ') },
      { url: '/medium', content: Array(100).fill('word').join(' ') },
    ];
    const results = checkThinContent(pages, 200);
    expect(results.length).toBe(2);
    expect(results.map((r) => r.page)).toContain('/short');
    expect(results.map((r) => r.page)).toContain('/medium');
  });

  it('should handle empty content', () => {
    const pages = [{ url: '/empty', content: '' }];
    const results = checkThinContent(pages, 1);
    expect(results.length).toBe(1);
    expect(results[0].wordCount).toBe(0);
  });
});
