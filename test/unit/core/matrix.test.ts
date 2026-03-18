import { describe, it, expect } from 'vitest';
import path from 'node:path';
import type { MatrixConfig } from '../../../src/schemas/index.js';
import type { DataSources } from '../../../src/core/data-sources.js';
import {
  expandMatrix,
  cartesianProduct,
  applyPattern,
  evaluateFilter,
  applyFilters,
  resolveDimensionValues,
  sampleEntries,
  dryRunSummary,
} from '../../../src/core/matrix.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures');

// --- Story 3.1: Cartesian product generation ---

describe('cartesianProduct', () => {
  it('should produce cartesian product of two arrays', () => {
    const result = cartesianProduct([
      [1, 2],
      ['a', 'b', 'c'],
    ]);
    expect(result).toHaveLength(6);
    expect(result).toContainEqual([1, 'a']);
    expect(result).toContainEqual([2, 'c']);
  });

  it('should produce 3x3x2 = 18 entries', () => {
    const result = cartesianProduct([
      ['a', 'b', 'c'],
      ['x', 'y', 'z'],
      ['1', '2'],
    ]);
    expect(result).toHaveLength(18);
  });

  it('should handle single dimension', () => {
    const result = cartesianProduct([['a', 'b']]);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual(['a']);
    expect(result).toContainEqual(['b']);
  });

  it('should handle empty arrays list', () => {
    const result = cartesianProduct([]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual([]);
  });
});

describe('expandMatrix', () => {
  it('should expand 2x3 inline dimensions into 6 entries', () => {
    const config: MatrixConfig = {
      dimensions: {
        city: { values: ['new-york', 'chicago'] },
        service: { values: ['plumbing', 'electrical', 'hvac'] },
      },
      pattern: {
        url: '/{{city}}/{{service}}',
        title: '{{service}} in {{city}}',
        description: 'Best {{service}} in {{city}}',
      },
      filters: [],
    };

    const entries = expandMatrix(config);
    expect(entries).toHaveLength(6);

    // Check that all combos are represented
    const urls = entries.map((e) => e.url);
    expect(urls).toContain('/new-york/plumbing');
    expect(urls).toContain('/chicago/hvac');
  });

  it('should expand 3x3x2 dimensions into 18 entries', () => {
    const config: MatrixConfig = {
      dimensions: {
        city: { values: ['a', 'b', 'c'] },
        service: { values: ['x', 'y', 'z'] },
        tier: { values: ['basic', 'premium'] },
      },
      pattern: {
        url: '/{{city}}/{{service}}/{{tier}}',
        title: '{{service}} {{tier}} in {{city}}',
        description: 'Desc',
      },
      filters: [],
    };

    const entries = expandMatrix(config);
    expect(entries).toHaveLength(18);
  });

  it('should generate deterministic page IDs', () => {
    const config: MatrixConfig = {
      dimensions: {
        city: { values: ['new-york'] },
        service: { values: ['plumbing'] },
      },
      pattern: { url: '/{{city}}/{{service}}', title: 'T', description: 'D' },
      filters: [],
    };

    const entries1 = expandMatrix(config);
    const entries2 = expandMatrix(config);
    expect(entries1[0].id).toBe(entries2[0].id);
    expect(entries1[0].id).toHaveLength(64); // SHA-256 hex
  });

  it('should return empty array for zero dimensions', () => {
    const config: MatrixConfig = {
      dimensions: {},
      pattern: { url: '/', title: 'T', description: 'D' },
      filters: [],
    };
    expect(expandMatrix(config)).toHaveLength(0);
  });
});

// --- Story 3.2: URL pattern and slug generation ---

describe('applyPattern', () => {
  it('should replace placeholders with dimension values', () => {
    const result = applyPattern('/{{city}}/{{service}}', {
      city: 'new-york',
      service: 'plumbing',
    });
    expect(result).toBe('/new-york/plumbing');
  });

  it('should replace missing placeholders with empty string', () => {
    const result = applyPattern('/{{city}}/{{missing}}', { city: 'nyc' });
    expect(result).toBe('/nyc/');
  });

  it('should handle multiple occurrences of same placeholder', () => {
    const result = applyPattern('{{x}} and {{x}}', { x: 'hello' });
    expect(result).toBe('hello and hello');
  });
});

describe('slug generation in expandMatrix', () => {
  it('should generate valid slugs from URLs', () => {
    const config: MatrixConfig = {
      dimensions: {
        city: { values: ['New York'] },
        service: { values: ['HVAC Repair'] },
      },
      pattern: {
        url: '/{{city}}/{{service}}',
        title: 'T',
        description: 'D',
      },
      filters: [],
    };

    const entries = expandMatrix(config);
    expect(entries[0].slug).toBe('new-york-hvac-repair');
  });
});

// --- Story 3.3: CSV import for dimension values ---

describe('resolveDimensionValues with CSV data source', () => {
  it('should resolve values from data source', () => {
    const filePath = path.resolve(FIXTURES, 'data/industries.csv');
    const dataSources: DataSources = {
      [filePath]: [
        { name: 'Technology', slug: 'technology', description: 'The tech industry' },
        { name: 'Healthcare', slug: 'healthcare', description: 'The healthcare sector' },
      ],
    };

    const results = resolveDimensionValues(
      'industry',
      { values: [], source: 'data/industries.csv', column: 'name' },
      dataSources,
      FIXTURES,
    );

    expect(results).toHaveLength(2);
    expect(results[0].value).toBe('Technology');
    expect(results[0].metadata).toHaveProperty('slug', 'technology');
    expect(results[0].metadata).toHaveProperty('description', 'The tech industry');
  });

  it('should fall back to inline values when no source', () => {
    const results = resolveDimensionValues(
      'city',
      { values: ['new-york', 'chicago'] },
      {},
      FIXTURES,
    );
    expect(results).toHaveLength(2);
    expect(results[0].value).toBe('new-york');
  });
});

describe('expandMatrix with CSV data sources', () => {
  it('should expand matrix using CSV data source for a dimension', () => {
    const filePath = path.resolve(FIXTURES, 'data/industries.csv');
    const dataSources: DataSources = {
      [filePath]: [
        { name: 'Technology', slug: 'technology', description: 'The tech industry' },
        { name: 'Healthcare', slug: 'healthcare', description: 'The healthcare sector' },
      ],
    };

    const config: MatrixConfig = {
      dimensions: {
        industry: { values: [], source: 'data/industries.csv', column: 'name' },
        service: { values: ['consulting', 'support'] },
      },
      pattern: {
        url: '/{{industry}}/{{service}}',
        title: '{{service}} for {{industry}}',
        description: 'Desc',
      },
      filters: [],
    };

    const entries = expandMatrix(config, dataSources, FIXTURES);
    expect(entries).toHaveLength(4); // 2 industries * 2 services

    // Check metadata is attached
    const techEntry = entries.find((e) => e.dimensions.industry === 'Technology');
    expect(techEntry).toBeDefined();
    expect(techEntry!.data.industry).toHaveProperty('slug', 'technology');
  });
});

// --- Story 3.4: Combination filtering ---

describe('evaluateFilter', () => {
  it('should evaluate == correctly', () => {
    expect(evaluateFilter("city == 'new-york'", { city: 'new-york' })).toBe(true);
    expect(evaluateFilter("city == 'chicago'", { city: 'new-york' })).toBe(false);
  });

  it('should evaluate != correctly', () => {
    expect(evaluateFilter("city != 'chicago'", { city: 'new-york' })).toBe(true);
    expect(evaluateFilter("city != 'new-york'", { city: 'new-york' })).toBe(false);
  });

  it('should evaluate && correctly', () => {
    const dims = { city: 'new-york', service: 'plumbing' };
    expect(evaluateFilter("city == 'new-york' && service == 'plumbing'", dims)).toBe(true);
    expect(evaluateFilter("city == 'new-york' && service == 'hvac'", dims)).toBe(false);
  });

  it('should evaluate || correctly', () => {
    const dims = { city: 'new-york', service: 'plumbing' };
    expect(evaluateFilter("city == 'chicago' || service == 'plumbing'", dims)).toBe(true);
    expect(evaluateFilter("city == 'chicago' || service == 'hvac'", dims)).toBe(false);
  });

  it('should handle combined && and ||', () => {
    const dims = { a: 'x', b: 'y', c: 'z' };
    // Evaluated left to right: (a == x && b == y) || c == w => true || false => true
    expect(evaluateFilter("a == 'x' && b == 'y' || c == 'w'", dims)).toBe(true);
  });

  it('should handle double-quoted strings', () => {
    expect(evaluateFilter('city == "new-york"', { city: 'new-york' })).toBe(true);
  });

  it('should treat missing dimension as empty string', () => {
    expect(evaluateFilter("missing == ''", {})).toBe(true);
  });
});

describe('applyFilters', () => {
  const makeEntry = (dims: Record<string, string>) =>
    ({
      id: 'test',
      slug: 'test',
      url: '/test',
      title: 'Test',
      description: 'Test',
      dimensions: dims,
      data: {},
      inputHash: 'test',
    }) as any;

  it('should include only matching entries for include filter', () => {
    const entries = [
      makeEntry({ city: 'new-york', service: 'plumbing' }),
      makeEntry({ city: 'chicago', service: 'plumbing' }),
      makeEntry({ city: 'new-york', service: 'hvac' }),
    ];
    const filters = [{ type: 'include' as const, condition: "city == 'new-york'" }];
    const result = applyFilters(entries, filters);
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.dimensions.city === 'new-york')).toBe(true);
  });

  it('should exclude matching entries for exclude filter', () => {
    const entries = [
      makeEntry({ city: 'new-york', service: 'plumbing' }),
      makeEntry({ city: 'chicago', service: 'plumbing' }),
      makeEntry({ city: 'new-york', service: 'hvac' }),
    ];
    const filters = [{ type: 'exclude' as const, condition: "city == 'chicago'" }];
    const result = applyFilters(entries, filters);
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.dimensions.city !== 'chicago')).toBe(true);
  });

  it('should apply combined include and exclude filters', () => {
    const entries = [
      makeEntry({ city: 'new-york', service: 'plumbing' }),
      makeEntry({ city: 'new-york', service: 'hvac' }),
      makeEntry({ city: 'chicago', service: 'plumbing' }),
    ];
    const filters = [
      { type: 'include' as const, condition: "city == 'new-york'" },
      { type: 'exclude' as const, condition: "service == 'hvac'" },
    ];
    const result = applyFilters(entries, filters);
    expect(result).toHaveLength(1);
    expect(result[0].dimensions.city).toBe('new-york');
    expect(result[0].dimensions.service).toBe('plumbing');
  });

  it('should return all entries when no filters', () => {
    const entries = [makeEntry({ city: 'a' }), makeEntry({ city: 'b' })];
    expect(applyFilters(entries, [])).toHaveLength(2);
  });
});

