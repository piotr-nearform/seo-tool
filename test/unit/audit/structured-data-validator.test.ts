import { describe, it, expect } from 'vitest';
import { validateStructuredData } from '../../../src/audit/structured-data-validator.js';

describe('validateStructuredData', () => {
  it('should pass valid WebPage JSON-LD', () => {
    const pages = [
      {
        url: '/page-1',
        jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Test', url: '/page-1' }],
      },
    ];
    const results = validateStructuredData(pages);
    expect(results.length).toBe(0);
  });

  it('should flag missing @context', () => {
    const pages = [
      {
        url: '/page-1',
        jsonLd: [{ '@type': 'WebPage', name: 'Test', url: '/page-1' }],
      },
    ];
    const results = validateStructuredData(pages);
    expect(results.length).toBe(1);
    expect(results[0].errors).toContain('Missing @context');
  });

  it('should flag invalid @context', () => {
    const pages = [
      {
        url: '/page-1',
        jsonLd: [{ '@context': 'http://schema.org', '@type': 'WebPage', name: 'Test', url: '/page-1' }],
      },
    ];
    const results = validateStructuredData(pages);
    expect(results.length).toBe(1);
    expect(results[0].errors[0]).toContain('Invalid @context');
  });

  it('should flag missing @type', () => {
    const pages = [
      {
        url: '/page-1',
        jsonLd: [{ '@context': 'https://schema.org', name: 'Test' }],
      },
    ];
    const results = validateStructuredData(pages);
    expect(results.length).toBe(1);
    expect(results[0].errors).toContain('Missing @type');
  });

  it('should flag unknown @type', () => {
    const pages = [
      {
        url: '/page-1',
        jsonLd: [{ '@context': 'https://schema.org', '@type': 'FooBar' }],
      },
    ];
    const results = validateStructuredData(pages);
    expect(results.length).toBe(1);
    expect(results[0].errors[0]).toContain('Unknown schema type: FooBar');
  });

  it('should flag missing required fields for Product', () => {
    const pages = [
      {
        url: '/page-1',
        jsonLd: [{ '@context': 'https://schema.org', '@type': 'Product' }],
      },
    ];
    const results = validateStructuredData(pages);
    expect(results.length).toBe(1);
    expect(results[0].errors.some((e) => e.includes('name'))).toBe(true);
  });

  it('should pass valid Product', () => {
    const pages = [
      {
        url: '/page-1',
        jsonLd: [{ '@context': 'https://schema.org', '@type': 'Product', name: 'Widget' }],
      },
    ];
    const results = validateStructuredData(pages);
    expect(results.length).toBe(0);
  });

  it('should validate multiple JSON-LD objects per page', () => {
    const pages = [
      {
        url: '/page-1',
        jsonLd: [
          { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Test', url: '/page-1' },
          { '@context': 'https://schema.org', '@type': 'Product' }, // missing name
        ],
      },
    ];
    const results = validateStructuredData(pages);
    expect(results.length).toBe(1);
    expect(results[0].errors[0]).toContain('JSON-LD[1]');
  });

  it('should handle empty jsonLd array', () => {
    const pages = [{ url: '/page-1', jsonLd: [] }];
    const results = validateStructuredData(pages);
    expect(results.length).toBe(0);
  });

  it('should validate FAQPage requires mainEntity', () => {
    const pages = [
      {
        url: '/faq',
        jsonLd: [{ '@context': 'https://schema.org', '@type': 'FAQPage' }],
      },
    ];
    const results = validateStructuredData(pages);
    expect(results.length).toBe(1);
    expect(results[0].errors.some((e) => e.includes('mainEntity'))).toBe(true);
  });
});
