---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
inputDocuments: ['product-brief-seo-2026-03-18.md']
workflowType: 'prd'
---

# Product Requirements Document - seo

**Author:** Pete
**Date:** 2026-03-18

## Executive Summary

**seo** is a self-hosted, open-source CLI tool that generates conversion-focused SEO landing pages at scale. It replaces a $300-500/month stack of fragmented SaaS tools (SEOmatic, Surfer, Byword, Unbounce) with a single pipeline: keyword matrix in, deployment-ready static HTML out. The system targets solo developers, SaaS founders, affiliate marketers, and small agency teams who need hundreds to thousands of long-tail landing pages but lack the budget for enterprise tooling or the time for manual page creation.

The core differentiator is a unified pipeline that combines keyword matrix expansion, AI-augmented content generation, dynamic visual asset composition, and static site building with built-in SEO fundamentals (structured data, internal linking, sitemaps). No existing open-source tool covers this full pipeline. Most programmatic SEO implementations fail because they produce thin, templated pages that Google's Helpful Content updates demote. **seo** addresses this by generating genuinely differentiated content per page through AI augmentation and dynamic visual assets — not just keyword variable substitution.

Built in TypeScript on Node.js, the tool produces static HTML files deployable to any hosting platform (Netlify, Vercel, Cloudflare Pages, Apache/Nginx). Users provide their own API keys for AI content generation (OpenAI/Anthropic). Zero runtime dependencies, zero ongoing SaaS costs, full ownership of pipeline and output.

## Success Criteria

| ID | Criterion | Metric | Target | Measurement Method |
|---|---|---|---|---|
| SC-01 | Build speed | Pages generated per hour on consumer hardware (8GB RAM, 4-core CPU) | ≥100 pages/hour | Timed build runs on reference hardware |
| SC-02 | Content uniqueness | Jaccard similarity between sibling pages | ≤0.30 (≥70% unique) | Automated corpus analysis via `seo audit` |
| SC-03 | Time to first deployment | Duration from `git clone` to 100 pages deployed | ≤2 hours | End-to-end walkthrough timing with new user |
| SC-04 | Page performance | Google PageSpeed Insights mobile score | ≥90 | Lighthouse CI on sample output pages |
| SC-05 | Page weight | HTML file size before images | ≤50KB | Build report file size metrics |
| SC-06 | Adoption | GitHub stars within 6 months of launch | ≥500 | GitHub metrics |
| SC-07 | Active usage | Monthly active installations (opt-in telemetry) at 6 months | ≥100 | Telemetry dashboard |
| SC-08 | Scale validation | Pages generated across user base at 6 months | ≥50,000 | Aggregated telemetry |
| SC-09 | Real-world validation | Projects deploying 500+ pages within first month | ≥3 | Community tracking |

## Product Scope

### MVP Phase

Single CLI tool delivering the complete pipeline from keyword matrix to deployed static pages:

- Keyword matrix definition (YAML/JSON) with cartesian product generation and filtering
- CSV import for spreadsheet-based keyword workflows
- Block-based content templates (Markdown/HTML) with variable interpolation
- AI content generation via OpenAI and Anthropic APIs for per-page differentiated copy
- Dynamic visual asset generation (hero images, comparison graphics) with text overlays
- Static HTML output with meta tags, Open Graph, JSON-LD structured data, canonical URLs, sitemap.xml, robots.txt
- Automatic internal linking between related pages
- Quality assurance: uniqueness checking, thin content detection, broken link checking, build report
- CLI commands: `init`, `build`, `preview`, `audit`, `export`
- English-only, CLI-only, self-hosted only

### Growth Phase

- Web-based project management UI
- Direct CMS publishing integrations (WordPress, Webflow, Shopify, Ghost)
- Keyword research API integrations (SEMrush, Ahrefs, Google Keyword Planner)
- Google Search Console feedback loop for performance-based template refinement
- Community template marketplace
- Multi-language page generation with locale-aware templates

### Vision Phase

- Built-in A/B testing for content variations
- Automated content refresh based on SERP changes
- Generative Engine Optimization (GEO) for AI search engines
- Enterprise features: team collaboration, approval workflows, brand guideline enforcement
- Become the default open-source infrastructure for programmatic SEO

## User Journeys

### UJ-01: First-Time Setup (Marcus — Solo SaaS Founder)

