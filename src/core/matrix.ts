import path from 'node:path';
import type { MatrixConfig, PageEntry, FilterRule } from '../schemas/index.js';
import type { DataSources, DataRow } from './data-sources.js';
import { slugify } from '../utils/slug.js';
import { pageId } from '../utils/hash.js';

/**
 * Resolve dimension values: either inline values or from a data source.
 * Returns an array of objects: { value: string, metadata: Record<string, unknown> }
 */
export function resolveDimensionValues(
  dimName: string,
  dim: { values: string[]; source?: string; column?: string; metadata?: Record<string, unknown> },
  dataSources: DataSources,
  basePath: string,
): { value: string; metadata: Record<string, unknown> }[] {
  if (dim.source && dim.column) {
    const filePath = path.resolve(basePath, dim.source);
    const rows = dataSources[filePath];
    if (!rows) {
      throw new Error(`Data source not loaded for dimension "${dimName}": ${filePath}`);
    }
    return rows.map((row) => ({
      value: String(row[dim.column!]),
      metadata: { ...row },
    }));
  }

  // Inline values
  return dim.values.map((v) => ({
    value: v,
    metadata: dim.metadata ? { ...dim.metadata } : {},
  }));
}

/**
 * Generate the cartesian product of multiple arrays.
 */
export function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((combo) => curr.map((item) => [...combo, item])),
    [[]],
  );
}

/**
 * Apply a template pattern by replacing {{key}} placeholders with dimension values.
 */
export function applyPattern(pattern: string, dimensions: Record<string, string>): string {
  return pattern.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    return dimensions[key] ?? '';
  });
}

// --- Filter expression evaluator ---

interface Token {
  type: 'ident' | 'string' | 'op' | 'logic';
  value: string;
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    // Skip whitespace
    if (/\s/.test(expr[i])) {
      i++;
      continue;
    }

    // String literals
    if (expr[i] === "'" || expr[i] === '"') {
      const quote = expr[i];
      i++;
      let str = '';
      while (i < expr.length && expr[i] !== quote) {
        str += expr[i];
        i++;
      }
      i++; // skip closing quote
      tokens.push({ type: 'string', value: str });
      continue;
    }

    // Operators
    if (expr[i] === '=' && expr[i + 1] === '=') {
      tokens.push({ type: 'op', value: '==' });
      i += 2;
      continue;
    }
    if (expr[i] === '!' && expr[i + 1] === '=') {
      tokens.push({ type: 'op', value: '!=' });
      i += 2;
      continue;
    }
    if (expr[i] === '&' && expr[i + 1] === '&') {
      tokens.push({ type: 'logic', value: '&&' });
      i += 2;
      continue;
    }
    if (expr[i] === '|' && expr[i + 1] === '|') {
      tokens.push({ type: 'logic', value: '||' });
      i += 2;
      continue;
    }

    // Identifiers
    if (/[a-zA-Z_]/.test(expr[i])) {
      let ident = '';
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        ident += expr[i];
        i++;
      }
      tokens.push({ type: 'ident', value: ident });
      continue;
    }

    throw new Error(`Unexpected character in filter expression: "${expr[i]}" at position ${i}`);
  }

  return tokens;
}

/**
 * Evaluate a simple filter expression against dimension values.
 * Supports: ==, !=, &&, ||
 */
