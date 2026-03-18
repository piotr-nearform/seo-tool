import { describe, it, expect } from 'vitest';
import path from 'node:path';
import {
  parseCSV,
  loadCSV,
  loadJSON,
  validateColumn,
  loadDataSources,
} from '../../../src/core/data-sources.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures');
const DATA_DIR = path.join(FIXTURES, 'data');

// --- Story 2.2: Data source loading ---

describe('parseCSV', () => {
  it('should parse a simple CSV string', () => {
    const csv = 'name,age\nAlice,30\nBob,25';
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: 'Alice', age: '30' });
    expect(rows[1]).toEqual({ name: 'Bob', age: '25' });
  });

  it('should handle quoted fields with commas', () => {
    const csv = 'name,desc\n"Smith, John","A description"\nJane,Simple';
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe('Smith, John');
    expect(rows[0].desc).toBe('A description');
  });

  it('should handle escaped quotes', () => {
    const csv = 'name,value\n"He said ""hello""",42';
    const rows = parseCSV(csv);
    expect(rows[0].name).toBe('He said "hello"');
  });

  it('should handle CRLF line endings', () => {
    const csv = 'a,b\r\n1,2\r\n3,4';
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ a: '1', b: '2' });
  });

  it('should return empty array for header-only CSV', () => {
    const csv = 'name,age';
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(0);
  });

  it('should return empty array for empty string', () => {
    expect(parseCSV('')).toHaveLength(0);
  });

  it('should handle trailing newline', () => {
    const csv = 'name,age\nAlice,30\n';
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ name: 'Alice', age: '30' });
  });
});

describe('loadCSV', () => {
  it('should load and parse a CSV fixture file', async () => {
    const rows = await loadCSV(path.join(DATA_DIR, 'industries.csv'));
    expect(rows).toHaveLength(4);
    expect(rows[0]).toHaveProperty('name', 'Technology');
    expect(rows[0]).toHaveProperty('slug', 'technology');
    expect(rows[0]).toHaveProperty('description', 'The tech industry');
  });
});

describe('loadJSON', () => {
  it('should load and parse a JSON fixture file', async () => {
    const rows = await loadJSON(path.join(DATA_DIR, 'products.json'));
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveProperty('name', 'Widget A');
    expect(rows[0]).toHaveProperty('sku', 'WA-001');
    expect(rows[0]).toHaveProperty('price', 29.99);
  });

  it('should throw if JSON is not an array', async () => {
    // Create a temporary non-array JSON scenario by testing parseCSV approach
    // Instead, test the error directly
    const { readFile } = await import('node:fs/promises');
    const { writeFile, unlink } = await import('node:fs/promises');
    const tmpPath = path.join(DATA_DIR, '_tmp_obj.json');
    await writeFile(tmpPath, '{"key": "value"}');
    try {
      await expect(loadJSON(tmpPath)).rejects.toThrow('must contain an array');
    } finally {
      await unlink(tmpPath);
    }
  });
});

describe('validateColumn', () => {
  it('should not throw for existing column', () => {
    const rows = [{ name: 'Alice', age: '30' }];
    expect(() => validateColumn(rows, 'name', 'test.csv')).not.toThrow();
  });

  it('should throw for missing column', () => {
    const rows = [{ name: 'Alice', age: '30' }];
    expect(() => validateColumn(rows, 'email', 'test.csv')).toThrow(/Column "email" not found/);
    expect(() => validateColumn(rows, 'email', 'test.csv')).toThrow(/Available columns: name, age/);
  });

  it('should throw for empty data', () => {
    expect(() => validateColumn([], 'name', 'test.csv')).toThrow(/is empty/);
  });
});

describe('loadDataSources', () => {
  it('should load CSV data sources referenced by dimensions', async () => {
    const dimensions = {
      industry: { source: 'data/industries.csv', column: 'name' },
    };
    const sources = await loadDataSources(dimensions, FIXTURES);
    const filePath = path.resolve(FIXTURES, 'data/industries.csv');
    expect(sources[filePath]).toHaveLength(4);
  });

  it('should load JSON data sources', async () => {
    const dimensions = {
      product: { source: 'data/products.json', column: 'name' },
    };
    const sources = await loadDataSources(dimensions, FIXTURES);
    const filePath = path.resolve(FIXTURES, 'data/products.json');
    expect(sources[filePath]).toHaveLength(3);
  });

  it('should skip dimensions without source', async () => {
    const dimensions = {
      city: { values: ['new-york'] },
    };
    const sources = await loadDataSources(dimensions as any, FIXTURES);
    expect(Object.keys(sources)).toHaveLength(0);
  });

  it('should throw for unsupported format', async () => {
    const dimensions = {
      foo: { source: 'data/foo.xml', column: 'name' },
    };
    await expect(loadDataSources(dimensions, FIXTURES)).rejects.toThrow(/Unsupported data source format/);
  });

  it('should validate column exists', async () => {
    const dimensions = {
      industry: { source: 'data/industries.csv', column: 'nonexistent' },
    };
    await expect(loadDataSources(dimensions, FIXTURES)).rejects.toThrow(/Column "nonexistent" not found/);
  });

  it('should not reload already loaded data sources', async () => {
    const dimensions = {
      dim1: { source: 'data/industries.csv', column: 'name' },
      dim2: { source: 'data/industries.csv', column: 'slug' },
    };
    const sources = await loadDataSources(dimensions, FIXTURES);
    // Only one key since same file
    expect(Object.keys(sources)).toHaveLength(1);
  });
});