1. User discovers the project on GitHub and clones the repository
2. User runs `npm install -g seo` to install the CLI globally
3. User runs `seo init my-project` to scaffold a new project with example configuration, templates, and sample data
4. User inspects the generated project structure: `config.yaml`, `templates/`, `data/`, `assets/`
5. User runs `seo build` on the example project to generate 10 sample pages
6. User runs `seo preview` to launch a local server and inspect the generated pages in a browser
7. User confirms pages include proper meta tags, structured data, and internal links

**Traces to:** SC-03, FR-001, FR-002, FR-025, FR-026, FR-027

### UJ-02: Keyword Matrix Configuration

1. User opens `config.yaml` and defines head terms (e.g., "inventory management software")
2. User adds modifier dimensions: industries (50 values), use cases (40 values)
3. User defines keyword pattern: "{head_term} for {industry} {use_case}"
4. User adds filtering rules to exclude nonsensical combinations (e.g., "inventory software for restaurants cold storage tracking" is valid; "inventory software for restaurants yacht management" is excluded)
5. User runs `seo build --dry-run` to preview the keyword matrix: 1,847 valid combinations after filtering
6. User reviews the matrix output and adjusts filters

**Traces to:** SC-01, FR-003, FR-004, FR-005, FR-006, FR-007

### UJ-03: Content Template Design

1. User creates a landing page template with block sections: hero, features, comparison table, FAQ, CTA
2. User adds variable interpolation markers: `{{industry}}`, `{{use_case}}`, `{{head_term}}`
3. User configures AI content blocks with prompt templates that reference matrix variables, requesting unique paragraph-level content per page
4. User sets per-block content rules: minimum word count, required keywords, tone guidance
5. User runs `seo build --sample 5` to generate 5 test pages and review content quality
6. User iterates on prompts and template structure based on output quality

**Traces to:** SC-02, FR-008, FR-009, FR-010, FR-011, FR-012

### UJ-04: Visual Asset Generation

1. User places base template images in the `assets/` directory (hero backgrounds, product photos)
2. User configures visual asset templates: text overlay positions, font styles, dynamic data fields
3. User maps product images from a local asset library to keyword matrix entries
4. User runs `seo build --sample 3` and inspects generated images: unique hero images per page with dynamic text overlays
5. User verifies images are output as optimized WebP with PNG fallback

**Traces to:** FR-013, FR-014, FR-015, FR-016

### UJ-05: Full Build and Quality Review

1. User runs `seo build` to generate the full corpus (1,847 pages)
2. Build completes and outputs a summary: pages generated, build time, warnings
3. User runs `seo audit` to execute the quality assurance pipeline
4. Audit report shows: content uniqueness scores per page, thin content flags (12 pages below threshold), 0 broken internal links, overall corpus quality score
5. User reviews flagged pages, adjusts templates or filters, and rebuilds affected pages
6. User runs `seo audit` again to confirm all pages pass quality thresholds

**Traces to:** SC-01, SC-02, FR-017, FR-018, FR-019, FR-020, FR-021

### UJ-06: Deployment

1. User runs `seo export --output ./dist` to produce deployment-ready output
2. Export includes all HTML pages, assets, sitemap.xml, and robots.txt in a flat directory structure
3. User deploys the `./dist` directory to Netlify/Vercel/Cloudflare Pages via their standard deployment method
4. All pages are live and accessible at their canonical URLs
5. User submits sitemap.xml to Google Search Console

**Traces to:** SC-04, SC-05, FR-022, FR-023, FR-024

### UJ-07: Iteration Based on Results

1. User returns after 4 weeks with GSC data showing indexation and ranking performance
2. User imports a CSV of new keyword variations to expand the matrix
3. User adjusts content templates to improve underperforming page segments
4. User runs `seo build --incremental` to rebuild only changed or new pages
5. User runs `seo audit` to validate the expanded corpus
6. User redeploys

**Traces to:** SC-09, FR-005, FR-028, FR-029

### UJ-08: Agency Multi-Client Workflow (Priya)

1. User runs `seo init client-plumber` to scaffold a project for a plumbing client
2. User imports 500 city names from CSV and defines the pattern: "plumber in {city}"
3. User creates service-specific content templates with AI-augmented local content (city-specific details)
4. User runs `seo build` and `seo audit` to generate and validate 500 pages
5. User repeats for the next client with a different template and keyword set
6. Each client project is an independent directory with its own config

