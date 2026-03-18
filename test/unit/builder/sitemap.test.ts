import { describe, it, expect } from 'vitest';
import { generateSitemap } from '../../../src/builder/sitemap.js';
import { generateRobots } from '../../../src/builder/robots.js';
import type { PageEntry } from '../../../src/schemas/index.js';

function makeEntry(overrides: Partial<PageEntry> = {}): PageEntry {
  return {
    id: 'test',
    slug: 'test',
    url: '/test',
    title: 'Test',
    description: 'A test page',
    dimensions: {},
    data: {},
    inputHash: 'abc',
    ...overrides,
  };
}

const BASE_URL = 'https://example.com';

describe('sitemap', () => {
  describe('generateSitemap', () => {
    it('should generate valid XML sitemap', () => {
      const pages = [
        makeEntry({ url: '/page-one' }),
        makeEntry({ url: '/page-two' }),
      ];
      const xml = generateSitemap(pages, BASE_URL);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(xml).toContain('<loc>https://example.com/page-one</loc>');
      expect(xml).toContain('<loc>https://example.com/page-two</loc>');
      expect(xml).toContain('<changefreq>weekly</changefreq>');
      expect(xml).toContain('</urlset>');
    });

    it('should include lastmod dates', () => {
      const xml = generateSitemap([makeEntry()], BASE_URL);
      // Should match YYYY-MM-DD format
      expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
    });

    it('should handle empty pages array', () => {
      const xml = generateSitemap([], BASE_URL);
      expect(xml).toContain('<urlset');
      expect(xml).toContain('</urlset>');
      expect(xml).not.toContain('<url>');
    });

    it('should escape XML special characters in URLs', () => {
      const pages = [makeEntry({ url: '/page?foo=1&bar=2' })];
      const xml = generateSitemap(pages, BASE_URL);
      expect(xml).toContain('&amp;');
      expect(xml).not.toContain('&bar');
    });
  });
});

describe('robots', () => {
  describe('generateRobots', () => {
    it('should generate robots.txt with sitemap reference', () => {
      const robots = generateRobots(BASE_URL, '/sitemap.xml');
      expect(robots).toContain('User-agent: *');
      expect(robots).toContain('Allow: /');
      expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');
    });

    it('should allow all by default', () => {
      const robots = generateRobots(BASE_URL, '/sitemap.xml');
      expect(robots).toContain('Allow: /');
      expect(robots).not.toContain('Disallow');
    });
  });
});
