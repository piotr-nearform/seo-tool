import type { PageEntry, SEOConfig } from '../schemas/index.js';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface InternalLink {
  targetUrl: string;
  anchorText: string;
  relationship: string;
}

export interface GeneratedAsset {
  path: string;
  type: string;
}

export interface PageSEOData {
  title: string;
  description: string;
  canonical: string;
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
  jsonLd: object[];
  breadcrumbs: BreadcrumbItem[];
}

export interface PageData {
  entry: PageEntry;
  content: Record<string, string>;
  assets: GeneratedAsset[];
  seo: PageSEOData;
  internalLinks: InternalLink[];
}