describe('expandMatrix with filters', () => {
  it('should apply filters during expansion', () => {
    const config: MatrixConfig = {
      dimensions: {
        city: { values: ['new-york', 'chicago', 'la'] },
        service: { values: ['plumbing', 'hvac'] },
      },
      pattern: { url: '/{{city}}/{{service}}', title: 'T', description: 'D' },
      filters: [
        { type: 'exclude', condition: "city == 'chicago' && service == 'hvac'" },
      ],
    };

    const entries = expandMatrix(config);
    // 3x2 = 6 minus 1 excluded = 5
    expect(entries).toHaveLength(5);
    expect(
      entries.some(
        (e) => e.dimensions.city === 'chicago' && e.dimensions.service === 'hvac',
      ),
    ).toBe(false);
  });
});

// --- Story 3.5: Dry run and sampling ---

describe('sampleEntries', () => {
  it('should return N entries when count < total', () => {
    const entries = Array.from({ length: 100 }, (_, i) => ({
      id: String(i),
      slug: `s${i}`,
      url: `/p${i}`,
      title: `T${i}`,
      description: `D${i}`,
      dimensions: { x: String(i) },
      data: {},
      inputHash: String(i),
    }));

    const sampled = sampleEntries(entries, 5);
    expect(sampled).toHaveLength(5);
  });

  it('should return all entries when count >= total', () => {
    const entries = Array.from({ length: 3 }, (_, i) => ({
      id: String(i),
      slug: `s${i}`,
      url: `/p${i}`,
      title: `T${i}`,
      description: `D${i}`,
      dimensions: { x: String(i) },
      data: {},
      inputHash: String(i),
    }));

    const sampled = sampleEntries(entries, 10);
    expect(sampled).toHaveLength(3);
  });

  it('should not modify original array', () => {
    const entries = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      slug: `s${i}`,
      url: `/p${i}`,
      title: `T${i}`,
      description: `D${i}`,
      dimensions: { x: String(i) },
      data: {},
      inputHash: String(i),
    }));

    const originalIds = entries.map((e) => e.id);
    sampleEntries(entries, 3);
    expect(entries.map((e) => e.id)).toEqual(originalIds);
  });
});

describe('dryRunSummary', () => {
  const makeEntries = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      id: String(i),
      slug: `slug-${i}`,
      url: `/page-${i}`,
      title: `Page ${i}`,
      description: `Desc ${i}`,
      dimensions: { x: String(i) },
      data: {},
      inputHash: String(i),
    }));

  it('should include total page count', () => {
    const summary = dryRunSummary(makeEntries(25));
    expect(summary).toContain('Total pages: 25');
  });

  it('should show first 10 entries as sample', () => {
    const summary = dryRunSummary(makeEntries(25));
    expect(summary).toContain('/page-0');
    expect(summary).toContain('/page-9');
    expect(summary).toContain('... and 15 more');
  });

  it('should show all entries when less than sample size', () => {
    const summary = dryRunSummary(makeEntries(3));
    expect(summary).toContain('Total pages: 3');
    expect(summary).toContain('/page-0');
    expect(summary).toContain('/page-2');
    expect(summary).not.toContain('... and');
  });

  it('should show URL and title for each sample entry', () => {
    const entries = makeEntries(1);
    const summary = dryRunSummary(entries);
    expect(summary).toContain('/page-0');
    expect(summary).toContain('Page 0');
  });
});
