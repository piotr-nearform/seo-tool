import type { Command } from 'commander';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { checkUniqueness } from '../../audit/uniqueness.js';
import { checkThinContent } from '../../audit/thin-content.js';
import { checkBrokenLinks } from '../../audit/broken-links.js';
import { validateStructuredData } from '../../audit/structured-data-validator.js';
import { generateAuditReport, formatAuditReport } from '../../audit/reporter.js';
import type { AuditReport } from '../../schemas/index.js';

export interface AuditOptions {
  outputDir: string;
  cacheDir: string;
  uniquenessThreshold: number;
  minWordCount: number;
  validateStructuredData: boolean;
}

/**
 * Recursively find all HTML files in a directory.
 */
async function findHtmlFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(fullPath)));
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Strip HTML tags to extract plain text content.
 */
function stripHtml(html: string): string {
  // Remove script and style blocks entirely
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // Remove tags
  text = text.replace(/<[^>]*>/g, ' ');
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

/**
 * Extract href values from anchor tags.
 */
function extractLinks(html: string): string[] {
  const links: string[] = [];
  const re = /<a\s[^>]*href="([^"]*)"[^>]*>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    links.push(match[1]);
  }
  return links;
}

/**
 * Extract JSON-LD objects from script tags.
 */
function extractJsonLd(html: string): object[] {
  const objects: object[] = [];
  const re = /<script\s+type="application\/ld\+json"\s*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    try {
      objects.push(JSON.parse(match[1]));
    } catch {
      // Skip invalid JSON-LD
    }
  }
  return objects;
}

/**
 * Derive a page URL from its file path relative to the output directory.
 */
function filePathToUrl(filePath: string, outputDir: string): string {
  const rel = path.relative(outputDir, filePath);
  // e.g. "page-1/index.html" -> "/page-1/"
  const dir = path.dirname(rel);
  if (dir === '.') {
    const base = path.basename(rel, '.html');
    return base === 'index' ? '/' : `/${base}`;
  }
  return `/${dir.replace(/\\/g, '/')}/`;
}

/**
 * Run the full audit pipeline on a generated site.
 */
export async function runAudit(options: AuditOptions): Promise<AuditReport> {
  const { outputDir, cacheDir } = options;

  // 1. Find all HTML files
  const htmlFiles = await findHtmlFiles(outputDir);

  if (htmlFiles.length === 0) {
    const emptyReport: AuditReport = {
      summary: {
        totalPages: 0,
        passedPages: 0,
        warnedPages: 0,
        failedPages: 0,
        averageUniqueness: 0,
        brokenLinks: 0,
      },
      checks: {
        uniqueness: [],
        thinContent: [],
        brokenLinks: [],
        structuredData: [],
      },
    };
    await mkdir(cacheDir, { recursive: true });
    await writeFile(
      path.join(cacheDir, 'audit-report.json'),
      JSON.stringify(emptyReport, null, 2),
      'utf-8',
    );
    return emptyReport;
  }

  // 2. Parse all pages
  const pages: {
    url: string;
    content: string;
    links: string[];
    jsonLd: object[];
  }[] = [];

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, 'utf-8');
    const url = filePathToUrl(filePath, outputDir);
    pages.push({
      url,
      content: stripHtml(html),
      links: extractLinks(html),
      jsonLd: extractJsonLd(html),
    });
  }

  // 3. Run checks
  const uniquenessResults = checkUniqueness(
    pages.map((p) => ({ url: p.url, content: p.content })),
    options.uniquenessThreshold,
  );

  const thinContentResults = checkThinContent(
    pages.map((p) => ({ url: p.url, content: p.content })),
    options.minWordCount,
  );

  // Build known URL set for broken link detection
  const knownUrls = new Set(pages.map((p) => p.url));
  const brokenLinksResults = checkBrokenLinks(
    pages.map((p) => ({ url: p.url, links: p.links })),
  );

  const structuredDataResults = options.validateStructuredData
    ? validateStructuredData(pages.map((p) => ({ url: p.url, jsonLd: p.jsonLd })))
    : [];

  // 4. Generate report
  const report = generateAuditReport({
    uniqueness: uniquenessResults,
    thinContent: thinContentResults,
    brokenLinks: brokenLinksResults,
    structuredData: structuredDataResults,
    totalPages: pages.length,
  });

  // 5. Write report to cache
  await mkdir(cacheDir, { recursive: true });
  await writeFile(
    path.join(cacheDir, 'audit-report.json'),
    JSON.stringify(report, null, 2),
    'utf-8',
  );

  return report;
}

export function registerAuditCommand(program: Command): void {
  program
    .command('audit')
    .description('Run content quality and SEO audit on generated pages')
    .option('--fix', 'Attempt to auto-fix issues')
    .action(async (options, cmd) => {
      const parentOpts = cmd.parent?.opts() ?? {};

      if (options.fix) {
        console.log('auto-fix not yet available');
        return;
      }

      const outputDir = path.resolve('dist');
      const cacheDir = path.resolve('.seo-cache');

      try {
        const report = await runAudit({
          outputDir,
          cacheDir,
          uniquenessThreshold: 0.3,
          minWordCount: 300,
          validateStructuredData: true,
        });

        console.log(formatAuditReport(report));

        if (report.summary.failedPages > 0) {
          process.exitCode = 1;
        }
      } catch (err) {
        console.error(`Audit failed: ${(err as Error).message}`);
        process.exitCode = 1;
      }
    });
}