**Traces to:** SC-03, FR-001, FR-005, FR-008

## Domain Requirements

### SEO Compliance

- DR-01: All generated pages must include valid JSON-LD structured data conforming to Schema.org vocabulary. Validation: passes Google Rich Results Test.
- DR-02: All generated pages must include canonical URL meta tags pointing to the definitive URL for that page. No duplicate canonical references across the corpus.
- DR-03: Generated sitemap.xml must conform to the Sitemaps Protocol 0.9 specification and include all generated page URLs with lastmod dates.
- DR-04: Generated robots.txt must be valid per the Robots Exclusion Protocol and reference the sitemap location.
- DR-05: Pages must not trigger Google's "thin content" classification. Enforced via minimum content thresholds in the QA pipeline: ≥300 words of body text per page, ≥70% uniqueness vs. sibling pages.
- DR-06: All generated pages must be valid HTML5. Validation: no errors from W3C Nu HTML Checker on sample output.
- DR-07: All generated images must include descriptive `alt` attributes derived from keyword/product data.
- DR-08: Page URLs must follow SEO best practices: lowercase, hyphen-separated, no parameters, ≤75 characters for the path segment.

### Core Web Vitals

- DR-09: Generated pages must achieve Largest Contentful Paint (LCP) ≤2.5 seconds on mobile 4G. Measured via Lighthouse.
- DR-10: Generated pages must achieve Cumulative Layout Shift (CLS) ≤0.1. Measured via Lighthouse.
- DR-11: Generated pages must achieve Interaction to Next Paint (INP) ≤200ms (or N/A for static pages with minimal JavaScript). Measured via Lighthouse.

### Structured Data

- DR-12: Structured data must support at minimum: Product, FAQPage, BreadcrumbList, and WebPage Schema.org types.
- DR-13: Structured data output must be configurable per template — users select which schema types apply to each page template.

## Innovation Analysis

### Competitive Positioning

| Capability | seo | SEOmatic | Byword | Surfer | DIY Stack |
|---|---|---|---|---|---|
| Self-hosted / open-source | Yes | No | No | No | Partial |
| Keyword matrix engine | Yes | Limited | No | No | Manual |
| AI content differentiation | Yes | Basic | Yes | No | Manual |
| Visual asset generation | Yes | No | No | No | No |
| Structured data (JSON-LD) | Yes | Yes | No | No | Manual |
| Internal linking engine | Yes | No | Yes | No | No |
| QA pipeline (uniqueness, thin content) | Yes | No | No | Partial | No |
| Static output / deploy anywhere | Yes | No | No | N/A | Partial |
| Monthly cost | $0 | $41-200+ | $99-1999 | $99-219 | $50-150 |

### Unique Value

1. **Only tool combining visual asset generation with programmatic SEO.** No competitor generates page-specific images as part of the build pipeline. This addresses both ranking factors (image SEO) and conversion (visual trust signals).
2. **Only open-source end-to-end pSEO pipeline.** Existing OSS tools cover fragments (auditing, rank tracking). None cover keyword matrix to deployed page.
3. **QA pipeline as a first-class feature.** Built-in content uniqueness and thin content detection prevents the #1 failure mode of programmatic SEO before pages go live.

## Project-Type Requirements

### CLI Tool Requirements

- PT-01: The tool must operate entirely via command-line interface with no GUI dependency.
- PT-02: All commands must support `--help` flags with usage documentation.
- PT-03: All commands must support `--verbose` and `--quiet` output modes.
- PT-04: Exit codes must follow convention: 0 for success, 1 for general errors, 2 for usage errors.
- PT-05: Configuration must be file-based (YAML primary, JSON supported) — no interactive configuration wizards required for operation.
- PT-06: The tool must work on macOS, Linux, and Windows (WSL2 at minimum).

### Static Site Generator Requirements

- PT-07: Output must be self-contained static files requiring no server-side runtime.
- PT-08: Output directory structure must be configurable (flat vs. nested paths).
- PT-09: The preview server must be a lightweight built-in HTTP server for local development only, not production use.
- PT-10: Incremental builds must only regenerate pages whose inputs (template, data, config) have changed.

### API-Consuming Application Requirements

