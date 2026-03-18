import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { runAudit, type AuditOptions } from '../../../src/cli/commands/audit.js';

describe('cli/commands/audit — runAudit', () => {
  let tmpDir: string;
  let outputDir: string;
  let cacheDir: string;

  beforeEach(async () => {
    tmpDir = path.join(
      os.tmpdir(),
      `seo-audit-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    outputDir = path.join(tmpDir, 'dist');
    cacheDir = path.join(tmpDir, '.seo-cache');
    await mkdir(outputDir, { recursive: true });
    await mkdir(cacheDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  function makeHtml(opts: {
    title?: string;
    body?: string;
    links?: string[];
    jsonLd?: object[];
  }): string {
    const title = opts.title ?? 'Test Page';
    const body = opts.body ?? '<p>Some content here for testing purposes.</p>';
    const links = (opts.links ?? [])
      .map((href) => `<a href="${href}">Link</a>`)
      .join('\n');
    const jsonLdScripts = (opts.jsonLd ?? [])
      .map(
        (obj) =>
          `<script type="application/ld+json">${JSON.stringify(obj)}</script>`,
      )
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <title>${title}</title>
  ${jsonLdScripts}
</head>
<body>
  <h1>${title}</h1>
  ${body}
  ${links}
</body>
</html>`;
  }

  it('should scan output directory for HTML files', async () => {
    await mkdir(path.join(outputDir, 'page-1'), { recursive: true });
    await writeFile(
      path.join(outputDir, 'page-1', 'index.html'),
      makeHtml({ title: 'Page 1', body: '<p>' + 'word '.repeat(350) + '</p>' }),
    );
    await mkdir(path.join(outputDir, 'page-2'), { recursive: true });
    await writeFile(
      path.join(outputDir, 'page-2', 'index.html'),
      makeHtml({ title: 'Page 2', body: '<p>' + 'different '.repeat(350) + '</p>' }),
    );

    const report = await runAudit({
      outputDir,
      cacheDir,
      uniquenessThreshold: 0.3,
      minWordCount: 300,
      validateStructuredData: true,
    });

    expect(report.summary.totalPages).toBe(2);
  });

  it('should detect thin content', async () => {
    await mkdir(path.join(outputDir, 'thin'), { recursive: true });
    await writeFile(
      path.join(outputDir, 'thin', 'index.html'),
      makeHtml({ title: 'Thin', body: '<p>Too short.</p>' }),
    );

    const report = await runAudit({
      outputDir,
      cacheDir,
      uniquenessThreshold: 0.3,
      minWordCount: 300,
      validateStructuredData: true,
    });

    expect(report.checks.thinContent.length).toBeGreaterThan(0);
    expect(report.checks.thinContent[0].page).toContain('thin');
  });

  it('should detect broken internal links', async () => {
    await mkdir(path.join(outputDir, 'page-a'), { recursive: true });
    await writeFile(
      path.join(outputDir, 'page-a', 'index.html'),
      makeHtml({
        title: 'Page A',
        body: '<p>' + 'word '.repeat(350) + '</p>',
        links: ['/page-b/', '/nonexistent/'],
      }),
    );
    await mkdir(path.join(outputDir, 'page-b'), { recursive: true });
    await writeFile(
      path.join(outputDir, 'page-b', 'index.html'),
      makeHtml({ title: 'Page B', body: '<p>' + 'word '.repeat(350) + '</p>' }),
    );

    const report = await runAudit({
      outputDir,
      cacheDir,
      uniquenessThreshold: 0.3,
      minWordCount: 300,
      validateStructuredData: true,
    });

    expect(report.checks.brokenLinks.length).toBeGreaterThan(0);
    expect(report.checks.brokenLinks[0].target).toBe('/nonexistent/');
  });

  it('should validate structured data', async () => {
    await mkdir(path.join(outputDir, 'sd'), { recursive: true });
    await writeFile(
      path.join(outputDir, 'sd', 'index.html'),
      makeHtml({
        title: 'SD Page',
        body: '<p>' + 'word '.repeat(350) + '</p>',
        jsonLd: [{ '@type': 'WebPage' }], // missing @context and required fields
      }),
    );

    const report = await runAudit({
      outputDir,
      cacheDir,
      uniquenessThreshold: 0.3,
      minWordCount: 300,
      validateStructuredData: true,
    });

    expect(report.checks.structuredData.length).toBeGreaterThan(0);
    expect(report.checks.structuredData[0].errors.length).toBeGreaterThan(0);
  });

  it('should write audit report to cache directory', async () => {
    await mkdir(path.join(outputDir, 'page'), { recursive: true });
    await writeFile(
      path.join(outputDir, 'page', 'index.html'),
      makeHtml({ title: 'Page', body: '<p>' + 'word '.repeat(350) + '</p>' }),
    );

    await runAudit({
      outputDir,
      cacheDir,
      uniquenessThreshold: 0.3,
      minWordCount: 300,
      validateStructuredData: true,
    });

    const reportPath = path.join(cacheDir, 'audit-report.json');
    const raw = await readFile(reportPath, 'utf-8');
    const report = JSON.parse(raw);
    expect(report.summary).toBeDefined();
    expect(report.checks).toBeDefined();
  });

  it('should return passed=true when all checks pass', async () => {
    await mkdir(path.join(outputDir, 'good'), { recursive: true });
    await writeFile(
      path.join(outputDir, 'good', 'index.html'),
      makeHtml({
        title: 'Good Page',
        body: '<p>' + 'unique content word '.repeat(350) + '</p>',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Good Page',
            url: 'https://example.com/good/',
          },
        ],
      }),
    );

    const report = await runAudit({
      outputDir,
      cacheDir,
      uniquenessThreshold: 0.3,
      minWordCount: 300,
      validateStructuredData: true,
    });

    expect(report.summary.failedPages).toBe(0);
  });

  it('should handle empty output directory', async () => {
    const report = await runAudit({
      outputDir,
      cacheDir,
      uniquenessThreshold: 0.3,
      minWordCount: 300,
      validateStructuredData: true,
    });

    expect(report.summary.totalPages).toBe(0);
  });

  it('should skip structured data validation when disabled', async () => {
    await mkdir(path.join(outputDir, 'sd'), { recursive: true });
    await writeFile(
      path.join(outputDir, 'sd', 'index.html'),
      makeHtml({
        title: 'SD Page',
        body: '<p>' + 'word '.repeat(350) + '</p>',
        jsonLd: [{ '@type': 'WebPage' }], // invalid but validation disabled
      }),
    );

    const report = await runAudit({
      outputDir,
      cacheDir,
      uniquenessThreshold: 0.3,
      minWordCount: 300,
      validateStructuredData: false,
    });

    expect(report.checks.structuredData.length).toBe(0);
  });
});
