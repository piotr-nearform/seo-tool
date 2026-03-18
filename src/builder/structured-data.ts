import type { PageEntry, SEOConfig } from '../schemas/index.js';
import { generateBreadcrumbs } from './seo-metadata.js';

/**
 * Generate a WebPage JSON-LD object.
 */
function generateWebPage(entry: PageEntry, baseUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: entry.title,
    url: baseUrl + entry.url,
    description: entry.description,
  };
}

/**
 * Generate a BreadcrumbList JSON-LD object from URL path segments.
 */
function generateBreadcrumbList(entry: PageEntry, baseUrl: string): object {
  const breadcrumbs = generateBreadcrumbs(entry.url, baseUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Generate a FAQPage JSON-LD object.
 * Only generated if the page has FAQ-related content blocks.
 */
function generateFAQPage(entry: PageEntry): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [],
  };
}

/**
 * Generate a Product JSON-LD object.
 * Only generated if page dimensions suggest product data.
 */
function generateProduct(entry: PageEntry, baseUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: entry.title,
    description: entry.description,
    url: baseUrl + entry.url,
  };
}

/**
 * Generate JSON-LD structured data objects based on configured schema types.
 */
export function generateStructuredData(
  entry: PageEntry,
  seoConfig: SEOConfig,
  baseUrl: string,
  contentBlocks?: Record<string, string>,
): object[] {
  const results: object[] = [];

  for (const schemaType of seoConfig.schemaTypes) {
    switch (schemaType) {
      case 'WebPage':
        results.push(generateWebPage(entry, baseUrl));
        break;
      case 'BreadcrumbList':
        results.push(generateBreadcrumbList(entry, baseUrl));
        break;
      case 'FAQPage':
        if (contentBlocks && hasFAQContent(contentBlocks)) {
          results.push(generateFAQPage(entry));
        }
        break;
      case 'Product':
        if (hasProductDimensions(entry)) {
          results.push(generateProduct(entry, baseUrl));
        }
        break;
    }
  }

  return results;
}

/**
 * Check if content blocks contain FAQ-like content.
 */
function hasFAQContent(contentBlocks: Record<string, string>): boolean {
  const faqKeys = Object.keys(contentBlocks).filter(
    (k) => k.toLowerCase().includes('faq') || k.toLowerCase().includes('question'),
  );
  return faqKeys.length > 0;
}

/**
 * Check if page dimensions suggest product data.
 */
function hasProductDimensions(entry: PageEntry): boolean {
  const dimensionKeys = Object.keys(entry.dimensions).map((k) => k.toLowerCase());
  return dimensionKeys.some(
    (k) => k.includes('product') || k.includes('brand') || k.includes('price'),
  );
}