- PT-11: API keys (OpenAI, Anthropic) must be configured via environment variables or a local `.env` file, never committed to version control.
- PT-12: AI API calls must implement retry logic with exponential backoff for rate limiting and transient failures.
- PT-13: AI API calls must be parallelizable with configurable concurrency limits to manage costs and rate limits.
- PT-14: Builds must complete successfully (with degraded content) if AI APIs are unavailable — AI content blocks fall back to template-only variable interpolation.

## Functional Requirements

### Keyword Matrix Engine

**FR-001: Project Scaffolding**
Users can scaffold a new project via `seo init <name>`, producing a working directory with example config, templates, data files, and asset directory.
- Priority: Must
- Test Criteria: Running `seo init test-project` creates a directory containing `config.yaml`, `templates/`, `data/`, and `assets/` directories with example files. Running `seo build` in that directory produces ≥1 valid HTML page.
- Traces to: UJ-01, UJ-08, SC-03

**FR-002: Example Project**
The scaffolded project includes a complete working example (keyword matrix, template, sample data) that generates 5-10 pages demonstrating all features.
- Priority: Must
- Test Criteria: `seo init` followed by `seo build` produces 5-10 HTML pages with structured data, meta tags, internal links, and at least 1 generated image per page.
- Traces to: UJ-01, SC-03

**FR-003: Keyword Matrix Definition**
Users can define keyword matrices in YAML or JSON with head terms, modifier dimensions, and combination patterns.
- Priority: Must
- Test Criteria: A config file with 3 head terms and 2 modifier dimensions (5 values each) produces 75 keyword combinations (3 x 5 x 5). Output matches expected combinations exactly.
- Traces to: UJ-02, SC-01

**FR-004: Keyword Pattern Templates**
Users can define URL and title patterns using matrix variables (e.g., `{head_term}-for-{industry}-{use_case}`).
- Priority: Must
- Test Criteria: Pattern `{head}-for-{mod1}` with head=["a","b"] and mod1=["x","y"] produces URLs: a-for-x, a-for-y, b-for-x, b-for-y.
- Traces to: UJ-02

**FR-005: CSV Import**
Users can import keyword data from CSV files, mapping columns to matrix dimensions.
- Priority: Must
- Test Criteria: A CSV with 100 rows and 3 columns imports successfully. Column mapping produces the same keyword combinations as equivalent YAML config.
- Traces to: UJ-02, UJ-07, UJ-08

**FR-006: Combination Filtering**
Users can define inclusion and exclusion rules to filter out invalid keyword combinations.
- Priority: Must
- Test Criteria: A matrix producing 100 raw combinations with an exclusion rule matching 15 combinations outputs exactly 85 pages. Excluded combinations appear in the build log.
- Traces to: UJ-02

**FR-007: Dry Run**
Users can run `seo build --dry-run` to preview the keyword matrix and page count without generating pages or calling APIs.
- Priority: Must
- Test Criteria: `--dry-run` outputs the full list of page URLs and total count. No HTML files are created. No API calls are made. Execution completes in <5 seconds for 10,000 combinations.
- Traces to: UJ-02

### Content Template System

**FR-008: Block-Based Templates**
Users can create page templates composed of named content blocks (hero, features, comparison, FAQ, CTA, custom blocks).
- Priority: Must
- Test Criteria: A template with 5 named blocks produces HTML output containing all 5 sections in order. Blocks are independently addressable in config.
- Traces to: UJ-03, UJ-08, SC-02

**FR-009: Variable Interpolation**
Templates support variable interpolation from keyword matrix data, external data sources (JSON/CSV), and computed fields.
- Priority: Must
- Test Criteria: A template with `{{industry}}` and `{{use_case}}` variables renders the correct values from the keyword matrix on every generated page. No unresolved `{{...}}` markers in output.
- Traces to: UJ-03

**FR-010: AI Content Generation**
Users can designate template blocks for AI content generation with prompt templates that reference matrix variables and data fields.
- Priority: Must
- Test Criteria: A template with 1 AI-generated block produces unique text content per page. Pairwise Jaccard similarity between any 10 sampled pages' AI blocks is ≤0.30.
- Traces to: UJ-03, SC-02

**FR-011: Multi-Provider AI Support**
Users can configure AI content generation to use OpenAI or Anthropic APIs, specifying model, temperature, and max tokens per block.
- Priority: Must
- Test Criteria: Building with `provider: openai` and `provider: anthropic` in config both produce valid AI-generated content. Switching providers requires only a config change.
- Traces to: UJ-03

