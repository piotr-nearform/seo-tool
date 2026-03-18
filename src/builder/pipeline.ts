import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { loadConfig } from '../core/config.js';
import { loadDataSources } from '../core/data-sources.js';
import { expandMatrix, sampleEntries, dryRunSummary } from '../core/matrix.js';
import { loadBuildManifest, saveBuildManifest, hasEntryChanged } from '../core/cache.js';
import { generateContent, countWords } from '../content/content-generator.js';
import { computeInternalLinks } from '../content/internal-links.js';
import { generateSEOMetadata } from './seo-metadata.js';
import { generateStructuredData } from './structured-data.js';
import { assemblePage } from './page-assembler.js';
import { generateSitemap } from './sitemap.js';
import { generateRobots } from './robots.js';
import { createEnvironment } from '../content/template-engine.js';
import { createConcurrencyLimiter } from '../ai/rate-limiter.js';
import { sha256 } from '../utils/hash.js';
import type {
  ProjectConfig,
  PageEntry,
  BuildReport,
  PageReport,
  BuildManifest,
  ManifestEntry,
} from '../schemas/index.js';
import type { Logger } from '../cli/logger.js';
import type { AIProvider } from '../ai/provider.js';
import type { PageData } from './types.js';

export interface BuildOptions {
  configPath?: string;
  verbose?: boolean;
  quiet?: boolean;
  dryRun?: boolean;
  sample?: number;
  incremental?: boolean;
}

export interface BuildDependencies {
  logger: Logger;
  aiProvider?: AIProvider;
}

const DEFAULT_PAGE_CONCURRENCY = 10;
const CACHE_DIR = '.seo-cache';

/**
 * Run the full build pipeline.
 */
