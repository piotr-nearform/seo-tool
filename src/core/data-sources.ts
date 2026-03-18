import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type DataRow = Record<string, unknown>;
export type DataSources = Record<string, DataRow[]>;

/**
 * Parse a CSV string into an array of objects.
 * Handles quoted fields (including fields with commas and newlines inside quotes).
 */
export function parseCSV(content: string): DataRow[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const ch = content[i];

    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote
        if (i + 1 < content.length && content[i + 1] === '"') {
          currentField += '"';
          i += 2;
          continue;
        }
        // End of quoted field
        inQuotes = false;
        i++;
        continue;
      }
      currentField += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === ',') {
      currentRow.push(currentField.trim());
      currentField = '';
      i++;
      continue;
    }

    if (ch === '\n' || (ch === '\r' && i + 1 < content.length && content[i + 1] === '\n')) {
      currentRow.push(currentField.trim());
      currentField = '';
      if (currentRow.some((f) => f !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      i += ch === '\r' ? 2 : 1;
      continue;
    }

    if (ch === '\r') {
      currentRow.push(currentField.trim());
      currentField = '';
      if (currentRow.some((f) => f !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      i++;
      continue;
    }

    currentField += ch;
    i++;
  }

  // Handle last field/row
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f !== '')) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj: DataRow = {};
    headers.forEach((header, idx) => {
      obj[header] = idx < row.length ? row[idx] : '';
    });
    return obj;
  });
}

/**
 * Load a CSV file and return parsed rows.
 */
export async function loadCSV(filePath: string): Promise<DataRow[]> {
  const content = await readFile(filePath, 'utf-8');
  return parseCSV(content);
}

/**
 * Load a JSON file and return parsed array.
 */
export async function loadJSON(filePath: string): Promise<DataRow[]> {
  const content = await readFile(filePath, 'utf-8');
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed)) {
    throw new Error(`JSON file ${filePath} must contain an array`);
  }
  return parsed as DataRow[];
}

/**
 * Validate that a specific column exists in the loaded data rows.
 */
export function validateColumn(rows: DataRow[], column: string, sourcePath: string): void {
  if (rows.length === 0) {
    throw new Error(`Data source ${sourcePath} is empty`);
  }
  if (!(column in rows[0])) {
    const available = Object.keys(rows[0]).join(', ');
    throw new Error(
      `Column "${column}" not found in ${sourcePath}. Available columns: ${available}`,
    );
  }
}

/**
 * Load all data sources referenced by dimensions.
 * Returns a DataSources map keyed by file path.
 */
export async function loadDataSources(
  dimensions: Record<string, { source?: string; column?: string }>,
  basePath: string,
): Promise<DataSources> {
  const sources: DataSources = {};

  for (const [_dimName, dim] of Object.entries(dimensions)) {
    if (!dim.source) continue;

    const filePath = path.resolve(basePath, dim.source);

    // Skip if already loaded
    if (sources[filePath]) {
      if (dim.column) {
        validateColumn(sources[filePath], dim.column, filePath);
      }
      continue;
    }

    const ext = path.extname(filePath).toLowerCase();
    let rows: DataRow[];

    if (ext === '.csv') {
      rows = await loadCSV(filePath);
    } else if (ext === '.json') {
      rows = await loadJSON(filePath);
    } else {
      throw new Error(`Unsupported data source format: ${ext} (file: ${filePath})`);
    }

    if (dim.column) {
      validateColumn(rows, dim.column, filePath);
    }

    sources[filePath] = rows;
  }

  return sources;
}