**FR-012: Content Rules**
Users can set per-block content rules: minimum word count, maximum word count, required keywords, and tone/style guidance passed to AI prompts.
- Priority: Should
- Test Criteria: A block with `min_words: 150` flags or regenerates any output below 150 words. A block with `required_keywords: ["inventory", "management"]` includes both terms in output.
- Traces to: UJ-03, SC-02

**FR-013: Template Formats**
Users can write templates in Markdown or HTML format.
- Priority: Must
- Test Criteria: A Markdown template and an equivalent HTML template both produce valid HTML output pages. Markdown templates are converted to HTML during build.
- Traces to: UJ-03

### Dynamic Visual Asset Generator

**FR-014: Image Template Composition**
Users can define image templates with base images, text overlay zones, and dynamic data fields.
- Priority: Must
- Test Criteria: An image template with 1 base image and 2 text overlay zones produces a unique output image per page with correct text rendered in each zone.
- Traces to: UJ-04

**FR-015: Dynamic Text Overlays**
Generated images include text overlays populated from keyword matrix and data fields with configurable font, size, color, and position.
- Priority: Must
- Test Criteria: An image for keyword "inventory software for restaurants" renders "restaurants" in the specified font, size, and position. Text is legible (no clipping, no overflow).
- Traces to: UJ-04

**FR-016: Optimized Image Output**
Generated images are output in WebP format with PNG fallback, optimized for web delivery.
- Priority: Must
- Test Criteria: Each generated image exists in WebP format. File size is ≤200KB for a 1200x630 hero image. PNG fallback is generated alongside WebP.
- Traces to: UJ-04, SC-05

**FR-017: Product Image Integration**
Users can map product images from a local asset library to keyword matrix entries for inclusion in generated pages and visual assets.
- Priority: Should
- Test Criteria: A mapping of 10 product images to 10 keyword entries produces pages and visual assets that include the correct product image per page.
- Traces to: UJ-04

### Static Site Builder

