import type { AuditReport } from '../schemas/index.js';
import type { UniquenessResult } from './uniqueness.js';
import type { ThinContentResult } from './thin-content.js';
import type { BrokenLinkResult } from './broken-links.js';
import type { StructuredDataResult } from './structured-data-validator.js';

export interface AuditInput {
  uniqueness: UniquenessResult[];
  thinContent: ThinContentResult[];
  brokenLinks: BrokenLinkResult[];
  structuredData: StructuredDataResult[];
  totalPages: number;
}

/**
 * Generate an audit report from individual check results.
 */
export function generateAuditReport(results: AuditInput): AuditReport {
  // Collect all pages that have issues
  const failedPages = new Set<string>();
  const warnedPages = new Set<string>();

  // Broken links and structured data errors are failures
  for (const bl of results.brokenLinks) {
    failedPages.add(bl.source);
  }
  for (const sd of results.structuredData) {
    failedPages.add(sd.page);
  }

  // Thin content is a warning
  for (const tc of results.thinContent) {
    if (!failedPages.has(tc.page)) {
      warnedPages.add(tc.page);
    }
  }

  // High similarity is a warning
  for (const u of results.uniqueness) {
    if (!failedPages.has(u.page)) {
      warnedPages.add(u.page);
    }
  }

  // Average uniqueness score: if we have results, average their scores.
  // Pages without a uniqueness flag are assumed unique (score 0).
  // The "average" reported is the average similarity of flagged pages.
  const avgUniqueness =
    results.uniqueness.length > 0
      ? results.uniqueness.reduce((sum, u) => sum + u.score, 0) / results.uniqueness.length
      : 0;

  const passedPages = results.totalPages - failedPages.size - warnedPages.size;

  return {
    summary: {
      totalPages: results.totalPages,
      passedPages: Math.max(0, passedPages),
      warnedPages: warnedPages.size,
      failedPages: failedPages.size,
      averageUniqueness: avgUniqueness,
      brokenLinks: results.brokenLinks.length,
    },
    checks: {
      uniqueness: results.uniqueness,
      thinContent: results.thinContent,
      brokenLinks: results.brokenLinks,
      structuredData: results.structuredData,
    },
  };
}

/**
 * Format an audit report for terminal display.
 */
export function formatAuditReport(report: AuditReport): string {
  const lines: string[] = [];
  const s = report.summary;

  lines.push('=== Audit Report ===');
  lines.push(`Total pages: ${s.totalPages}`);
  lines.push(`Passed: ${s.passedPages}  Warned: ${s.warnedPages}  Failed: ${s.failedPages}`);
  lines.push(`Average similarity (flagged): ${(s.averageUniqueness * 100).toFixed(1)}%`);
  lines.push(`Broken links: ${s.brokenLinks}`);

  if (report.checks.uniqueness.length > 0) {
    lines.push('');
    lines.push('--- Uniqueness Issues ---');
    for (const u of report.checks.uniqueness) {
      lines.push(`  ${u.page} ~ ${u.nearestSibling} (${(u.score * 100).toFixed(1)}% similar)`);
    }
  }

  if (report.checks.thinContent.length > 0) {
    lines.push('');
    lines.push('--- Thin Content ---');
    for (const t of report.checks.thinContent) {
      lines.push(`  ${t.page}: ${t.wordCount} words (min: ${t.threshold})`);
    }
  }

  if (report.checks.brokenLinks.length > 0) {
    lines.push('');
    lines.push('--- Broken Links ---');
    for (const b of report.checks.brokenLinks) {
      lines.push(`  ${b.source} -> ${b.target}`);
    }
  }

  if (report.checks.structuredData.length > 0) {
    lines.push('');
    lines.push('--- Structured Data ---');
    for (const sd of report.checks.structuredData) {
      lines.push(`  ${sd.page}:`);
      for (const e of sd.errors) {
        lines.push(`    - ${e}`);
      }
    }
  }

  return lines.join('\n');
}
