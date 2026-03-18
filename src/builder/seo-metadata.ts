import type { PageEntry, SEOConfig } from '../schemas/index.js';
import type { PageSEOData, BreadcrumbItem } from './types.js';

/**
 * Generate breadcrumbs from a URL path.
 */
export function generateBreadcrumbs(url: string, baseUrl: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [{ name: 'Home', url: baseUrl + '/' }];

  const segments = url.split('/').filter(Boolean);
  let currentPath = '';

  for (const segment of segments) {
    currentPath += '/' + segment;
    const name = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    breadcrumbs.push({ name, url: baseUrl + currentPath });
  }

  return breadcrumbs;
}

/**
 * Generate full SEO metadata for a page entry.
 */
export function generateSEOMetadata(
  entry: PageEntry,
  seoConfig: SEOConfig,
  baseUrl: string,
): PageSEOData {
  const canonical = baseUrl + entry.url;
  const breadcrumbs = generateBreadcrumbs(entry.url, baseUrl);

  const ogTags: Record<string, string> = {
    'og:title': entry.title,
    'og:description': entry.description,
    'og:url': canonical,
    'og:type': 'website',
  };

  if (seoConfig.defaultOgImage) {
    ogTags['og:image'] = seoConfig.defaultOgImage;
  }

  const twitterTags: Record<string, string> = {
    'twitter:card': 'summary',
    'twitter:title': entry.title,
    'twitter:description': entry.description,
  };

  return {
    title: entry.title,
    description: entry.description,
    canonical,
    ogTags,
    twitterTags,
    jsonLd: [],
    breadcrumbs,
  };
}
