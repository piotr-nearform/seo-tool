---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['product-brief-seo-2026-03-18.md', 'prd.md']
workflowType: 'architecture'
project_name: 'seo'
user_name: 'Pete'
date: '2026-03-18'
---

# Architecture Decision Document

## 1. Technical Summary

**seo** is a Node.js/TypeScript CLI tool that implements a static site generator pattern specialized for programmatic SEO. It consumes a keyword matrix definition and content templates, orchestrates AI content generation and dynamic image composition, and outputs deployment-ready static HTML with full SEO infrastructure (structured data, sitemaps, internal linking). The architecture is a linear build pipeline — not a client-server system — designed to process thousands of pages efficiently through parallel stage execution, aggressive caching, and incremental rebuild support. All external dependencies are build-time only; the output is zero-dependency static files deployable to any hosting platform. The system is a single npm package, installed globally, operating on user project directories.

## 2. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript 5.x (strict mode) | Type safety catches data-shape bugs at compile time, critical for a pipeline handling thousands of structured records. Solo dev + AI assistance benefits from compiler-enforced contracts. Traces to NFR-015 (Node.js runtime). |
| Runtime | Node.js 18+ (LTS) | Required by NFR-015. LTS ensures stability. v18+ provides native `fetch`, `fs/promises`, and worker threads without polyfills. |
| CLI Framework | Commander.js 12+ | Proven, minimal, zero-magic. Handles subcommands (`init`, `build`, `preview`, `audit`, `export`), flags, help generation. Traces to FR-031 through FR-037, PT-01, PT-02. Trade-off: yargs has more features but Commander's simplicity fits a solo-dev project better. |
| Template Engine | Nunjucks | Chosen over Handlebars. Nunjucks supports filters, conditionals, loops, template inheritance, and async rendering — all needed for block-based templates (FR-008) and computed fields (FR-009). Handlebars is intentionally logic-less which would force workarounds. Nunjucks is Mozilla-maintained, battle-tested, and faster than Liquid. |
| Markdown Processing | markdown-it | Fast, extensible, CommonMark-compliant. Supports plugins for custom blocks. Traces to FR-013. |
| Image Generation | Sharp 0.33+ | Node.js standard for image processing. Handles compositing, text overlay via SVG injection, format conversion (WebP/PNG), and optimization. Backed by libvips — fast and memory-efficient for batch processing. Traces to FR-014 through FR-017. |
| AI Integration | Direct HTTP via `fetch` + thin abstraction | No heavy SDK dependency. OpenAI and Anthropic APIs are simple REST endpoints. A thin provider abstraction layer keeps the dependency surface minimal and allows adding providers without library upgrades. Traces to FR-010, FR-011, PT-12, PT-13. |
| Schema Validation | Zod 3.x | Runtime validation of config files, keyword matrices, template schemas, and API responses. Generates TypeScript types from schemas — single source of truth. Traces to FR-039, PT-05. |
| Build/Bundling | tsup (esbuild-based) | Compiles TypeScript to distributable JS. tsup wraps esbuild with sensible defaults for CLI packages (CJS/ESM dual output, dts generation). Faster than tsc for builds. Trade-off: esbuild alone requires more config; tsup is the pragmatic wrapper. |
| Testing | Vitest | Fast, native TypeScript support, Jest-compatible API, built-in coverage. Trade-off: Jest is more established but Vitest is faster and requires less config for TypeScript projects. Traces to NFR-012, NFR-013. |
| Linting | ESLint 9+ (flat config) + Prettier | ESLint for correctness, Prettier for formatting. Flat config is the current ESLint standard. No Biome — too new for a project prioritizing boring technology. |
| Package Manager | pnpm | Faster installs, strict dependency resolution (prevents phantom deps), disk-efficient. Single-package project — no monorepo tooling needed. |
| Build Cache | JSON files (with SQLite upgrade path) | JSON manifest files for build cache/incremental builds. Simple, inspectable, no binary dependency. If performance degrades at >10K pages, migrate to better-sqlite3 (synchronous, zero-config). Traces to FR-038, NFR-006. |
| Config Format | YAML (primary) + JSON | YAML via `js-yaml`. Human-friendly for the primary config use case. JSON supported for programmatic workflows. Traces to FR-039, PT-05. |
| Environment Variables | dotenv | Standard `.env` file support. Traces to FR-040, PT-11. |
| Local Server | Node.js `http` module (or `sirv`) | Lightweight static file server for `seo preview`. No Express overhead. Traces to FR-033, PT-09. |
| Logging | Custom lightweight logger | Three levels: quiet (errors only), default (progress + warnings), verbose (debug). Colored output via `chalk` or `picocolors`. No logging framework needed for a CLI tool. Traces to FR-037, PT-03. |

## 3. System Architecture

### 3.1 High-Level Architecture

```
                            seo CLI Tool
 ┌─────────────────────────────────────────────────────────────────────┐
 │                                                                     │
 │  ┌──────────┐   ┌──────────┐   ┌───────────┐   ┌───────────────┐  │
 │  │  Config   │──>│ Keyword  │──>│  Content   │──>│    Visual     │  │
 │  │  Loader   │   │  Matrix  │   │ Generator  │   │    Asset      │  │
 │  │          │   │  Engine   │   │           │   │   Generator   │  │
 │  └──────────┘   └──────────┘   └───────────┘   └───────────────┘  │
 │       │                              │                  │          │
 │       │              ┌───────────────┘──────────────────┘          │
 │       ▼              ▼                                             │
 │  ┌──────────┐   ┌──────────┐   ┌───────────┐   ┌───────────────┐  │
 │  │   Data    │   │   Page   │──>│  Quality   │──>│    Export     │  │
 │  │  Sources  │   │ Assembler│   │  Checker   │   │   (Output)   │  │
 │  │ (CSV/JSON)│   │          │   │           │   │              │  │
 │  └──────────┘   └──────────┘   └───────────┘   └───────────────┘  │
 │                      │                                │            │
 │                      ▼                                ▼            │
 │               ┌─────────────┐                ┌──────────────┐     │
 │               │ AI Provider │                │ Build Report │     │
 │               │  Abstraction│                │   & Cache    │     │
 │               │  (OpenAI /  │                └──────────────┘     │
 │               │  Anthropic) │                                     │
 │               └─────────────┘                                     │
 │                                                                     │
 └─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Static Output   │
                    │  ├── index.html  │
                    │  ├── pages/      │
                    │  ├── assets/     │
                    │  ├── sitemap.xml │
                    │  └── robots.txt  │
                    └──────────────────┘
```

