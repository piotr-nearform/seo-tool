import { describe, it, expect } from 'vitest';
import { generateSEOMetadata, generateBreadcrumbs } from '../../../src/builder/seo-metadata.js';
import type { PageEntry, SEOConfig } from '../../../src/schemas/index.js';

function makeEntry(overrides: Partial<PageEntry> = {}): PageEntry {
  return {
    id: 'test-page',
    slug: 'test-page',
    url: '/services/plumbing',
    title: 'Plumbing Services in New York',
    description: 'Best plumbing services in the New York area.',
    dimensions: { city: 'new-york', service: 'plumbing' },
    data: {},
    inputHash: 'abc123',
    ...overrides,
  };
}

function makeSEOConfig(overrides: Partial<SEOConfig> = {}): SEOConfig {
  return {
    siteName: 'ServicePro',
    schemaTypes: ['WebPage', 'BreadcrumbList'],
    internalLinking: { enabled: true, maxLinksPerPage: 5, strategy: 'shared-dimension' },
    ...overrides,
  };
}

const BASE_URL = 'https://example.com';

describe('seo-metadata', () => {
  describe('generateBreadcrumbs', () => {
    it('should generate breadcrumbs from URL path', () => {
      const crumbs = generateBreadcrumbs('/services/plumbing', BASE_URL);
      expect(crumbs).toEqual([
        { name: 'Home', url: 'https://example.com/' },
        { name: 'Services', url: 'https://example.com/services' },
        { name: 'Plumbing', url: 'https://example.com/services/plumbing' },
      ]);
    });

    it('should handle root URL', () => {
      const crumbs = generateBreadcrumbs('/', BASE_URL);
      expect(crumbs).toEqual([{ name: 'Home', url: 'https://example.com/' }]);
    });

    it('should handle multi-word segments', () => {
      const crumbs = generateBreadcrumbs('/new-york/drain-cleaning', BASE_URL);
      expect(crumbs[1].name).toBe('New York');
      expect(crumbs[2].name).toBe('Drain Cleaning');
    });
  });

  describe('generateSEOMetadata', () => {
    it('should generate title and description from entry', () => {
      const entry = makeEntry();
      const result = generateSEOMetadata(entry, makeSEOConfig(), BASE_URL);
      expect(result.title).toBe('Plumbing Services in New York');
      expect(result.description).toBe('Best plumbing services in the New York area.');
    });

    it('should generate canonical URL from baseUrl + entry.url', () => {
      const entry = makeEntry({ url: '/services/plumbing' });
      const result = generateSEOMetadata(entry, makeSEOConfig(), BASE_URL);
      expect(result.canonical).toBe('https://example.com/services/plumbing');
    });

    it('should generate OG tags', () => {
      const entry = makeEntry();
      const result = generateSEOMetadata(entry, makeSEOConfig(), BASE_URL);
      expect(result.ogTags['og:title']).toBe(entry.title);
      expect(result.ogTags['og:description']).toBe(entry.description);
      expect(result.ogTags['og:url']).toBe('https://example.com/services/plumbing');
      expect(result.ogTags['og:type']).toBe('website');
    });

    it('should include og:image when defaultOgImage is configured', () => {
      const config = makeSEOConfig({ defaultOgImage: 'https://example.com/og.png' });
      const result = generateSEOMetadata(makeEntry(), config, BASE_URL);
      expect(result.ogTags['og:image']).toBe('https://example.com/og.png');
    });

    it('should not include og:image when defaultOgImage is not configured', () => {
      const result = generateSEOMetadata(makeEntry(), makeSEOConfig(), BASE_URL);
      expect(result.ogTags['og:image']).toBeUndefined();
    });

    it('should generate Twitter card tags', () => {
      const entry = makeEntry();
      const result = generateSEOMetadata(entry, makeSEOConfig(), BASE_URL);
      expect(result.twitterTags['twitter:card']).toBe('summary');
      expect(result.twitterTags['twitter:title']).toBe(entry.title);
      expect(result.twitterTags['twitter:description']).toBe(entry.description);
    });

    it('should generate breadcrumbs from URL path', () => {
      const result = generateSEOMetadata(makeEntry(), makeSEOConfig(), BASE_URL);
      expect(result.breadcrumbs.length).toBe(3);
      expect(result.breadcrumbs[0].name).toBe('Home');
      expect(result.breadcrumbs[2].name).toBe('Plumbing');
    });

    it('should initialize jsonLd as empty array', () => {
      const result = generateSEOMetadata(makeEntry(), makeSEOConfig(), BASE_URL);
      expect(result.jsonLd).toEqual([]);
    });
  });
});
