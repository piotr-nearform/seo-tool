import type { PageEntry } from '../schemas/index.js';
import type { InternalLink } from '../builder/types.js';

export interface InternalLinkConfig {
  enabled: boolean;
  maxLinksPerPage: number;
  strategy: 'shared-dimension';
}

/**
 * Compute internal links for a page based on shared dimensions.
 * Pages sharing more dimension values rank higher.
 */
export function computeInternalLinks(
  entry: PageEntry,
  allEntries: PageEntry[],
  config: InternalLinkConfig,
): InternalLink[] {
  if (!config.enabled) return [];

  const candidates: { entry: PageEntry; sharedDims: string[]; count: number }[] = [];

  for (const other of allEntries) {
    // Don't link to self
    if (other.id === entry.id) continue;

    const sharedDims: string[] = [];
    for (const [key, value] of Object.entries(entry.dimensions)) {
      if (other.dimensions[key] === value) {
        sharedDims.push(key);
      }
    }

    if (sharedDims.length > 0) {
      candidates.push({ entry: other, sharedDims, count: sharedDims.length });
    }
  }

  // Sort by number of shared dimensions (descending), then by URL for stability
  candidates.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.entry.url.localeCompare(b.entry.url);
  });

  // Limit to maxLinksPerPage
  const limited = candidates.slice(0, config.maxLinksPerPage);

  return limited.map((c) => ({
    targetUrl: c.entry.url,
    anchorText: c.entry.title,
    relationship: `same-${c.sharedDims[0]}`,
  }));
}