### 3.2 Component Descriptions

**Config Loader**
- Responsibility: Parse and validate project configuration from YAML/JSON files and environment variables.
- Inputs: `config.yaml` or `config.json`, `.env` file, environment variables.
- Outputs: Validated `ProjectConfig` object (Zod-parsed).
- Key interfaces: `loadConfig(projectDir: string): Promise<ProjectConfig>`
- Traces to: FR-039, FR-040, PT-05, PT-11.

**Keyword Matrix Engine**
- Responsibility: Expand keyword dimensions into the full set of page entries via cartesian product, apply filters, generate URLs and slugs.
- Inputs: `ProjectConfig.matrix` (dimensions, patterns, filters), CSV data files.
- Outputs: `PageEntry[]` — the complete list of pages to generate.
- Key interfaces: `expandMatrix(config: MatrixConfig, data: DataSources): PageEntry[]`
- Traces to: FR-003 through FR-007.

**Data Sources**
- Responsibility: Load external data from CSV and JSON files, provide lookup tables for template interpolation.
- Inputs: File paths from config.
- Outputs: `DataSources` map (keyed record sets).
- Key interfaces: `loadDataSources(config: DataSourceConfig): Promise<DataSources>`
- Traces to: FR-005, FR-009.

**Content Generator**
- Responsibility: Render content templates for each page entry, orchestrate AI content generation for designated blocks, apply variable interpolation.
- Inputs: `PageEntry`, template files, `DataSources`, AI provider.
- Outputs: `PageContent` (rendered HTML blocks per page).
- Key interfaces: `generateContent(entry: PageEntry, templates: TemplateSet, ai: AIProvider): Promise<PageContent>`
- Traces to: FR-008 through FR-013.

**AI Provider Abstraction**
- Responsibility: Abstract OpenAI and Anthropic APIs behind a common interface. Handle retries, rate limiting, caching, cost tracking.
- Inputs: Prompt string, provider config (model, temperature, max tokens).
- Outputs: Generated text string.
- Key interfaces: `AIProvider.generate(prompt: string, options: GenerateOptions): Promise<string>`
- Traces to: FR-010, FR-011, PT-12, PT-13, PT-14, NFR-007, NFR-009.

**Visual Asset Generator**
- Responsibility: Compose page-specific images from templates — base images with text overlays and dynamic data.
- Inputs: `PageEntry`, image template config, source assets.
- Outputs: Optimized WebP and PNG image files.
- Key interfaces: `generateImages(entry: PageEntry, templates: ImageTemplateConfig[]): Promise<GeneratedAsset[]>`
- Traces to: FR-014 through FR-017.

**Page Assembler**
- Responsibility: Combine rendered content, generated assets, SEO metadata, structured data, and internal links into final HTML pages.
- Inputs: `PageContent`, `GeneratedAsset[]`, `PageEntry`, layout templates, all `PageEntry[]` (for internal linking).
- Outputs: Complete HTML files written to the output directory.
- Key interfaces: `assemblePage(content: PageContent, assets: GeneratedAsset[], entry: PageEntry, allEntries: PageEntry[]): Promise<string>`
- Traces to: FR-018 through FR-025.

**Quality Checker**
- Responsibility: Run content uniqueness analysis, thin content detection, broken link checking, and structured data validation across the generated corpus.
- Inputs: Generated output directory.
- Outputs: `AuditReport` with per-page scores, warnings, and errors.
- Key interfaces: `auditCorpus(outputDir: string, config: AuditConfig): Promise<AuditReport>`
- Traces to: FR-026 through FR-030.

**Export / Output**
- Responsibility: Produce the final deployment-ready directory with sitemap.xml, robots.txt, and all assets.
- Inputs: Generated pages, project config (base URL, output structure).
- Outputs: Self-contained directory ready for deployment.
- Key interfaces: `exportSite(outputDir: string, exportDir: string, config: ExportConfig): Promise<void>`
- Traces to: FR-021, FR-022, FR-035.

**Build Cache & Report**
- Responsibility: Track input hashes for incremental builds, produce structured build reports.
- Inputs: Current build state, previous manifest.
- Outputs: `build-manifest.json`, `build-report.json`.
- Key interfaces: `BuildCache.hasChanged(entry: PageEntry): boolean`, `BuildCache.save(): Promise<void>`
- Traces to: FR-029, FR-038, NFR-006, NFR-008.

### 3.3 Component Interactions

The build pipeline is a directed acyclic graph with this execution order:

```
1. Config Loader ─────────────────┐
2. Data Sources (parallel with 1) ─┤
                                   ▼
3. Keyword Matrix Engine (depends on 1 + 2)
                    │
                    ▼
4. Build Cache Check (filter to changed entries if --incremental)
                    │
                    ▼
    ┌───────────────┴───────────────┐
    ▼                               ▼
5a. Content Generator           5b. Visual Asset Generator
    (parallel per page,             (parallel per page,
     with AI concurrency             with concurrency
     limiter)                        limiter)
    └───────────────┬───────────────┘
                    ▼
6. Page Assembler (depends on 5a + 5b for each page)
                    │
                    ▼
7. Sitemap + Robots.txt + Internal Links (depends on all pages)
                    │
                    ▼
8. Build Cache Update + Report Generation
```

Data flows through the pipeline as typed objects:
- `ProjectConfig` flows from Config Loader to all downstream components.
- `PageEntry[]` flows from Matrix Engine to Content Generator, Visual Asset Generator, and Page Assembler.
- `PageContent` and `GeneratedAsset[]` flow from their generators to the Page Assembler per-page.
- The full `PageEntry[]` list is available to the Page Assembler for internal link computation.
- `BuildManifest` is read at step 4 and written at step 8.

## 4. Data Model

All core data structures defined as TypeScript interfaces with Zod schemas for runtime validation.