**FR-018: Static HTML Generation**
The build process produces self-contained static HTML pages from templates and data, requiring no server-side runtime.
- Priority: Must
- Test Criteria: Generated pages open correctly in a browser directly from the filesystem (file:// protocol) with all content visible. No JavaScript required for core content rendering.
- Traces to: UJ-05, UJ-06, SC-04

**FR-019: SEO Meta Tags**
Every generated page includes: title tag, meta description, canonical URL, Open Graph tags (og:title, og:description, og:image, og:url), and Twitter Card tags.
- Priority: Must
- Test Criteria: HTML output for any generated page contains all 7 meta tag types. Values are populated from keyword/template data, not empty.
- Traces to: UJ-01, DR-01, DR-02

**FR-020: JSON-LD Structured Data**
Every generated page includes valid JSON-LD structured data with user-configurable Schema.org types (Product, FAQPage, BreadcrumbList, WebPage at minimum).
- Priority: Must
- Test Criteria: JSON-LD block in output HTML passes Google Rich Results Test. Schema types match template configuration.
- Traces to: DR-01, DR-12, DR-13

**FR-021: Sitemap Generation**
The build produces a valid sitemap.xml containing all generated page URLs with lastmod dates.
- Priority: Must
- Test Criteria: sitemap.xml validates against Sitemaps Protocol 0.9. URL count matches generated page count. lastmod dates are present.
- Traces to: DR-03, UJ-06

**FR-022: Robots.txt Generation**
The build produces a robots.txt file referencing the sitemap location.
- Priority: Must
- Test Criteria: robots.txt contains `Sitemap:` directive pointing to sitemap.xml. File validates against Robots Exclusion Protocol.
- Traces to: DR-04, UJ-06

**FR-023: Internal Linking Engine**
The build automatically generates internal links between related pages based on shared keyword dimensions.
- Priority: Must
- Test Criteria: A page for "inventory software for restaurants" links to ≥3 sibling pages (e.g., other industries, other use cases). No broken internal links in the corpus. Link anchor text is descriptive (not "click here").
- Traces to: UJ-01, UJ-05, SC-02

**FR-024: Responsive HTML Output**
Generated pages render correctly on viewports from 320px to 1920px width without horizontal scrolling.
- Priority: Must
- Test Criteria: Pages pass Lighthouse accessibility audit with no viewport-related failures. Manual spot-check at 320px, 768px, and 1920px widths.
- Traces to: SC-04, DR-09

**FR-025: SEO-Friendly URLs**
Generated page URLs are lowercase, hyphen-separated, parameter-free, and ≤75 characters for the path segment.
- Priority: Must
- Test Criteria: No generated URL contains uppercase letters, underscores, query parameters, or a path segment exceeding 75 characters.
- Traces to: DR-08

### Quality Assurance Pipeline

**FR-026: Content Uniqueness Checker**
`seo audit` calculates pairwise content similarity across the generated corpus and flags pages exceeding the similarity threshold (default: Jaccard similarity >0.30).
- Priority: Must
- Test Criteria: A corpus with 2 intentionally duplicate pages flags both with similarity >0.90. A corpus with properly differentiated pages shows average similarity ≤0.30.
- Traces to: UJ-05, SC-02

**FR-027: Thin Content Detector**
`seo audit` flags pages with body text below a configurable word count threshold (default: 300 words).
- Priority: Must
- Test Criteria: A page with 250 words of body text is flagged. A page with 350 words passes. Threshold is configurable in config.
- Traces to: UJ-05, DR-05

**FR-028: Broken Link Checker**
`seo audit` checks all internal links in the generated corpus and reports any that point to non-existent pages.
- Priority: Must
- Test Criteria: A corpus with 1 intentionally broken internal link reports that link with source page, target URL, and link text. A corpus with all valid links reports 0 broken links.
- Traces to: UJ-05

**FR-029: Build Report**
`seo build` and `seo audit` produce a structured report (JSON and human-readable) with: total pages, build time, per-page quality scores, warnings, and errors.
- Priority: Must
- Test Criteria: Report includes all listed fields. JSON report is parseable. Human-readable report renders cleanly in terminal. Report file is written to the output directory.
- Traces to: UJ-05

**FR-030: Structured Data Validation**
`seo audit` validates JSON-LD structured data on each page against Schema.org vocabulary.
- Priority: Should
- Test Criteria: A page with invalid JSON-LD (missing required field) is flagged with the specific validation error. A page with valid JSON-LD passes.
- Traces to: DR-01, DR-12

### CLI Interface

**FR-031: Init Command**
`seo init <name>` creates a new project directory with scaffolded config, templates, and example data.
- Priority: Must
- Test Criteria: Creates directory `<name>/` with config.yaml, templates/, data/, assets/. Exits with code 0 on success, code 1 if directory exists.
- Traces to: UJ-01, FR-001

**FR-032: Build Command**
`seo build` generates all pages for the current project. Supports flags: `--dry-run`, `--sample <n>`, `--incremental`, `--output <dir>`.
- Priority: Must
- Test Criteria: `seo build` generates pages equal to keyword matrix count. `--sample 5` generates exactly 5 pages. `--incremental` skips unchanged pages. `--output ./custom` writes to specified directory. Each flag works independently and in combination.
- Traces to: UJ-02, UJ-03, UJ-05, UJ-07

**FR-033: Preview Command**
`seo preview` launches a local HTTP server serving the generated output directory.
- Priority: Must
- Test Criteria: Server starts on a configurable port (default: 3000). Pages are accessible via browser at `http://localhost:<port>/<page-url>`. Server exits cleanly on Ctrl+C.
- Traces to: UJ-01

**FR-034: Audit Command**
`seo audit` runs the full quality assurance pipeline and outputs the report.
- Priority: Must
- Test Criteria: Executes uniqueness, thin content, broken link, and structured data checks. Exits with code 0 if all checks pass, code 1 if any warnings/errors. Report is printed to stdout and saved to file.
- Traces to: UJ-05, UJ-07

**FR-035: Export Command**
`seo export --output <dir>` copies the built site to the specified directory in a deployment-ready structure.
- Priority: Must
- Test Criteria: Output directory contains all HTML files, assets, sitemap.xml, and robots.txt. Directory is self-contained (no symlinks or external references).
- Traces to: UJ-06

**FR-036: Global Help and Version**
All commands support `--help`. The root command supports `--version`.
- Priority: Must
- Test Criteria: `seo --help` lists all commands with descriptions. `seo build --help` shows all flags for the build command. `seo --version` prints the semantic version.
- Traces to: PT-02

**FR-037: Output Verbosity**
All commands support `--verbose` (detailed logging) and `--quiet` (errors only) flags.
- Priority: Should
- Test Criteria: `--verbose` produces ≥3x the log lines of default mode. `--quiet` produces 0 lines on successful execution.
- Traces to: PT-03

**FR-038: Incremental Builds**
`seo build --incremental` detects changed inputs (templates, data, config) and regenerates only affected pages.
- Priority: Should
- Test Criteria: After modifying 1 template affecting 50 pages in a 1,000-page corpus, incremental build regenerates exactly 50 pages. Build time is ≤20% of a full build.
- Traces to: UJ-07, PT-10

### Configuration and Data Management

**FR-039: YAML and JSON Configuration**
The system reads project configuration from YAML (primary) and JSON formats.
- Priority: Must
- Test Criteria: Identical configurations in YAML and JSON produce identical build output.
- Traces to: PT-05

**FR-040: Environment Variable API Keys**
AI API keys are read from environment variables or a local `.env` file.
- Priority: Must
- Test Criteria: Setting `OPENAI_API_KEY` as an environment variable enables AI generation. A `.env` file with the same variable also works. `.env` is listed in the default `.gitignore`.
- Traces to: PT-11

**FR-041: Graceful AI Degradation**
Builds complete successfully when AI APIs are unavailable, falling back to template-only variable interpolation for AI-designated blocks.
- Priority: Must
- Test Criteria: With an invalid API key, `seo build` completes with warnings (not errors). AI blocks render with interpolated variables only. Exit code is 0.
- Traces to: PT-14

## Non-Functional Requirements

### Performance

**NFR-001:** The system shall generate ≥100 pages per hour on consumer hardware (4-core CPU, 8GB RAM) as measured by timed full build runs with AI content generation enabled and default API concurrency.

**NFR-002:** The system shall complete a dry-run matrix expansion of 10,000 keyword combinations in ≤5 seconds as measured by CLI execution timing.

**NFR-003:** The system shall produce HTML pages with a total file size (excluding images) of ≤50KB per page as measured by build report file size metrics.

**NFR-004:** Generated pages shall achieve a Google Lighthouse performance score of ≥90 on mobile as measured by Lighthouse CI against 10 randomly sampled output pages.

### Scalability

**NFR-005:** The system shall handle keyword matrices producing up to 50,000 page combinations without crashing or exceeding 4GB peak memory as measured by process monitoring during build.

**NFR-006:** The system shall support incremental builds that scale sub-linearly — rebuilding 5% of a 10,000-page corpus shall complete in ≤10% of full build time as measured by comparative build timing.

### Reliability

**NFR-007:** The system shall complete builds successfully (exit code 0) when AI APIs are unavailable, producing degraded but valid output, as verified by build runs with intentionally invalid API credentials.

**NFR-008:** The system shall resume interrupted builds by detecting previously generated pages and skipping them, as verified by killing and restarting a build mid-execution.

**NFR-009:** AI API calls shall implement retry with exponential backoff (3 retries, 1s/2s/4s delays) for HTTP 429 and 5xx responses, as verified by mock API testing with injected failures.

### Security

**NFR-010:** The system shall never write API keys or credentials to generated output files, build reports, or log files, as verified by searching all output artifacts for known API key patterns.

**NFR-011:** The system shall read secrets exclusively from environment variables or `.env` files (never from committed config files), as verified by config schema validation rejecting inline API keys.

### Maintainability

**NFR-012:** The codebase shall maintain ≥80% line coverage from automated tests as measured by the test coverage tool on every CI run.

**NFR-013:** All CLI commands shall have corresponding integration tests that verify end-to-end behavior (init, build, preview, audit, export) as measured by test suite execution against a reference project.

### Portability

**NFR-014:** The system shall run on macOS (12+), Ubuntu Linux (20.04+), and Windows via WSL2 as verified by CI builds on all three platforms.

**NFR-015:** The system shall require only Node.js (v18+) as a runtime dependency, with all other dependencies installable via npm, as verified by clean installation on a fresh Node.js environment.

### Accessibility

**NFR-016:** Generated HTML pages shall conform to WCAG 2.1 Level AA for all programmatically determinable content (headings hierarchy, image alt text, color contrast, semantic HTML) as measured by axe-core automated audit with 0 violations on sample pages.