export async function runBuild(
  projectDir: string,
  options: BuildOptions,
  deps: BuildDependencies,
): Promise<BuildReport> {
  const buildStart = Date.now();
  const { logger } = deps;

  // 1. Load and validate config
  const configPath = options.configPath
    ? path.resolve(projectDir, options.configPath)
    : path.resolve(projectDir, 'config.yaml');

  logger.info('Loading configuration...');
  const config = await loadConfig(configPath);
  const basePath = path.dirname(configPath);

  // 2. Load data sources
  logger.info('Loading data sources...');
  const dataSources = await loadDataSources(config.matrix.dimensions, basePath);

  // 3. Expand keyword matrix
  logger.info('Expanding keyword matrix...');
  let entries = expandMatrix(config.matrix, dataSources, basePath);
  logger.info(`Matrix expanded: ${entries.length} pages`);

  // 4. Handle --dry-run
  if (options.dryRun) {
    const summary = dryRunSummary(entries);
    logger.info('Dry run mode — no pages will be generated');
    logger.info(summary);
    return createDryRunReport(entries);
  }

  // 5. Handle --sample N
  if (options.sample && options.sample > 0) {
    entries = sampleEntries(entries, options.sample);
    logger.info(`Sampled ${entries.length} pages`);
  }

  // 6. Load build manifest for incremental builds
  const cacheDir = path.resolve(projectDir, CACHE_DIR);
  let manifest: BuildManifest | null = null;
  if (options.incremental) {
    manifest = await loadBuildManifest(cacheDir);
    if (manifest) {
      logger.info('Loaded previous build manifest for incremental build');
    }
  }

  // Set up output directory
  const outputDir = path.resolve(projectDir, config.outputDir);
  await mkdir(outputDir, { recursive: true });

  // Load layout template
  const layoutPath = path.resolve(basePath, config.templates.layout);
  const layoutTemplate = await readFile(layoutPath, 'utf-8');

  // Create Nunjucks environment
  const templateDir = path.dirname(layoutPath);
  const env = createEnvironment(templateDir);

  // Set up concurrency limiter for page processing
  const pageLimiter = createConcurrencyLimiter(DEFAULT_PAGE_CONCURRENCY);

  // 7. Process pages in parallel
  const pageReports: PageReport[] = [];
  let pagesGenerated = 0;
  let pagesSkipped = 0;
  let totalWarnings = 0;
  let totalErrors = 0;

  const pagePromises = entries.map((entry, index) =>
    pageLimiter(async () => {
      const pageStart = Date.now();
      const report: PageReport = {
        url: entry.url,
        status: 'generated',
        wordCount: 0,
        fileSize: 0,
        warnings: [],
        errors: [],
        buildTimeMs: 0,
      };

      try {
        // Check incremental build cache
        if (options.incremental && manifest && !hasEntryChanged(entry, manifest)) {
          report.status = 'skipped';
          report.buildTimeMs = Date.now() - pageStart;
          pagesSkipped++;
          logger.progress(index + 1, entries.length, `Skipped (cached): ${entry.url}`);
          return report;
        }

        // a. Generate content
        const templateConfig = config.templates.pages[0]; // Use first page template
        const content = await generateContent(entry, templateConfig, dataSources, deps.aiProvider);
        for (const w of content.warnings) {
          report.warnings.push(`${w.block}: ${w.message}`);
        }

        // b. Skip image generation in pipeline (handled separately or when sharp is available)
        const assets: { path: string; type: string }[] = [];

        // c. Generate SEO metadata
        const seoData = generateSEOMetadata(entry, config.seo, config.baseUrl);

        // d. Generate structured data (JSON-LD)
        const jsonLd = generateStructuredData(entry, config.seo, config.baseUrl, content.blocks);
        seoData.jsonLd = jsonLd;

        // e. Compute internal links
        const internalLinks = computeInternalLinks(entry, entries, config.seo.internalLinking);

        // f. Assemble full HTML page
        const pageData: PageData = {
          entry,
          content: content.blocks,
          assets,
          seo: seoData,
          internalLinks,
        };

        const html = await assemblePage(pageData, layoutTemplate, env);

        // g. Write to output directory
        const outputPath = resolveOutputPath(entry, config, outputDir);
        await mkdir(path.dirname(outputPath), { recursive: true });
        await writeFile(outputPath, html, 'utf-8');

        // Compute stats
        const allContent = Object.values(content.blocks).join(' ');
        report.wordCount = countWords(allContent);
        report.fileSize = Buffer.byteLength(html, 'utf-8');
        report.buildTimeMs = Date.now() - pageStart;

        pagesGenerated++;
        logger.progress(index + 1, entries.length, `Generated: ${entry.url}`);
      } catch (err) {
        report.status = 'error';
        report.errors.push((err as Error).message);
        report.buildTimeMs = Date.now() - pageStart;
        totalErrors++;
        logger.error(`Failed to build ${entry.url}: ${(err as Error).message}`);
      }

      return report;
    }),
  );

  const results = await Promise.all(pagePromises);
  pageReports.push(...results);

  // Count totals
  for (const r of pageReports) {
    totalWarnings += r.warnings.length;
    totalErrors += r.errors.length;
  }

  // 8. Generate sitemap.xml
  logger.info('Generating sitemap.xml...');
  const sitemapContent = generateSitemap(entries, config.baseUrl);
  await writeFile(path.join(outputDir, 'sitemap.xml'), sitemapContent, 'utf-8');

  // 9. Generate robots.txt
  logger.info('Generating robots.txt...');
  const robotsContent = generateRobots(config.baseUrl, '/sitemap.xml');
  await writeFile(path.join(outputDir, 'robots.txt'), robotsContent, 'utf-8');

  // 10. Save build manifest
  const newManifest = createBuildManifest(entries, pageReports, config);
  await saveBuildManifest(cacheDir, newManifest);

  // 11. Generate build report
  const buildTimeMs = Date.now() - buildStart;
  const report: BuildReport = {
    summary: {
      totalPages: entries.length,
      pagesGenerated,
      pagesSkipped,
      buildTimeMs,
      aiApiCalls: 0, // AI tracking not implemented at pipeline level
      aiCacheHits: 0,
      warnings: totalWarnings,
      errors: totalErrors,
    },
    pages: pageReports,
  };

  // Write build report
  const reportPath = path.join(cacheDir, 'build-report.json');
  await mkdir(cacheDir, { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  // Print summary
  logger.info('Build complete!');
  logger.info(`  Pages: ${pagesGenerated} generated, ${pagesSkipped} skipped`);
  logger.info(`  Warnings: ${totalWarnings}, Errors: ${totalErrors}`);
  logger.info(`  Time: ${buildTimeMs}ms`);

  return report;
}

/**
 * Resolve the output file path for a page entry based on output structure.
 */
function resolveOutputPath(entry: PageEntry, config: ProjectConfig, outputDir: string): string {
  if (config.outputStructure === 'flat') {
    return path.join(outputDir, `${entry.slug}.html`);
  }
  // nested: /industry/service/index.html
  return path.join(outputDir, entry.url, 'index.html');
}

/**
 * Create a dry-run report (no pages generated).
 */
function createDryRunReport(entries: PageEntry[]): BuildReport {
  return {
    summary: {
      totalPages: entries.length,
      pagesGenerated: 0,
      pagesSkipped: entries.length,
      buildTimeMs: 0,
      aiApiCalls: 0,
      aiCacheHits: 0,
      warnings: 0,
      errors: 0,
    },
    pages: entries.map((e) => ({
      url: e.url,
      status: 'skipped' as const,
      wordCount: 0,
      fileSize: 0,
      warnings: [],
      errors: [],
      buildTimeMs: 0,
    })),
  };
}

/**
 * Create a build manifest from build results.
 */
function createBuildManifest(
  entries: PageEntry[],
  pageReports: PageReport[],
  config: ProjectConfig,
): BuildManifest {
  const manifestEntries: Record<string, ManifestEntry> = {};

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const report = pageReports[i];
    if (report && report.status === 'generated') {
      manifestEntries[entry.id] = {
        inputHash: entry.inputHash,
        outputFiles: [resolveOutputPathRelative(entry, config)],
        builtAt: new Date().toISOString(),
        contentHash: sha256(JSON.stringify(report)),
      };
    }
  }

  return {
    version: '1.0.0',
    builtAt: new Date().toISOString(),
    configHash: sha256(JSON.stringify(config)),
    templateHash: sha256(config.templates.layout),
    entries: manifestEntries,
  };
}

/**
 * Get relative output path for manifest.
 */
function resolveOutputPathRelative(entry: PageEntry, config: ProjectConfig): string {
  if (config.outputStructure === 'flat') {
    return `${entry.slug}.html`;
  }
  return path.join(entry.url, 'index.html');
}