```typescript
// ─── Project Configuration ───

interface ProjectConfig {
  name: string;
  version: string;
  baseUrl: string;                    // e.g., "https://example.com"
  outputDir: string;                  // default: "./dist"
  outputStructure: 'flat' | 'nested'; // FR: PT-08
  matrix: MatrixConfig;
  templates: TemplateConfig;
  images: ImageConfig;
  ai: AIConfig;
  seo: SEOConfig;
  audit: AuditConfig;
}

interface MatrixConfig {
  dimensions: Record<string, DimensionDef>;
  pattern: {
    url: string;      // e.g., "{head_term}-for-{industry}"
    title: string;    // e.g., "{head_term} for {industry} | {site_name}"
    description: string;
  };
  filters: FilterRule[];
}

interface DimensionDef {
  values: string[];           // inline values
  source?: string;            // path to CSV/JSON file
  column?: string;            // column name if CSV source
  metadata?: Record<string, unknown>; // extra data per value
}

interface FilterRule {
  type: 'include' | 'exclude';
  condition: string;           // expression: e.g., "industry == 'restaurants' && use_case == 'yacht management'"
}

// ─── Keyword Matrix Entry ───

interface PageEntry {
  id: string;                          // deterministic hash of dimensions
  slug: string;                        // URL-safe path segment, ≤75 chars (DR-08)
  url: string;                         // full path from base URL
  title: string;                       // rendered title from pattern
  description: string;                 // rendered meta description
  dimensions: Record<string, string>;  // resolved dimension values
  data: Record<string, unknown>;       // merged external data for this entry
  inputHash: string;                   // hash of all inputs for cache invalidation
}

// ─── Content Template Schema ───

interface TemplateConfig {
  layout: string;              // path to base layout template
  pages: PageTemplateConfig[];
}

interface PageTemplateConfig {
  name: string;
  file: string;                // path to template file (Nunjucks/Markdown)
  format: 'nunjucks' | 'markdown';
  blocks: ContentBlockConfig[];
}

interface ContentBlockConfig {
  name: string;                        // e.g., "hero", "features", "faq"
  type: 'static' | 'ai';
  template?: string;                   // inline or file path for static blocks
  ai?: AIBlockConfig;                  // config for AI-generated blocks
  rules?: ContentRules;
}

interface AIBlockConfig {
  prompt: string;                      // prompt template with {{variables}}
  provider?: 'openai' | 'anthropic';   // override global default
  model?: string;
  temperature?: number;                // default: 0.7
  maxTokens?: number;                  // default: 500
}

interface ContentRules {
  minWords?: number;         // default: none; DR-05 suggests 300 for full page
  maxWords?: number;
  requiredKeywords?: string[];
  tone?: string;             // passed to AI prompts
}

// ─── Page Data Model (assembled page) ───

interface PageData {
  entry: PageEntry;
  content: Record<string, string>;     // block name -> rendered HTML
  assets: GeneratedAsset[];
  seo: PageSEOData;
  internalLinks: InternalLink[];
}

interface PageSEOData {
  title: string;
  description: string;
  canonical: string;
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
  jsonLd: object[];                    // Schema.org structured data
  breadcrumbs: BreadcrumbItem[];
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface InternalLink {
  targetUrl: string;
  anchorText: string;
  relationship: string;       // e.g., "same-industry", "same-use-case"
}

// ─── Visual Asset Template Schema ───

interface ImageConfig {
  templates: ImageTemplateConfig[];
  outputFormats: ('webp' | 'png')[];   // default: ['webp', 'png']
  quality: number;                      // WebP quality, default: 80
}

interface ImageTemplateConfig {
  name: string;                        // e.g., "hero", "og-image"
  baseImage: string;                   // path to base image file
  width: number;
  height: number;
  overlays: ImageOverlay[];
}

interface ImageOverlay {
  type: 'text' | 'image';
  // Text overlay fields
  content?: string;                    // template string with {{variables}}
  font?: string;                       // font file path or system font
  fontSize?: number;
  fontColor?: string;                  // hex color
  x: number;
  y: number;
  maxWidth?: number;                   // text wrapping boundary
  // Image overlay fields
  source?: string;                     // path or data field reference
  width?: number;
  height?: number;
}

// ─── Generated Asset ───

interface GeneratedAsset {
  templateName: string;
  files: { format: string; path: string; size: number }[];
  altText: string;                     // DR-07: derived from keyword data
}

// ─── Build Manifest / Cache ───

interface BuildManifest {
  version: string;
  builtAt: string;                     // ISO timestamp
  configHash: string;                  // hash of project config
  templateHash: string;                // hash of all templates
  entries: Record<string, ManifestEntry>; // keyed by PageEntry.id
}

interface ManifestEntry {
  inputHash: string;
  outputFiles: string[];
  builtAt: string;
  contentHash: string;                 // hash of generated content
}

// ─── Build Report ───

interface BuildReport {
  summary: {
    totalPages: number;
    pagesGenerated: number;
    pagesSkipped: number;              // incremental builds
    buildTimeMs: number;
    aiApiCalls: number;
    aiCacheHits: number;
    warnings: number;
    errors: number;
  };
  pages: PageReport[];
}

interface PageReport {
  url: string;
  status: 'generated' | 'skipped' | 'error';
  wordCount: number;
  fileSize: number;                    // bytes, before images
  uniquenessScore?: number;            // Jaccard distance from nearest sibling
  warnings: string[];
  errors: string[];
  buildTimeMs: number;
}

// ─── Audit Report ───

interface AuditReport {
  summary: {
    totalPages: number;
    passedPages: number;
    warnedPages: number;
    failedPages: number;
    averageUniqueness: number;
    brokenLinks: number;
  };
  checks: {
    uniqueness: UniquenessResult[];
    thinContent: ThinContentResult[];
    brokenLinks: BrokenLinkResult[];
    structuredData: StructuredDataResult[];
  };
}

// ─── AI Provider Interface ───

interface AIProvider {
  name: string;
  generate(prompt: string, options: GenerateOptions): Promise<string>;
}

interface GenerateOptions {
  model: string;
  temperature: number;
  maxTokens: number;
  cacheKey?: string;          // for response caching
}

// ─── AI Configuration ───

interface AIConfig {
  defaultProvider: 'openai' | 'anthropic';
  concurrency: number;            // max parallel API calls, default: 5
  cache: boolean;                 // cache AI responses, default: true
  cacheTtlDays: number;          // default: 30
  providers: {
    openai?: { model: string; apiKeyEnv: string };
    anthropic?: { model: string; apiKeyEnv: string };
  };
}

// ─── SEO Configuration ───

interface SEOConfig {
  siteName: string;
  defaultOgImage?: string;
  schemaTypes: ('Product' | 'FAQPage' | 'BreadcrumbList' | 'WebPage')[];
  internalLinking: {
    enabled: boolean;
    maxLinksPerPage: number;     // default: 10
    strategy: 'shared-dimension'; // link pages sharing dimension values
  };
}

// ─── Audit Configuration ───

interface AuditConfig {
  uniquenessThreshold: number;   // max Jaccard similarity, default: 0.30
  minWordCount: number;          // thin content threshold, default: 300
  validateStructuredData: boolean;
}
```

