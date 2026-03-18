export interface BrokenLinkResult {
  source: string;
  target: string;
}

/**
 * Check for broken internal links.
 * External links (http://, https://) are skipped.
 * Returns broken internal links only.
 */
export function checkBrokenLinks(
  pages: { url: string; links: string[] }[],
): BrokenLinkResult[] {
  const knownUrls = new Set(pages.map((p) => p.url));
  const results: BrokenLinkResult[] = [];

  for (const page of pages) {
    for (const link of page.links) {
      // Skip external links
      if (link.startsWith('http://') || link.startsWith('https://')) continue;
      // Skip anchor-only links
      if (link.startsWith('#')) continue;

      // Strip hash fragment for comparison
      const target = link.split('#')[0];

      if (!knownUrls.has(target)) {
        results.push({
          source: page.url,
          target: link,
        });
      }
    }
  }

  return results;
}
