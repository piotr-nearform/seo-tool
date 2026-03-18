import { describe, it, expect } from 'vitest';
import { generateStructuredData } from '../../../src/builder/structured-data.js';
import type { PageEntry, SEOConfig } from '../../../src/schemas/index.js';

function makeEntry(overrides: Partial<PageEntry> = {}): PageEntry {
  return {
    id: 'test-page',
    slug: 'test-page',
    url: '/services/plumbing',
    title: 'Plumbing Services',
    description: 'Best plumbing services.',
    dimensions: { city: 'new-york', service: 'plumbing' },
    data: {},
    inputHash: 'abc123',
    ...overrides,
  };
}

function makeSEOConfig(overrides: Partial<SEOConfig> = {}): SEOConfig {
  return {
    siteName: 'ServicePro',
    schemaTypes: ['WebPage'],
    internalLinking: { enabled: true, maxLinksPerPage: 5, strategy: 'shared-dimension' },
    ...overrides,
  };
}

const BASE_URL = 'https://example.com';

describe('structured-data', () => {
  describe('WebPage schema', () => {
    it('should generate WebPage JSON-LD', () => {
      const result = generateStructuredData(makeEntry(), makeSEOConfig(), BASE_URL);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Plumbing Services',
        url: 'https://example.com/services/plumbing',
        description: 'Best plumbing services.',
      });
    });
  });

  describe('BreadcrumbList schema', () => {
    it('should generate BreadcrumbList JSON-LD from URL segments', () => {
      const config = makeSEOConfig({ schemaTypes: ['BreadcrumbList'] });
      const result = generateStructuredData(makeEntry(), config, BASE_URL);
      expect(result).toHaveLength(1);
      const breadcrumbs = result[0] as any;
      expect(breadcrumbs['@type']).toBe('BreadcrumbList');
      expect(breadcrumbs.itemListElement).toHaveLength(3);
      expect(breadcrumbs.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://example.com/',
      });
      expect(breadcrumbs.itemListElement[2]).toEqual({
        '@type': 'ListItem',
        position: 3,
        name: 'Plumbing',
        item: 'https://example.com/services/plumbing',
      });
    });
  });

  describe('FAQPage schema', () => {
    it('should generate FAQPage when content blocks contain FAQ', () => {
      const config = makeSEOConfig({ schemaTypes: ['FAQPage'] });
      const content = { faq: '<h3>Q: What?</h3><p>A: That.</p>' };
      const result = generateStructuredData(makeEntry(), config, BASE_URL, content);
      expect(result).toHaveLength(1);
      expect((result[0] as any)['@type']).toBe('FAQPage');
    });

    it('should not generate FAQPage when no FAQ content blocks', () => {
      const config = makeSEOConfig({ schemaTypes: ['FAQPage'] });
      const content = { intro: '<p>Hello</p>' };
      const result = generateStructuredData(makeEntry(), config, BASE_URL, content);
      expect(result).toHaveLength(0);
    });

    it('should not generate FAQPage when no content blocks provided', () => {
      const config = makeSEOConfig({ schemaTypes: ['FAQPage'] });
      const result = generateStructuredData(makeEntry(), config, BASE_URL);
      expect(result).toHaveLength(0);
    });
  });

  describe('Product schema', () => {
    it('should generate Product when dimensions suggest product data', () => {
      const config = makeSEOConfig({ schemaTypes: ['Product'] });
      const entry = makeEntry({ dimensions: { product: 'widget', brand: 'acme' } });
      const result = generateStructuredData(entry, config, BASE_URL);
      expect(result).toHaveLength(1);
      expect((result[0] as any)['@type']).toBe('Product');
      expect((result[0] as any).name).toBe('Plumbing Services');
    });

    it('should not generate Product when dimensions do not suggest product data', () => {
      const config = makeSEOConfig({ schemaTypes: ['Product'] });
      const entry = makeEntry({ dimensions: { city: 'nyc', service: 'plumbing' } });
      const result = generateStructuredData(entry, config, BASE_URL);
      expect(result).toHaveLength(0);
    });
  });

  describe('multiple schema types', () => {
    it('should generate multiple schema objects when configured', () => {
      const config = makeSEOConfig({ schemaTypes: ['WebPage', 'BreadcrumbList'] });
      const result = generateStructuredData(makeEntry(), config, BASE_URL);
      expect(result).toHaveLength(2);
      expect((result[0] as any)['@type']).toBe('WebPage');
      expect((result[1] as any)['@type']).toBe('BreadcrumbList');
    });
  });
});