## 5. Directory Structure

### Tool Source Structure (`seo` npm package)

```
seo/
├── src/
│   ├── cli/
│   │   ├── index.ts              # CLI entry point, Commander setup
│   │   ├── commands/
│   │   │   ├── init.ts           # seo init <name>
│   │   │   ├── build.ts          # seo build [flags]
│   │   │   ├── preview.ts        # seo preview
│   │   │   ├── audit.ts          # seo audit
│   │   │   └── export.ts         # seo export
│   │   └── logger.ts             # Output formatting and verbosity
│   ├── core/
│   │   ├── config.ts             # Config loading and Zod validation
│   │   ├── matrix.ts             # Keyword matrix expansion + filtering
│   │   ├── data-sources.ts       # CSV/JSON data loading
│   │   └── cache.ts              # Build manifest / incremental build
│   ├── content/
│   │   ├── template-engine.ts    # Nunjucks setup and rendering
│   │   ├── markdown.ts           # Markdown-to-HTML processing
│   │   ├── content-generator.ts  # Orchestrates block rendering + AI
│   │   └── internal-links.ts     # Internal link computation
│   ├── ai/
│   │   ├── provider.ts           # AIProvider interface
│   │   ├── openai.ts             # OpenAI implementation
│   │   ├── anthropic.ts          # Anthropic implementation
│   │   ├── cache.ts              # AI response caching
│   │   └── rate-limiter.ts       # Concurrency + rate limit management
│   ├── images/
│   │   ├── image-generator.ts    # Image composition orchestrator
│   │   ├── compositor.ts         # Sharp-based image composition
│   │   └── optimizer.ts          # WebP/PNG optimization
│   ├── builder/
│   │   ├── page-assembler.ts     # Combines content + assets + SEO into HTML
│   │   ├── seo-metadata.ts       # Meta tags, OG, Twitter cards
│   │   ├── structured-data.ts    # JSON-LD generation
│   │   ├── sitemap.ts            # sitemap.xml generation
│   │   ├── robots.ts             # robots.txt generation
│   │   └── pipeline.ts           # Build orchestration (parallel processing)
│   ├── audit/
│   │   ├── uniqueness.ts         # Jaccard similarity checker
│   │   ├── thin-content.ts       # Word count checker
│   │   ├── broken-links.ts       # Internal link validator
│   │   ├── structured-data.ts    # JSON-LD validator
│   │   └── reporter.ts           # Report generation (JSON + terminal)
│   ├── schemas/
│   │   └── index.ts              # All Zod schemas, exported types
│   └── utils/
│       ├── hash.ts               # Deterministic hashing for cache keys
│       ├── slug.ts               # URL slug generation (DR-08 compliance)
│       └── fs.ts                 # File system helpers
├── templates/
│   └── scaffold/                 # Files copied by `seo init`
│       ├── config.yaml
│       ├── templates/
│       │   ├── layout.njk
│       │   └── landing-page.njk
│       ├── data/
│       │   └── example.csv
│       ├── assets/
│       │   └── hero-base.png
│       ├── .env.example
│       └── .gitignore
├── test/
│   ├── unit/
│   │   ├── core/
│   │   ├── content/
│   │   ├── ai/
│   │   ├── images/
│   │   ├── builder/
│   │   └── audit/
│   ├── integration/
│   │   ├── init.test.ts
│   │   ├── build.test.ts
│   │   ├── preview.test.ts
│   │   ├── audit.test.ts
│   │   └── export.test.ts
│   └── fixtures/
│       └── reference-project/    # Complete test project
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .eslintrc.js
├── .prettierrc
└── .github/
    └── workflows/
        └── ci.yml                # Test on macOS, Linux, Windows/WSL2
```

### User Project Structure (created by `seo init`)

```
my-project/
├── config.yaml               # Project configuration (matrix, templates, AI, SEO)
├── templates/
│   ├── layout.njk            # Base HTML layout (head, body wrapper, footer)
│   ├── landing-page.njk      # Page template with content blocks
│   └── blocks/               # Optional: reusable content block partials
│       ├── hero.njk
│       ├── features.njk
│       ├── comparison.njk
│       ├── faq.njk
│       └── cta.njk
├── data/
│   ├── industries.csv        # Dimension values from external files
│   └── products.json         # Product data for interpolation
├── assets/
│   ├── images/
│   │   ├── hero-base.png     # Base images for visual asset templates
│   │   └── products/         # Product images mapped to entries
│   └── fonts/                # Custom fonts for image text overlays
├── .env                      # API keys (gitignored)
├── .gitignore
├── dist/                     # Generated output (gitignored)
│   ├── [page-slug]/
│   │   └── index.html
│   ├── assets/
│   │   └── images/
│   ├── sitemap.xml
│   └── robots.txt
└── .seo-cache/               # Build cache (gitignored)
    ├── build-manifest.json
    ├── ai-cache/             # Cached AI responses
    └── build-report.json
```

## 6. Pipeline Architecture

### Build Pipeline Stages

The `seo build` command executes the following stages:

**Stage 1: Initialization (sequential)**
1. Load and validate `config.yaml` via Zod schemas. Fail fast on invalid config.
2. Load data sources (CSV/JSON files). Validate column mappings.
3. Load environment variables (API keys via dotenv).