export function evaluateFilter(
  expression: string,
  dimensions: Record<string, string>,
): boolean {
  const tokens = tokenize(expression);

  // Parse into comparison groups joined by && or ||
  // Simple recursive descent: comparisons joined by logic operators
  let i = 0;

  function parseComparison(): boolean {
    if (i >= tokens.length) throw new Error('Unexpected end of filter expression');

    const left = tokens[i];
    if (left.type !== 'ident') throw new Error(`Expected identifier, got "${left.value}"`);
    i++;

    const op = tokens[i];
    if (!op || op.type !== 'op') throw new Error(`Expected operator after "${left.value}"`);
    i++;

    const right = tokens[i];
    if (!right || (right.type !== 'string' && right.type !== 'ident'))
      throw new Error(`Expected value after "${op.value}"`);
    i++;

    const leftVal = dimensions[left.value] ?? '';
    const rightVal = right.type === 'string' ? right.value : (dimensions[right.value] ?? '');

    if (op.value === '==') return leftVal === rightVal;
    if (op.value === '!=') return leftVal !== rightVal;

    throw new Error(`Unknown operator: ${op.value}`);
  }

  function parseExpr(): boolean {
    let result = parseComparison();

    while (i < tokens.length && tokens[i].type === 'logic') {
      const logic = tokens[i].value;
      i++;
      const right = parseComparison();
      if (logic === '&&') result = result && right;
      else if (logic === '||') result = result || right;
    }

    return result;
  }

  return parseExpr();
}

/**
 * Apply include/exclude filters to entries.
 */
export function applyFilters(
  entries: PageEntry[],
  filters: FilterRule[],
): PageEntry[] {
  if (filters.length === 0) return entries;

  return entries.filter((entry) => {
    for (const filter of filters) {
      const matches = evaluateFilter(filter.condition, entry.dimensions);
      if (filter.type === 'include' && !matches) return false;
      if (filter.type === 'exclude' && matches) return false;
    }
    return true;
  });
}

/**
 * Expand matrix configuration into an array of PageEntry objects.
 */
export function expandMatrix(
  config: MatrixConfig,
  dataSources: DataSources = {},
  basePath: string = process.cwd(),
): PageEntry[] {
  const dimNames = Object.keys(config.dimensions);
  if (dimNames.length === 0) return [];

  // Resolve each dimension's values
  const resolvedDims = dimNames.map((name) =>
    resolveDimensionValues(name, config.dimensions[name], dataSources, basePath).map((v) => ({
      dimName: name,
      ...v,
    })),
  );

  // Cartesian product
  const combos = cartesianProduct(resolvedDims);

  // Generate page entries
  let entries: PageEntry[] = combos.map((combo) => {
    const dimensions: Record<string, string> = {};
    const data: Record<string, unknown> = {};

    for (const item of combo) {
      dimensions[item.dimName] = item.value;
      // Store metadata under dimension name prefix
      if (Object.keys(item.metadata).length > 0) {
        data[item.dimName] = item.metadata;
      }
    }

    const url = applyPattern(config.pattern.url, dimensions);
    const title = applyPattern(config.pattern.title, dimensions);
    const description = applyPattern(config.pattern.description, dimensions);
    const slug = slugify(url);
    const id = pageId(dimensions);
    const inputHash = id; // inputHash is the same deterministic hash

    return {
      id,
      slug,
      url,
      title,
      description,
      dimensions,
      data,
      inputHash,
    };
  });

  // Apply filters
  entries = applyFilters(entries, config.filters);

  return entries;
}

/**
 * Sample N random entries from the matrix.
 */
export function sampleEntries(entries: PageEntry[], count: number): PageEntry[] {
  if (count >= entries.length) return [...entries];

  // Fisher-Yates shuffle on a copy, then take first N
  const shuffled = [...entries];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/**
 * Format a dry-run summary of the expanded matrix.
 */
export function dryRunSummary(entries: PageEntry[], sampleSize: number = 10): string {
  const lines: string[] = [];
  lines.push(`Total pages: ${entries.length}`);
  lines.push('');

  const sample = entries.slice(0, sampleSize);
  lines.push(`Sample (first ${Math.min(sampleSize, entries.length)}):`);
  for (const entry of sample) {
    lines.push(`  ${entry.url} — ${entry.title}`);
  }

  if (entries.length > sampleSize) {
    lines.push(`  ... and ${entries.length - sampleSize} more`);
  }

  return lines.join('\n');
}
