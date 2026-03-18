import { describe, it, expect } from 'vitest';
import { computeInternalLinks, InternalLinkConfig } from '../../../src/content/internal-links.js';
import type { PageEntry } from '../../../src/schemas/index.js';

function makeEntry(overrides: Partial<PageEntry> & Pick<PageEntry, 'id' | 'url' | 'title' | 'dimensions'>): PageEntry {
  return {
    slug: overrides.url.replace(/^\//, ''),
    description: '',
    data: {},
    inputHash: 'hash',
    ...overrides,
  };
}

const config: InternalLinkConfig = {
  enabled: true,
  maxLinksPerPage: 10,
  strategy: 'shared-dimension',
};

describe('computeInternalLinks', () => {
  const entries: PageEntry[] = [
    makeEntry({ id: '1', url: '/hotels-london', title: 'Hotels in London', dimensions: { city: 'London', category: 'Hotels' } }),
    makeEntry({ id: '2', url: '/restaurants-london', title: 'Restaurants in London', dimensions: { city: 'London', category: 'Restaurants' } }),
    makeEntry({ id: '3', url: '/hotels-paris', title: 'Hotels in Paris', dimensions: { city: 'Paris', category: 'Hotels' } }),
    makeEntry({ id: '4', url: '/restaurants-paris', title: 'Restaurants in Paris', dimensions: { city: 'Paris', category: 'Restaurants' } }),
    makeEntry({ id: '5', url: '/museums-tokyo', title: 'Museums in Tokyo', dimensions: { city: 'Tokyo', category: 'Museums' } }),
  ];

  it('should not link to self', () => {
    const links = computeInternalLinks(entries[0], entries, config);
    expect(links.every((l) => l.targetUrl !== entries[0].url)).toBe(true);
  });

  it('should find pages sharing dimensions', () => {
    const links = computeInternalLinks(entries[0], entries, config);
    // Entry 0 (London, Hotels) shares city with 1 (London), category with 2 (Paris Hotels)
    expect(links.length).toBeGreaterThan(0);
    const urls = links.map((l) => l.targetUrl);
    expect(urls).toContain('/restaurants-london'); // same city
    expect(urls).toContain('/hotels-paris'); // same category
  });

  it('should rank by number of shared dimensions (more shared = first)', () => {
    // Entry 3 (Paris, Restaurants) shares both city+category with nobody,
    // but shares city with entry 2 (Paris Hotels) and category with entry 1 (London Restaurants)
    const links = computeInternalLinks(entries[3], entries, config);
    // Each candidate shares exactly 1 dimension, except museums-tokyo shares 0
    expect(links.find((l) => l.targetUrl === '/museums-tokyo')).toBeUndefined();
  });

  it('should generate anchor text from target page title', () => {
    const links = computeInternalLinks(entries[0], entries, config);
    const londonRestaurant = links.find((l) => l.targetUrl === '/restaurants-london');
    expect(londonRestaurant?.anchorText).toBe('Restaurants in London');
  });

  it('should set relationship based on shared dimension', () => {
    const links = computeInternalLinks(entries[0], entries, config);
    for (const link of links) {
      expect(link.relationship).toMatch(/^same-/);
    }
  });

  it('should respect maxLinksPerPage', () => {
    const limitedConfig: InternalLinkConfig = { enabled: true, maxLinksPerPage: 2, strategy: 'shared-dimension' };
    const links = computeInternalLinks(entries[0], entries, limitedConfig);
    expect(links.length).toBeLessThanOrEqual(2);
  });

  it('should return empty array when disabled', () => {
    const disabledConfig: InternalLinkConfig = { enabled: false, maxLinksPerPage: 10, strategy: 'shared-dimension' };
    const links = computeInternalLinks(entries[0], entries, disabledConfig);
    expect(links).toEqual([]);
  });

  it('should not include pages with zero shared dimensions', () => {
    // Entry 4 (Tokyo, Museums) shares nothing with entry 0 (London, Hotels)
    const links = computeInternalLinks(entries[0], entries, config);
    expect(links.find((l) => l.targetUrl === '/museums-tokyo')).toBeUndefined();
  });

  it('should work with a single entry (no links)', () => {
    const links = computeInternalLinks(entries[0], [entries[0]], config);
    expect(links).toEqual([]);
  });

  it('should generate correct URLs for end-to-end usage', () => {
    // Story 8.2: verify links include correct URLs from the full set
    const allLinks = entries.map((e) => computeInternalLinks(e, entries, config));
    for (const links of allLinks) {
      for (const link of links) {
        expect(entries.some((e) => e.url === link.targetUrl)).toBe(true);
      }
    }
  });

  it('should prioritize pages with more shared dimensions', () => {
    // Create entries where one page shares 2 dimensions and another shares 1
    const specialEntries: PageEntry[] = [
      makeEntry({ id: 'a', url: '/a', title: 'Page A', dimensions: { x: '1', y: '2', z: '3' } }),
      makeEntry({ id: 'b', url: '/b', title: 'Page B', dimensions: { x: '1', y: '2', z: '9' } }), // shares x,y
      makeEntry({ id: 'c', url: '/c', title: 'Page C', dimensions: { x: '1', y: '9', z: '9' } }), // shares x only
    ];
    const links = computeInternalLinks(specialEntries[0], specialEntries, config);
    expect(links[0].targetUrl).toBe('/b'); // shares 2 dims
    expect(links[1].targetUrl).toBe('/c'); // shares 1 dim
  });
});