**Stage 2: Matrix Expansion (sequential, CPU-bound)**
1. Expand all dimensions into `PageEntry[]` via cartesian product.
2. Apply filter rules to remove excluded combinations.
3. Generate slugs and URLs per entry (enforce DR-08: lowercase, hyphen-separated, ≤75 chars).
4. Compute `inputHash` per entry (hash of dimensions + template hash + config hash).
5. If `--dry-run`: print matrix summary and exit.
6. If `--sample N`: randomly select N entries.
7. If `--incremental`: load `build-manifest.json`, filter to entries where `inputHash` has changed.

**Stage 3: Content Generation (parallel, I/O-bound)**
Process entries in parallel batches. Concurrency is bounded by two limiters:
- **Page concurrency**: configurable (default: 10 pages processed simultaneously).
- **AI API concurrency**: configurable (default: 5 concurrent API calls across all pages).

Per page:
1. Render static template blocks via Nunjucks with variable interpolation.
2. For AI blocks: check AI cache. On cache hit, use cached response. On miss, call AI provider.
3. Convert Markdown blocks to HTML via markdown-it.
4. Apply content rules validation (word count, required keywords). Log warnings on violations.

**Stage 4: Visual Asset Generation (parallel, CPU-bound)**
Runs concurrently with Stage 3 where possible (image generation doesn't depend on AI content).
Per page:
1. For each image template in config, compose the output image via Sharp.
2. Render text overlays from PageEntry data (SVG text injected into Sharp pipeline).
3. Output WebP (primary) and PNG (fallback). Optimize file sizes.
4. Generate `alt` text from keyword data (DR-07).

**Stage 5: Page Assembly (parallel per page, depends on stages 3+4)**
Per page:
1. Render the layout template with content blocks, assets, and SEO metadata.
2. Generate JSON-LD structured data based on configured schema types.
3. Generate meta tags, OG tags, Twitter cards.
4. Compute internal links: find pages sharing ≥1 dimension value, select top N by relevance.
5. Write final HTML to output directory.

**Stage 6: Site-Level Generation (sequential, depends on stage 5)**
1. Generate `sitemap.xml` from all page URLs with lastmod timestamps.
2. Generate `robots.txt` with sitemap reference.
3. Update `build-manifest.json` with current build state.
4. Generate `build-report.json` and print summary to terminal.

### Parallel Processing Strategy

```
                    ┌──────────────────────┐
                    │   Page Entry Queue    │
                    │  [entry1, entry2, ...]│
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Concurrency Limiter  │
                    │  (default: 10 pages)  │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
        ┌───────────┐  ┌───────────┐     ┌───────────┐
        │  Page 1   │  │  Page 2   │ ... │  Page 10  │
        │ ┌───────┐ │  │ ┌───────┐ │     │ ┌───────┐ │
        │ │Content│ │  │ │Content│ │     │ │Content│ │
        │ └───┬───┘ │  │ └───┬───┘ │     │ └───┬───┘ │
        │ ┌───▼───┐ │  │ ┌───▼───┐ │     │ ┌───▼───┐ │
        │ │Images │ │  │ │Images │ │     │ │Images │ │
        │ └───┬───┘ │  │ └───┬───┘ │     │ └───┬───┘ │
        │ ┌───▼───┐ │  │ ┌───▼───┐ │     │ ┌───▼───┐ │
        │ │Assemble│ │  │ │Assemble│ │     │ │Assemble│ │
        │ └───────┘ │  │ └───────┘ │     │ └───────┘ │
        └───────────┘  └───────────┘     └───────────┘
              │                │                 │
              │    ┌───────────┴──────┐         │
              │    │ AI Rate Limiter  │         │
              │    │ (shared, 5 conc) │         │
              │    └──────────────────┘         │
              └────────────┬────────────────────┘
                           ▼
                    ┌─────────────┐
                    │ Site-Level  │
                    │ (sitemap,   │
                    │  robots.txt)│
                    └─────────────┘
```

Implementation: Use a simple `Promise`-based concurrency pool (a ~30-line utility using `Promise.race` over a queue). No worker threads needed for MVP — Node.js async I/O handles API calls and file writes efficiently. Worker threads are an optimization for CPU-bound image generation if profiling shows it's the bottleneck.

### Caching Strategy

**AI Response Cache** (most impactful — saves money and time):
- Key: SHA-256 of `(prompt + model + temperature + maxTokens)`.
- Storage: JSON files in `.seo-cache/ai-cache/{hash}.json`.
- Contains: `{ prompt, response, model, createdAt, tokens }`.
- TTL: configurable, default 30 days. Stale entries used as fallback on API failure.
- Cache is local to the project, not shared across projects.

**Build Manifest** (enables incremental builds):
- Tracks `inputHash` per `PageEntry.id`.
- `inputHash` = SHA-256 of `(dimensions + templateContentHash + configHash + aiCacheKey)`.
- On `--incremental`, only entries with changed `inputHash` are rebuilt.
- Template or config changes invalidate all entries (their hashes change).

**No HTTP-level caching of AI responses** — the application-level cache above is simpler and more reliable.

### Interrupted Build Recovery (NFR-008)

- Before generating a page, check if the output HTML file already exists and its hash matches the manifest entry.
- On build start, load the existing manifest. Pages already built (and unchanged) are skipped.
- This means killing and restarting a build resumes from where it left off, with no special recovery logic needed beyond the incremental build mechanism.

## 7. AI Integration Architecture

### Provider Abstraction

```typescript
// src/ai/provider.ts
interface AIProvider {
  name: string;
  generate(prompt: string, options: GenerateOptions): Promise<string>;
}

// Concrete implementations call the REST APIs directly via fetch().
// No SDK dependencies — OpenAI and Anthropic APIs are simple POST endpoints.
```

**OpenAI implementation** (`src/ai/openai.ts`):
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Default model: `gpt-4o-mini` (cost-effective for bulk content generation)
- API key from `OPENAI_API_KEY` env var

**Anthropic implementation** (`src/ai/anthropic.ts`):
- Endpoint: `https://api.anthropic.com/v1/messages`
- Default model: `claude-sonnet-4-20250514` (good balance of quality and speed)
- API key from `ANTHROPIC_API_KEY` env var

### Prompt Template System

Prompt templates live in the content block configuration and use the same Nunjucks syntax as page templates:

```yaml
blocks:
  - name: hero_description
    type: ai
    ai:
      prompt: |
        Write a compelling 2-paragraph product description for {{head_term}}
        targeting {{industry}} businesses focused on {{use_case}}.

        Requirements:
        - Mention specific pain points for {{industry}}
        - Include a concrete benefit related to {{use_case}}
        - Tone: professional but approachable
        - Length: 100-150 words
      model: gpt-4o-mini
      temperature: 0.7
      maxTokens: 300
```

The prompt is rendered through Nunjucks with the page's dimension data before being sent to the AI provider, giving full access to filters and conditionals.

### Rate Limiting and Concurrency

```typescript
// src/ai/rate-limiter.ts
class AIRateLimiter {
  private semaphore: Semaphore;  // concurrency limiter

  constructor(maxConcurrent: number) {
    this.semaphore = new Semaphore(maxConcurrent);
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return this.semaphore.run(fn);
  }
}
```

- Default concurrency: 5 simultaneous API calls (configurable via `ai.concurrency`).
- Retry logic: 3 retries with exponential backoff (1s, 2s, 4s) on HTTP 429 and 5xx responses (NFR-009).
- On persistent failure: log warning, fall back to template-only interpolation for that block (FR-041, NFR-007).

### Cost Management

- AI cache prevents redundant API calls (most impactful cost control).
- `--dry-run` shows page count so users can estimate costs before building.
- Build report includes `aiApiCalls` and `aiCacheHits` counts.
- Default models chosen for cost efficiency (`gpt-4o-mini` at ~$0.15/1M input tokens).
- Estimated cost for 2,000 pages with 2 AI blocks each at 300 tokens: approximately $1-3.

### Fallback Strategy

```
AI Block Rendering:
  1. Check AI cache → cache hit → return cached response
  2. Call AI provider → success → cache response → return
  3. Retry (up to 3x with backoff) → success → cache → return
  4. Check stale cache (expired but available) → return stale with warning
  5. All fails → render block with template interpolation only → log warning
```

This ensures builds never fail due to AI unavailability (PT-14, NFR-007).

## 8. Image Generation Architecture

### Approach: Sharp with SVG Text Injection

Sharp (libvips) handles all image operations. Text overlays are rendered via SVG buffers composited onto base images. This avoids the need for a Canvas dependency (node-canvas requires system-level libraries that complicate cross-platform installs).

### Image Generation Pipeline

```
Per page, per image template:
  1. Load base image via Sharp
  2. For each text overlay:
     a. Render template string with page data (Nunjucks)
     b. Generate SVG buffer with text, font, size, color, position
     c. Measure text to handle wrapping at maxWidth boundary
  3. For each image overlay:
     a. Resolve source path (static file or data field reference)
     b. Resize overlay image to specified dimensions
  4. Composite all overlays onto base image (Sharp.composite())
  5. Output WebP (quality: 80) and PNG
  6. Record file sizes and generate alt text
```

### SVG Text Rendering

```typescript
function createTextSvg(text: string, options: TextOptions): Buffer {
  const svg = `
    <svg width="${options.maxWidth}" height="${options.fontSize * 2}">
      <text
        x="0" y="${options.fontSize}"
        font-family="${options.font}"
        font-size="${options.fontSize}"
        fill="${options.fontColor}"
      >${escapeXml(text)}</text>
    </svg>`;
  return Buffer.from(svg);
}
```

Trade-off: SVG text rendering in Sharp has limited font support compared to node-canvas. For MVP, system fonts and bundled .woff/.ttf files cover the use case. If users need advanced typography (kerning, ligatures), node-canvas can be added as an optional dependency in a future version.

### Image Optimization

- WebP output at quality 80 (configurable) — targets ≤200KB for 1200x630 hero images (FR-016).
- PNG generated as fallback.
- Sharp's built-in optimization is sufficient; no need for additional tools like imagemin.
- Images are generated in parallel per page but sequentially per image within a page (Sharp operations are CPU-bound and already parallelize internally via libvips thread pool).

## 9. Plugin/Extension Architecture

For MVP, extensibility is achieved through file-based conventions rather than a formal plugin API. This keeps complexity low while still allowing users to customize every aspect.

### Template Extensions

Users extend templates by:
1. **Custom blocks**: Add `.njk` files to `templates/blocks/`. Reference them in `config.yaml` block definitions.
2. **Layout overrides**: Replace `layout.njk` with a custom layout. The layout receives `PageData` as its context.
3. **Nunjucks filters/globals**: A `templates/helpers.js` file (if present) is loaded and its exports registered as Nunjucks filters. This is the escape hatch for custom logic.

### Content Block Types

New content block types can be added by:
1. Creating a block template file.
2. Referencing it in `config.yaml` with `type: static` and a `template` path.
3. AI blocks are inherently extensible — any prompt template can produce any content structure.

### Visual Asset Templates

Users add image templates by:
1. Adding base images to `assets/images/`.
2. Defining new image template configs in `config.yaml` under `images.templates`.
3. No code changes needed.

### Future Plugin API (post-MVP)

A formal plugin API would add:
- Lifecycle hooks: `beforeBuild`, `afterMatrixExpand`, `beforePageRender`, `afterPageRender`, `afterBuild`.
- Custom AI providers (e.g., local LLMs via Ollama).
- Custom data source loaders (e.g., database, API fetch).
- This is explicitly out of scope for v1 but the pipeline architecture makes it straightforward to add later — each stage is a clear injection point.

## 10. Configuration Architecture

### Configuration Hierarchy

```
1. Default values (hardcoded in Zod schemas)
   ↓ overridden by
2. config.yaml / config.json (project-level)
   ↓ overridden by
3. Environment variables (OPENAI_API_KEY, etc.)
   ↓ overridden by
4. CLI flags (--output, --sample, --verbose, etc.)
```

### Config Validation

All configuration is validated at load time using Zod schemas. Invalid config produces a clear, actionable error message with the specific field and violation:

```
Error: Invalid configuration in config.yaml
  → matrix.dimensions.industry.values: Expected array, received string
  → ai.concurrency: Expected number ≥ 1, received 0
```

The Zod schemas defined in `src/schemas/index.ts` serve as both runtime validators and TypeScript type generators — single source of truth.

### Config File Discovery

The tool looks for config in the current working directory:
1. `config.yaml` (preferred)
2. `config.yml`
3. `config.json`
4. `seo.config.yaml` (alternative name)

First match wins. `--config <path>` flag overrides discovery.

### Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API authentication | Only if using OpenAI provider |
| `ANTHROPIC_API_KEY` | Anthropic API authentication | Only if using Anthropic provider |
| `SEO_AI_CONCURRENCY` | Override AI concurrency limit | No (default: 5) |
| `SEO_LOG_LEVEL` | Override log verbosity | No (default: "info") |

Loaded via `dotenv` from `.env` in project root. The `.gitignore` generated by `seo init` includes `.env`.

## 11. Error Handling & Resilience

### Error Categories

| Category | Behavior | Exit Code |
|---|---|---|
| Config validation failure | Fail fast with specific error message | 2 (usage error) |
| Missing required files (templates, data) | Fail fast with file path in error | 1 |
| AI API failure (after retries) | Warn, fall back to template interpolation, continue build | 0 (with warnings) |
| Image generation failure | Warn, skip image for that page, continue build | 0 (with warnings) |
| Individual page rendering failure | Warn, skip page, continue build | 0 (with warnings) |
| All pages fail | Error with summary | 1 |
| Disk full / write failure | Fail with OS error | 1 |

### Design Principles

1. **Fail fast on config, degrade gracefully on content.** Invalid configuration is always a hard error. Missing AI or image generation degrades output but doesn't stop the build. Traces to PT-14, NFR-007.

2. **Never leave partial output in an inconsistent state.** Pages are written atomically (write to temp file, rename). The build manifest is only updated after successful page generation.

3. **Every warning and error is actionable.** Messages include: what failed, which page/entry was affected, and what to do about it.

### Error Reporting

Errors and warnings accumulate during the build and are included in:
- Terminal output (real-time during build).
- `build-report.json` (structured, parseable).
- `seo audit` output (post-build analysis).

## 12. Performance Architecture

### Target Performance (NFR-001, NFR-002, NFR-005)

| Operation | Target | Constraint |
|---|---|---|
| Dry-run (10K combinations) | ≤5 seconds | CPU-only, no I/O |
| Full build (2K pages with AI) | ≤20 minutes (~100 pages/hr) | Bottleneck: AI API latency |
| Full build (2K pages without AI) | ≤5 minutes | CPU + disk I/O |
| Incremental build (50 changed pages) | ≤2 minutes | Only changed pages processed |
| Peak memory (50K page matrix) | ≤4GB | Stream-process, don't hold all in memory |

### Memory Management for Large Builds

For matrices with >10K entries:
1. **Matrix expansion** produces the full `PageEntry[]` in memory (each entry is ~1KB; 50K entries = ~50MB — acceptable).
2. **Content generation** processes pages in batches. Only `concurrency` pages are in-flight at once. Completed page data is written to disk and released.
3. **Internal link computation** requires the full `PageEntry[]` list but not page content. The list is retained; content is not.
4. **Sitemap generation** streams entries to disk rather than building the full XML in memory.
5. **Audit uniqueness checking** uses a streaming approach: compute shingle sets per page, compare pairwise in batches. For 50K pages, full pairwise comparison is O(n^2) and infeasible. Use MinHash (locality-sensitive hashing) to approximate Jaccard similarity in O(n) space.

### Optimization Priorities

1. **AI response caching** — largest time and cost saving. A re-run with cached AI completes 10-20x faster.
2. **Incremental builds** — skip unchanged pages entirely.
3. **Parallel page processing** — saturate AI API concurrency and disk I/O.
4. **Image optimization** — Sharp is already highly optimized; no further work needed for MVP.
5. **Worker threads for image generation** — optimization for post-MVP if profiling shows CPU bottleneck.

## 13. Security Considerations

### API Key Management

- API keys are **never** stored in config files, output files, build reports, or log files (NFR-010, NFR-011).
- Zod config schema explicitly rejects fields named `apiKey`, `api_key`, `secret`, etc. to prevent accidental inclusion.
- `.env` files are added to `.gitignore` by `seo init`.
- Build report redacts any string matching API key patterns (`sk-...`, `anthropic-...`).

### Content Sanitization

- AI-generated content is treated as untrusted input. HTML output is escaped by default in Nunjucks (`{{ var }}`). Raw output requires explicit `{{ var | safe }}`.
- User-provided template variables (from keyword matrix) are HTML-escaped before injection into page content to prevent accidental HTML/script injection in case data sources contain markup.
- JSON-LD structured data values are JSON-encoded, which inherently escapes HTML.

### Dependency Security

- Minimal dependency surface: Commander, Nunjucks, Sharp, Zod, js-yaml, markdown-it, dotenv, picocolors. Each is a well-maintained, widely-used package.
- `pnpm audit` in CI catches known vulnerabilities.
- No runtime network calls from generated output — pages are fully static.

### Generated Output Safety

- No JavaScript is included in generated pages by default. If users add JS via templates, that's their responsibility.
- All external resource references (images, fonts) are relative paths to locally generated assets — no CDN dependencies in output.

## 14. Development Approach

### Recommended Build Order

Build the pipeline stages sequentially, each one testable independently:

**Phase 1: Foundation (Week 1-2)**
1. Project scaffolding: `package.json`, TypeScript config, ESLint, Prettier, Vitest setup.
2. Zod schemas for all data types (`src/schemas/`).
3. Config loader with validation (`src/core/config.ts`).
4. CLI skeleton with Commander: all 5 commands registered with `--help`, but only `init` implemented.
5. `seo init` command: copies scaffold files, generates `.gitignore`.
6. Logger with verbosity levels.

**Phase 2: Matrix Engine (Week 2-3)**
7. Keyword matrix expansion: cartesian product from config dimensions.
8. Filter rule engine (inclusion/exclusion).
9. CSV data source import.
10. Slug and URL generation (DR-08 compliance).
11. `--dry-run` flag implementation.
12. Unit tests for all matrix operations.

**Phase 3: Content Generation (Week 3-5)**
13. Nunjucks template engine setup with custom filters.
14. Static block rendering with variable interpolation.
15. Markdown-to-HTML processing.
16. AI provider abstraction + OpenAI implementation.
17. Anthropic provider implementation.
18. AI response caching.
19. Rate limiter / concurrency control.
20. Fallback logic (AI failure → template-only).
21. `seo build` command (basic: sequential, no images).

**Phase 4: Visual Assets (Week 5-6)**
22. Sharp-based image compositor.
23. SVG text overlay rendering.
24. Image optimization (WebP + PNG output).
25. Image template configuration.
26. Integration with build pipeline.

**Phase 5: Page Assembly (Week 6-7)**
27. Layout template rendering.
28. SEO metadata generation (meta tags, OG, Twitter).
29. JSON-LD structured data generation.
30. Internal linking engine.
31. Sitemap.xml and robots.txt generation.
32. Full `seo build` command with all stages.
33. `seo preview` command (static file server).

**Phase 6: Quality & Polish (Week 7-9)**
34. Build manifest and incremental build support.
35. Content uniqueness checker (Jaccard / MinHash).
36. Thin content detector.
37. Broken link checker.
38. Structured data validator.
39. `seo audit` command.
40. `seo export` command.
41. Build report generation.
42. Integration tests for all commands.
43. Cross-platform CI (macOS, Linux, Windows/WSL2).

### Testing Strategy

**Unit tests** (≥80% coverage target, NFR-012):
- Every pure function has unit tests: matrix expansion, slug generation, filter evaluation, hash computation, SVG generation.
- AI provider tests use mock HTTP responses (no real API calls in tests).
- Image generation tests use small fixture images and verify output dimensions/format.

**Integration tests** (NFR-013):
- One integration test per CLI command, operating on a reference project in `test/fixtures/`.
- `seo init` → verify directory structure and file contents.
- `seo build` → verify output HTML count, file sizes, meta tags presence.
- `seo build --dry-run` → verify no files created, correct count output.
- `seo build --incremental` → verify only changed pages rebuilt.
- `seo audit` → verify report format and detection of intentional issues.
- `seo preview` → verify server starts and responds to HTTP requests.
- `seo export` → verify output directory is self-contained.

**Snapshot tests** for generated HTML output — catch unintended changes in page structure.

### Key Technical Decisions

| Decision | Rationale | Alternative Considered |
|---|---|---|
| Nunjucks over Handlebars | Need conditionals, loops, filters, async rendering for content blocks. Handlebars is too restrictive. | Handlebars, EJS, Liquid |
| Direct `fetch` over AI SDKs | Smaller dependency surface. APIs are simple REST. SDKs add weight and version coupling. | `openai` npm package, `@anthropic-ai/sdk` |
| JSON file cache over SQLite | Zero binary dependency, human-inspectable, sufficient for MVP scale. | better-sqlite3 (upgrade path exists) |
| SVG text in Sharp over node-canvas | Sharp is a required dependency anyway. node-canvas requires system libraries (Cairo) that complicate installs on all platforms (NFR-014). | node-canvas, Puppeteer screenshot |
| Single package over monorepo | Solo dev project. Monorepo tooling (Turborepo, Nx) adds configuration overhead with no benefit until there are multiple publishable packages. | pnpm workspaces |
| Promise pool over worker threads | AI content generation (the bottleneck) is I/O-bound, not CPU-bound. Worker threads add complexity without improving I/O throughput. Image gen can use workers post-MVP if needed. | worker_threads, workerpool |
| MinHash for large-corpus uniqueness | Full pairwise Jaccard is O(n^2). At 50K pages, that's 1.25 billion comparisons. MinHash approximates with configurable accuracy in O(n). | Full pairwise (fine for <5K pages), simhash |

## 15. Technical Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | AI API costs spiral on large builds | Medium | High | AI response caching (most effective), `--dry-run` for cost estimation, default to cost-efficient models (`gpt-4o-mini`), configurable concurrency limit, per-block token limits. Build report shows API call count and cache hit rate. |
| 2 | AI rate limits cause build failures | High | Medium | Exponential backoff retry (NFR-009), concurrency limiter defaults to 5, graceful fallback to template-only rendering (PT-14). Users can reduce concurrency to 1 for strict rate-limited accounts. |
| 3 | Sharp installation fails on some platforms | Low | High | Sharp publishes prebuilt binaries for macOS, Linux, Windows. Failure is rare but possible on exotic architectures. Mitigation: clear error message with Sharp install troubleshooting link. Test CI on all three target platforms. |
| 4 | SVG text rendering has limited typography | Medium | Low | Sufficient for MVP (dynamic text overlays on hero images). For advanced typography, document the limitation and provide an escape hatch: users can pre-generate images externally and reference them as static assets. Post-MVP: optional node-canvas integration. |
| 5 | Memory exhaustion on 50K+ page builds | Low | High | Stream-process pages in batches (never hold all page content in memory). Matrix entries are small (~1KB each). Monitor with `process.memoryUsage()` in verbose mode. Log warnings if approaching 4GB. |
| 6 | Content uniqueness at scale is slow | Medium | Medium | Use MinHash approximation for corpora >5K pages. Full Jaccard for smaller sets. Uniqueness checking is post-build (audit command), not blocking the build pipeline. |
| 7 | AI-generated content quality is inconsistent | High | Medium | Content rules (min/max words, required keywords) catch obvious failures. Build report surfaces per-page quality scores. Users iterate on prompts via `--sample N`. No fully automated quality gate — human review is part of the workflow. |
| 8 | Template engine vulnerabilities (SSTI) | Low | Low | Nunjucks autoescaping is on by default. Users control their own templates and data — this is a local CLI tool, not a web service accepting untrusted input. Risk is minimal. |
| 9 | Breaking changes in AI provider APIs | Medium | Medium | Thin abstraction layer isolates provider-specific code to single files (`openai.ts`, `anthropic.ts`). API changes require updating one file, not the entire codebase. Pin API versions in request headers where supported. |
| 10 | Generated pages penalized by Google | Medium | High | This is a product risk, not a technical risk, but architecture mitigates it: uniqueness checking (FR-026), thin content detection (FR-027), content rules (FR-012), and AI-augmented differentiation (FR-010) are all first-class features specifically designed to prevent this outcome. Documentation should emphasize quality over quantity. |
