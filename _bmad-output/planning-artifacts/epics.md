---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['prd.md', 'architecture.md']
---

# seo - Epic Breakdown

## Overview

This breakdown organizes all PRD requirements into 11 epics following the architecture's build pipeline order. Each epic represents a cohesive vertical slice of functionality that can be developed and tested independently. The progression starts with foundational infrastructure (CLI, config) and builds upward through the data pipeline (keyword matrix, content, images) to the output layer (HTML generation, SEO, linking) and quality/deployment concerns. Stories are sized at 1-3 hours of dev work each. Every functional requirement (FR-001 through FR-041), non-functional requirement (NFR-001 through NFR-016), and domain requirement (DR-01 through DR-13) is mapped to at least one story.

## Requirements Inventory

### Functional Requirements

- FR-001: Project Scaffolding
- FR-002: Example Project
- FR-003: Keyword Matrix Definition
- FR-004: Keyword Pattern Templates
- FR-005: CSV Import
- FR-006: Combination Filtering
- FR-007: Dry Run
- FR-008: Block-Based Templates
- FR-009: Variable Interpolation
- FR-010: AI Content Generation
- FR-011: Multi-Provider AI Support
- FR-012: Content Rules
- FR-013: Template Formats
- FR-014: Image Template Composition
- FR-015: Dynamic Text Overlays
- FR-016: Optimized Image Output
- FR-017: Product Image Integration
- FR-018: Static HTML Generation
- FR-019: SEO Meta Tags
- FR-020: JSON-LD Structured Data
- FR-021: Sitemap Generation
- FR-022: Robots.txt Generation
- FR-023: Internal Linking Engine
- FR-024: Responsive HTML Output
- FR-025: SEO-Friendly URLs
- FR-026: Content Uniqueness Checker
- FR-027: Thin Content Detector
- FR-028: Broken Link Checker
- FR-029: Build Report
- FR-030: Structured Data Validation
- FR-031: Init Command
- FR-032: Build Command
- FR-033: Preview Command
- FR-034: Audit Command
- FR-035: Export Command
- FR-036: Global Help and Version
- FR-037: Output Verbosity
- FR-038: Incremental Builds
- FR-039: YAML and JSON Configuration
- FR-040: Environment Variable API Keys
- FR-041: Graceful AI Degradation

### Non-Functional Requirements

- NFR-001: Generate >=100 pages/hour on consumer hardware
- NFR-002: Dry-run matrix expansion of 10,000 combinations in <=5 seconds
- NFR-003: HTML page file size <=50KB (excluding images)
- NFR-004: Lighthouse performance score >=90 on mobile
- NFR-005: Handle 50,000 page combinations without exceeding 4GB memory
- NFR-006: Incremental builds scale sub-linearly
- NFR-007: Builds complete when AI APIs unavailable
- NFR-008: Resume interrupted builds
- NFR-009: AI API retry with exponential backoff
- NFR-010: Never write API keys to output files
- NFR-011: Secrets from env vars or .env only
- NFR-012: >=80% line coverage from automated tests
- NFR-013: Integration tests for all CLI commands
- NFR-014: Run on macOS, Linux, and Windows/WSL2
- NFR-015: Require only Node.js 18+ as runtime dependency
- NFR-016: WCAG 2.1 Level AA conformance for generated pages

### Domain Requirements

- DR-01: Valid JSON-LD structured data conforming to Schema.org
- DR-02: Canonical URL meta tags with no duplicates
- DR-03: Sitemap.xml conforming to Sitemaps Protocol 0.9
- DR-04: Valid robots.txt per Robots Exclusion Protocol
- DR-05: No thin content — >=300 words body text, >=70% uniqueness
- DR-06: Valid HTML5 output
- DR-07: Descriptive alt attributes on all images
- DR-08: SEO-friendly URLs: lowercase, hyphen-separated, no params, <=75 chars
- DR-09: LCP <=2.5 seconds on mobile 4G
- DR-10: CLS <=0.1
- DR-11: INP <=200ms
- DR-12: Support Product, FAQPage, BreadcrumbList, WebPage schema types
- DR-13: Configurable schema types per template

### FR Coverage Map

| FR | Epic | Stories |
|---|---|---|
| FR-001 | Epic 1 | 1.3, 1.4 |
| FR-002 | Epic 1 | 1.4 |
| FR-003 | Epic 3 | 3.1 |
| FR-004 | Epic 3 | 3.2 |
| FR-005 | Epic 3 | 3.3 |
| FR-006 | Epic 3 | 3.4 |
| FR-007 | Epic 3 | 3.5 |
| FR-008 | Epic 4 | 4.1 |
| FR-009 | Epic 4 | 4.2 |
| FR-010 | Epic 5 | 5.1, 5.2 |
| FR-011 | Epic 5 | 5.3 |
| FR-012 | Epic 4 | 4.4 |
| FR-013 | Epic 4 | 4.3 |
| FR-014 | Epic 6 | 6.1 |
| FR-015 | Epic 6 | 6.2 |
| FR-016 | Epic 6 | 6.3 |
| FR-017 | Epic 6 | 6.4 |
| FR-018 | Epic 7 | 7.1 |
| FR-019 | Epic 7 | 7.2 |
| FR-020 | Epic 7 | 7.3 |
| FR-021 | Epic 7 | 7.5 |
| FR-022 | Epic 7 | 7.5 |
| FR-023 | Epic 8 | 8.1, 8.2 |
| FR-024 | Epic 7 | 7.4 |
| FR-025 | Epic 3 | 3.2 |
| FR-026 | Epic 9 | 9.1 |
| FR-027 | Epic 9 | 9.2 |
| FR-028 | Epic 9 | 9.3 |
| FR-029 | Epic 9 | 9.4 |
| FR-030 | Epic 9 | 9.5 |
| FR-031 | Epic 1 | 1.3 |
| FR-032 | Epic 1 | 1.5 |
| FR-033 | Epic 11 | 11.2 |
| FR-034 | Epic 9 | 9.4 |
| FR-035 | Epic 11 | 11.1 |
| FR-036 | Epic 1 | 1.2 |
| FR-037 | Epic 1 | 1.2 |
| FR-038 | Epic 10 | 10.3 |
| FR-039 | Epic 2 | 2.1 |
| FR-040 | Epic 2 | 2.3 |
| FR-041 | Epic 5 | 5.4 |

### NFR Coverage Map

| NFR | Epic | Stories |
|---|---|---|
| NFR-001 | Epic 10 | 10.1 |
| NFR-002 | Epic 3 | 3.5 |
| NFR-003 | Epic 7 | 7.4 |
| NFR-004 | Epic 7 | 7.4 |
| NFR-005 | Epic 10 | 10.1 |
| NFR-006 | Epic 10 | 10.3 |
| NFR-007 | Epic 5 | 5.4 |
| NFR-008 | Epic 10 | 10.4 |
| NFR-009 | Epic 5 | 5.5 |
| NFR-010 | Epic 2 | 2.3 |
| NFR-011 | Epic 2 | 2.3 |
| NFR-012 | Epic 10 | 10.5 |
| NFR-013 | Epic 10 | 10.5 |
| NFR-014 | Epic 10 | 10.5 |
| NFR-015 | Epic 1 | 1.1 |
| NFR-016 | Epic 7 | 7.4 |

### DR Coverage Map

| DR | Epic | Stories |
|---|---|---|
| DR-01 | Epic 7 | 7.3 |
| DR-02 | Epic 7 | 7.2 |
| DR-03 | Epic 7 | 7.5 |
| DR-04 | Epic 7 | 7.5 |
| DR-05 | Epic 9 | 9.1, 9.2 |
| DR-06 | Epic 7 | 7.1 |
| DR-07 | Epic 6 | 6.2 |
| DR-08 | Epic 3 | 3.2 |
| DR-09 | Epic 7 | 7.4 |
| DR-10 | Epic 7 | 7.4 |
| DR-11 | Epic 7 | 7.4 |
| DR-12 | Epic 7 | 7.3 |
| DR-13 | Epic 7 | 7.3 |

## Epic List

1. **Project Scaffolding & CLI Foundation** — Establish the CLI tool entry point, command structure, and project initialization.
2. **Configuration & Data Validation** — Config file loading, schema validation, environment variable handling.
3. **Keyword Matrix Engine** — Matrix definition, cartesian expansion, filtering, CSV import, URL/slug generation.
4. **Content Template System** — Block-based templates, variable interpolation, Markdown support, content rules.
5. **AI Content Generation** — Provider abstraction, OpenAI/Anthropic integration, caching, graceful degradation.
6. **Visual Asset Pipeline** — Image template composition, text overlays, optimization, product image mapping.
7. **Static Site Builder** — HTML generation, SEO meta tags, structured data, sitemap, robots.txt, responsive output.
8. **Internal Linking Engine** — Shared-dimension link computation and anchor text generation.
9. **Quality Assurance Pipeline** — Uniqueness checking, thin content detection, broken links, structured data validation, reporting.
10. **Build Pipeline & Performance** — Parallel processing, caching, incremental builds, interrupted build recovery, test infrastructure.
11. **Export & Deployment** — Export command, preview server, deployment-ready output.

---

## Epic 1: Project Scaffolding & CLI Foundation

Establish the CLI tool skeleton with Commander.js, implement the command routing structure, project initialization, and the example project that proves the end-to-end pipeline.

### Story 1.1: Initialize TypeScript Project with CLI Entry Point

As a developer, I want a properly configured TypeScript project with a CLI entry point, so that I can run `seo` as a global command.

**Acceptance Criteria:**

**Given** the repository is cloned and dependencies are installed
**When** the CLI entry point is executed
**Then** a help message is displayed listing available commands
**And** the project compiles with TypeScript strict mode without errors
**And** the package.json bin field maps `seo` to the compiled entry point

**Priority:** Must
**Technical Notes:** See Architecture Section 2 (Technology Stack — TypeScript, Commander.js, tsup, pnpm), Section 5 (Directory Structure — src/cli/index.ts)
**Dependencies:** None
**Traces to:** NFR-015, PT-01

### Story 1.2: Implement Global Flags and Help System

As a user, I want `--help`, `--version`, `--verbose`, and `--quiet` flags available on all commands, so that I can discover usage and control output detail.

**Acceptance Criteria:**

**Given** the CLI is installed
**When** I run `seo --help`
**Then** all available commands are listed with descriptions
**And** running `seo --version` prints the semantic version string
**And** running `seo build --help` shows all flags for the build command

**Given** any command is run with `--verbose`
**When** the command executes
**Then** detailed debug logging is output (>=3x the lines of default mode)

**Given** any command is run with `--quiet`
**When** the command succeeds
**Then** zero lines are printed to stdout

**Priority:** Must
**Technical Notes:** See Architecture Section 2 (Logging — custom lightweight logger with three levels), Section 5 (src/cli/logger.ts)
**Dependencies:** Story 1.1
**Traces to:** FR-036, FR-037, PT-02, PT-03

### Story 1.3: Implement Init Command with Project Scaffolding

As a user, I want to run `seo init <name>` to create a new project directory with all required files, so that I can start building pages immediately.

**Acceptance Criteria:**

**Given** I run `seo init my-project`
**When** the command completes
**Then** a directory `my-project/` is created containing `config.yaml`, `templates/`, `data/`, `assets/`, `.env.example`, and `.gitignore`
**And** the exit code is 0

**Given** the target directory already exists
**When** I run `seo init my-project`
**Then** the command exits with code 1 and an error message

**Priority:** Must
**Technical Notes:** See Architecture Section 5 (User Project Structure, templates/scaffold/), Section 3.2 (Config Loader)
**Dependencies:** Story 1.1
**Traces to:** FR-001, FR-031

### Story 1.4: Create Example Project Content

As a new user, I want the scaffolded project to include a working example that generates 5-10 pages, so that I can see all features in action before customizing.

**Acceptance Criteria:**

**Given** a project created via `seo init`
**When** I run `seo build` in that project directory
**Then** 5-10 HTML pages are generated in the output directory
**And** each page contains structured data, meta tags, and internal links
**And** at least 1 generated image exists per page

**Priority:** Must
**Technical Notes:** See Architecture Section 5 (templates/scaffold/ — config.yaml, landing-page.njk, example.csv, hero-base.png)
**Dependencies:** Stories 1.3 and all core pipeline stories (this story is finalized after Epics 2-8 are complete)
**Traces to:** FR-001, FR-002

### Story 1.5: Implement Build Command Routing and Flags

As a user, I want the `seo build` command to accept `--dry-run`, `--sample <n>`, `--incremental`, and `--output <dir>` flags, so that I can control what gets built.

**Acceptance Criteria:**

**Given** a valid project directory
**When** I run `seo build`
**Then** the full build pipeline is invoked

**Given** I run `seo build --dry-run`
**When** the command completes
**Then** the keyword matrix is displayed with page count but no HTML files are created and no API calls are made

**Given** I run `seo build --sample 5`
**When** the command completes
**Then** exactly 5 pages are generated

**Given** I run `seo build --output ./custom`
**When** the command completes
**Then** output files are written to `./custom` instead of the default directory

**Priority:** Must
**Technical Notes:** See Architecture Section 6 (Pipeline Stages 1-6), Section 5 (src/cli/commands/build.ts)
**Dependencies:** Story 1.1
**Traces to:** FR-007, FR-032

---

## Epic 2: Configuration & Data Validation

Load, parse, and validate all project configuration with strong typing and clear error messages. Handle environment variables and data source loading.

### Story 2.1: Implement YAML and JSON Config Loading with Schema Validation

As a user, I want my config.yaml (or config.json) to be loaded and validated at build start, so that I get clear error messages for invalid configuration before any work begins.

**Acceptance Criteria:**

**Given** a project directory with a valid `config.yaml`
**When** the config loader runs
**Then** a fully typed `ProjectConfig` object is returned

**Given** a project directory with `config.json` instead of `config.yaml`
**When** the config loader runs
**Then** the JSON config is loaded and produces identical results to an equivalent YAML config

**Given** a config file with missing required fields
**When** the config loader runs
**Then** a clear error message identifies the missing fields and the build does not proceed

**Priority:** Must
**Technical Notes:** See Architecture Section 2 (Zod 3.x, js-yaml), Section 3.2 (Config Loader), Section 4 (ProjectConfig interface), Section 5 (src/core/config.ts, src/schemas/index.ts)
**Dependencies:** Story 1.1
**Traces to:** FR-039, PT-05

### Story 2.2: Implement Data Source Loading from CSV and JSON

As a user, I want to load external data from CSV and JSON files referenced in my config, so that I can use spreadsheet data and structured datasets in my templates.

**Acceptance Criteria:**

**Given** a config referencing a CSV file with column mappings
**When** the data source loader runs
**Then** the CSV data is available as a keyed record set for template interpolation

**Given** a config referencing a JSON data file
**When** the data source loader runs
**Then** the JSON data is available for template interpolation

**Given** a referenced data file does not exist
**When** the data source loader runs
**Then** a clear error message identifies the missing file

**Priority:** Must
**Technical Notes:** See Architecture Section 3.2 (Data Sources component), Section 4 (DimensionDef.source, DataSources), Section 5 (src/core/data-sources.ts)
**Dependencies:** Story 2.1
**Traces to:** FR-005, FR-009

### Story 2.3: Implement Environment Variable and .env File Handling

As a user, I want API keys loaded from environment variables or a `.env` file so that my credentials are never stored in config files or leaked into build output.

**Acceptance Criteria:**

**Given** `OPENAI_API_KEY` is set as an environment variable
**When** the config loader runs
**Then** the API key is available to the AI provider

**Given** a `.env` file contains `ANTHROPIC_API_KEY=sk-xxx`
**When** the config loader runs
**Then** the API key is loaded from the file

**Given** a scaffolded project
**When** I inspect the `.gitignore`
**Then** `.env` is listed

**Given** a build completes
**When** I search all output files and logs for API key patterns
**Then** no API keys are found in any output artifact

**Priority:** Must
**Technical Notes:** See Architecture Section 2 (dotenv), Section 4 (AIConfig.providers.apiKeyEnv), Section 5 (.env.example in scaffold)
**Dependencies:** Story 2.1
**Traces to:** FR-040, NFR-010, NFR-011, PT-11

---

## Epic 3: Keyword Matrix Engine

Implement the core keyword matrix expansion pipeline: dimension definitions, cartesian product generation, filtering, CSV import, URL/slug generation, and dry-run preview.

### Story 3.1: Implement Keyword Matrix Cartesian Product Expansion

As a user, I want to define keyword dimensions in my config and have the system generate all valid combinations, so that I can produce pages for every keyword variant.

**Acceptance Criteria:**

**Given** a config with 3 head terms and 2 modifier dimensions (5 values each)
**When** the matrix engine expands the dimensions
**Then** exactly 75 keyword combinations are produced (3 x 5 x 5)
**And** each combination includes the correct values for all dimensions

**Given** a single dimension with 10 values
**When** the matrix engine expands
**Then** exactly 10 page entries are produced

**Priority:** Must
**Technical Notes:** See Architecture Section 3.2 (Keyword Matrix Engine), Section 4 (MatrixConfig, DimensionDef, PageEntry), Section 6 Stage 2 steps 1-2
**Dependencies:** Story 2.1
**Traces to:** FR-003

### Story 3.2: Implement URL Pattern Templates and Slug Generation

As a user, I want to define URL and title patterns using matrix variables, so that each page has a unique SEO-friendly URL derived from its keyword combination.

**Acceptance Criteria:**

**Given** a pattern `{head}-for-{mod1}` with head=["a","b"] and mod1=["x","y"]
**When** the matrix generates URLs
**Then** the URLs are: `a-for-x`, `a-for-y`, `b-for-x`, `b-for-y`

**Given** any generated URL
**When** it is inspected
**Then** it is lowercase, hyphen-separated, contains no query parameters, and the path segment is <=75 characters

**Given** dimension values that would produce a URL exceeding 75 characters
**When** the slug is generated
**Then** the URL is truncated to <=75 characters while remaining valid

**Priority:** Must
**Technical Notes:** See Architecture Section 4 (MatrixConfig.pattern, PageEntry.slug), Section 6 Stage 2 step 3, Section 5 (src/utils/slug.ts)
**Dependencies:** Story 3.1
**Traces to:** FR-004, FR-025, DR-08

### Story 3.3: Implement CSV Import for Keyword Data

As a user, I want to import keyword data from CSV files and map columns to matrix dimensions, so that I can use spreadsheet-based keyword workflows.

**Acceptance Criteria:**

**Given** a CSV file with 100 rows and 3 columns
**When** I reference the CSV in my config with column mappings
**Then** the data imports successfully and produces the same combinations as an equivalent inline YAML config

**Given** a CSV with a missing mapped column
**When** the data loads
**Then** a clear error message identifies the missing column

**Priority:** Must
**Technical Notes:** See Architecture Section 3.2 (Data Sources), Section 4 (DimensionDef.source, DimensionDef.column), Section 5 (src/core/data-sources.ts)
**Dependencies:** Story 2.2, Story 3.1
**Traces to:** FR-005

### Story 3.4: Implement Combination Filtering Rules

As a user, I want to define inclusion and exclusion rules to filter out nonsensical keyword combinations, so that only valid pages are generated.

**Acceptance Criteria:**

**Given** a matrix producing 100 raw combinations with an exclusion rule matching 15 combinations
**When** the matrix engine applies filters
**Then** exactly 85 page entries are output
**And** excluded combinations appear in the build log (at verbose level)

**Given** an inclusion rule specifying valid pairs
**When** the matrix engine applies filters
**Then** only combinations matching the inclusion rule are kept

**Priority:** Must
**Technical Notes:** See Architecture Section 4 (FilterRule interface, condition expressions), Section 6 Stage 2 step 2
**Dependencies:** Story 3.1
**Traces to:** FR-006

### Story 3.5: Implement Dry Run Mode

As a user, I want to preview my keyword matrix without generating pages or calling APIs, so that I can verify my configuration before committing to a full build.

**Acceptance Criteria:**

**Given** a valid project configuration
**When** I run `seo build --dry-run`
**Then** the full list of page URLs and total count is displayed
**And** no HTML files are created
**And** no AI API calls are made
**And** execution completes in <5 seconds for 10,000 combinations

**Priority:** Must
**Technical Notes:** See Architecture Section 6 Stage 2 step 5 (dry-run exit point)
**Dependencies:** Story 1.5, Story 3.1, Story 3.4
**Traces to:** FR-007, NFR-002

---

## Epic 4: Content Template System

Implement the block-based template engine with variable interpolation, Markdown support, and content rule validation.

### Story 4.1: Implement Block-Based Template Engine

As a user, I want to create page templates composed of named content blocks (hero, features, FAQ, CTA), so that I can structure my landing pages with reusable sections.

**Acceptance Criteria:**

**Given** a template with 5 named blocks (hero, features, comparison, faq, cta)
**When** the template engine renders a page
**Then** the HTML output contains all 5 sections in the defined order
**And** each block is independently addressable in configuration

**Given** a template referencing a block that does not exist in config
**When** the template engine renders
**Then** a clear warning is logged and the block renders as empty

**Priority:** Must
**Technical Notes:** See Architecture Section 2 (Nunjucks), Section 3.2 (Content Generator), Section 4 (PageTemplateConfig, ContentBlockConfig), Section 5 (src/content/template-engine.ts)
**Dependencies:** Story 2.1
**Traces to:** FR-008

### Story 4.2: Implement Variable Interpolation from Matrix and Data Sources

As a user, I want my templates to resolve `{{variable}}` markers from keyword matrix data and external data sources, so that each page displays its unique content.

**Acceptance Criteria:**

**Given** a template with `{{industry}}` and `{{use_case}}` variables
**When** the template renders for a page entry with industry="restaurants" and use_case="inventory"
**Then** the output contains "restaurants" and "inventory" in the correct positions
**And** no unresolved `{{...}}` markers appear in the output

**Given** a template referencing a variable from an external JSON data source
**When** the template renders
**Then** the data source value is correctly interpolated

**Priority:** Must
**Technical Notes:** See Architecture Section 2 (Nunjucks filters, conditionals, loops), Section 3.2 (Content Generator), Section 4 (PageEntry.dimensions, PageEntry.data)
**Dependencies:** Story 4.1, Story 2.2
**Traces to:** FR-009

### Story 4.3: Implement Markdown Template Support

As a user, I want to write templates in Markdown format and have them converted to HTML, so that I can author content in a simpler format.

**Acceptance Criteria:**

**Given** a template file in Markdown format
**When** the build processes the template
**Then** the Markdown is converted to valid HTML in the output

**Given** equivalent content in Markdown and HTML templates
**When** both are built
**Then** the rendered HTML output is functionally identical

**Priority:** Must
**Technical Notes:** See Architecture Section 2 (markdown-it), Section 5 (src/content/markdown.ts), Section 4 (PageTemplateConfig.format)
**Dependencies:** Story 4.1
**Traces to:** FR-013

### Story 4.4: Implement Per-Block Content Rules

As a user, I want to set minimum word count, maximum word count, required keywords, and tone guidance per content block, so that generated content meets quality standards.

**Acceptance Criteria:**

**Given** a block with `min_words: 150`
**When** the rendered block contains fewer than 150 words
**Then** a warning is logged identifying the block and page

**Given** a block with `required_keywords: ["inventory", "management"]`
**When** the rendered block is inspected
**Then** both keywords appear in the output text

**Given** a block with a tone rule set to "professional"
**When** the block is AI-generated
**Then** the tone guidance is included in the AI prompt

**Priority:** Should
**Technical Notes:** See Architecture Section 4 (ContentRules interface), Section 6 Stage 3 step 4
**Dependencies:** Story 4.1
**Traces to:** FR-012

---

## Epic 5: AI Content Generation

Implement the AI provider abstraction layer with OpenAI and Anthropic support, response caching, rate limiting, and graceful degradation.

### Story 5.1: Implement AI Provider Abstraction Interface

As a developer, I want a common interface for AI content generation that abstracts away provider differences, so that new providers can be added without changing the content pipeline.

**Acceptance Criteria:**

**Given** the AI provider abstraction is implemented
**When** a content block requests AI generation
**Then** the system calls the configured provider through a unified interface
**And** the interface accepts prompt, model, temperature, and maxTokens parameters

**Priority:** Must
**Technical Notes:** See Architecture Section 7 (Provider Abstraction — AIProvider interface), Section 4 (AIProvider, GenerateOptions), Section 5 (src/ai/provider.ts)
**Dependencies:** Story 2.3
**Traces to:** FR-010

### Story 5.2: Implement AI Response Caching

As a user, I want AI responses cached so that rebuilds do not re-call APIs for unchanged prompts, saving money and time.

**Acceptance Criteria:**

**Given** an AI block is generated for the first time
**When** the same prompt and parameters are requested again
**Then** the cached response is returned without an API call

**Given** a cache entry older than the configured TTL (default 30 days)
**When** the prompt is requested
**Then** a fresh API call is made and the cache is updated

**Given** the build report is generated
**When** I review it
**Then** the count of `aiApiCalls` and `aiCacheHits` is included

**Priority:** Must
**Technical Notes:** See Architecture Section 7 (Caching Strategy — SHA-256 keyed JSON files in .seo-cache/ai-cache/), Section 5 (src/ai/cache.ts)
**Dependencies:** Story 5.1
**Traces to:** FR-010

### Story 5.3: Implement OpenAI and Anthropic Providers

As a user, I want to choose between OpenAI and Anthropic for AI content generation by changing a config value, so that I can use whichever provider I prefer.

**Acceptance Criteria:**

**Given** `provider: openai` in config with a valid OPENAI_API_KEY
**When** the build runs
**Then** AI blocks are generated using the OpenAI API

**Given** `provider: anthropic` in config with a valid ANTHROPIC_API_KEY
**When** the build runs
**Then** AI blocks are generated using the Anthropic API

**Given** I switch providers in config
**When** I rebuild
**Then** the only required change is the config value and the environment variable

**Priority:** Must
**Technical Notes:** See Architecture Section 7 (OpenAI endpoint, Anthropic endpoint, default models), Section 5 (src/ai/openai.ts, src/ai/anthropic.ts)
**Dependencies:** Story 5.1
**Traces to:** FR-011

### Story 5.4: Implement Graceful AI Degradation

As a user, I want builds to complete successfully even when AI APIs are unavailable, so that I am not blocked by API outages or missing keys.

**Acceptance Criteria:**

**Given** an invalid or missing API key
**When** I run `seo build`
**Then** the build completes with warnings (not errors)
**And** AI-designated blocks render with template-only variable interpolation
**And** the exit code is 0

**Given** the AI API returns persistent failures after retries
**When** the content generator processes that block
**Then** the fallback content is used and a warning is logged

**Priority:** Must
**Technical Notes:** See Architecture Section 7 (Fallback Strategy), Section 6 Stage 3
**Dependencies:** Story 5.1, Story 4.2
**Traces to:** FR-041, NFR-007, PT-14

### Story 5.5: Implement AI Rate Limiting and Retry Logic

As a user, I want AI API calls to respect rate limits and retry on transient failures, so that builds complete reliably at scale.

**Acceptance Criteria:**

**Given** the AI concurrency is configured to 5
**When** 20 pages with AI blocks are built simultaneously
**Then** no more than 5 AI API calls are in flight at any time

**Given** the AI API returns HTTP 429 (rate limited)
**When** the rate limiter handles the response
**Then** the call is retried with exponential backoff (1s, 2s, 4s) up to 3 retries

**Given** the AI API returns HTTP 5xx
**When** the retry logic handles the response
**Then** the call is retried up to 3 times before falling back to degraded content

**Priority:** Must
**Technical Notes:** See Architecture Section 7 (Rate Limiting and Concurrency — Semaphore-based limiter, 3 retries), Section 5 (src/ai/rate-limiter.ts)
**Dependencies:** Story 5.1
**Traces to:** NFR-009, PT-12, PT-13

---

## Epic 6: Visual Asset Pipeline

Implement dynamic image generation with base images, text overlays, format optimization, and product image mapping.

### Story 6.1: Implement Image Template Composition

As a user, I want to define image templates with a base image and overlay zones, so that each page gets a unique hero image.

**Acceptance Criteria:**

**Given** an image template config with 1 base image and 2 text overlay zones
**When** the image generator processes a page entry
**Then** a unique output image is produced with the base image as the background
**And** both overlay zones are rendered with the correct content

**Priority:** Must
**Technical Notes:** See Architecture Section 2 (Sharp 0.33+), Section 3.2 (Visual Asset Generator), Section 4 (ImageTemplateConfig, ImageOverlay), Section 5 (src/images/image-generator.ts, src/images/compositor.ts)
**Dependencies:** Story 3.1
**Traces to:** FR-014

### Story 6.2: Implement Dynamic Text Overlays with Alt Text

As a user, I want text overlays on generated images populated from keyword data with configurable font, size, color, and position, so that each image is unique and descriptive.

**Acceptance Criteria:**

**Given** a page entry for "inventory software for restaurants"
**When** the image is generated with a text overlay for `{{industry}}`
**Then** "restaurants" is rendered in the specified font, size, color, and position
**And** text is legible with no clipping or overflow

**Given** any generated image
**When** it is included in the HTML page
**Then** the `alt` attribute contains a descriptive text derived from keyword data

**Priority:** Must
**Technical Notes:** See Architecture Section 6 Stage 4 steps 2 and 4 (SVG text injection, alt text from DR-07), Section 4 (GeneratedAsset.altText)
**Dependencies:** Story 6.1
**Traces to:** FR-015, DR-07

### Story 6.3: Implement Optimized WebP and PNG Image Output

As a user, I want generated images output as optimized WebP with PNG fallback, so that pages load fast while maintaining browser compatibility.

**Acceptance Criteria:**

**Given** an image template is processed
**When** the image generator completes
**Then** both a WebP and a PNG version of the image exist in the output

**Given** a 1200x630 hero image
**When** the WebP output is inspected
**Then** the file size is <=200KB

**Priority:** Must
**Technical Notes:** See Architecture Section 2 (Sharp — format conversion, optimization), Section 4 (ImageConfig.outputFormats, ImageConfig.quality), Section 5 (src/images/optimizer.ts)
**Dependencies:** Story 6.1
**Traces to:** FR-016

### Story 6.4: Implement Product Image Integration

As a user, I want to map product images from a local asset library to keyword matrix entries, so that pages and visual assets include the correct product image.

**Acceptance Criteria:**

**Given** a mapping of 10 product images to 10 keyword entries
**When** the build processes those entries
**Then** each page and its visual assets include the correct product image

**Given** a keyword entry has no mapped product image
**When** the build processes that entry
**Then** the default base image is used and a warning is logged

**Priority:** Should
**Technical Notes:** See Architecture Section 4 (ImageOverlay.source — data field reference), Section 3.2 (Visual Asset Generator)
**Dependencies:** Story 6.1, Story 2.2
**Traces to:** FR-017

---

## Epic 7: Static Site Builder (HTML, SEO, Structured Data)

Assemble final HTML pages with all SEO metadata, structured data, sitemap, robots.txt, and responsive output.

### Story 7.1: Implement Static HTML Page Assembly

As a user, I want the build to produce self-contained static HTML pages that render correctly without any server runtime, so that I can deploy anywhere.

**Acceptance Criteria:**

**Given** a completed content generation and asset generation pass
**When** the page assembler runs
**Then** complete HTML5 files are written to the output directory

**Given** a generated HTML file
**When** opened directly via `file://` protocol in a browser
**Then** all content is visible without JavaScript

**Given** any generated page
**When** validated against HTML5 standards
**Then** no validation errors are produced

**Priority:** Must
**Technical Notes:** See Architecture Section 3.2 (Page Assembler), Section 6 Stage 5, Section 5 (src/builder/page-assembler.ts)
**Dependencies:** Stories 4.1, 6.1
**Traces to:** FR-018, DR-06, PT-07

### Story 7.2: Implement SEO Meta Tags and Canonical URLs

As a user, I want every page to include title, meta description, canonical URL, Open Graph, and Twitter Card tags, so that pages are optimized for search engines and social sharing.

**Acceptance Criteria:**

**Given** any generated page
**When** the HTML is inspected
**Then** it contains: title tag, meta description, canonical URL, og:title, og:description, og:image, og:url, and twitter:card tags
**And** all values are populated from keyword/template data (not empty)

**Given** the entire generated corpus
**When** canonical URLs are inspected
**Then** no two pages share the same canonical URL

**Priority:** Must
**Technical Notes:** See Architecture Section 5 (src/builder/seo-metadata.ts), Section 4 (PageSEOData), Section 3.2 (Page Assembler)
**Dependencies:** Story 7.1
**Traces to:** FR-019, DR-02

### Story 7.3: Implement JSON-LD Structured Data Generation

As a user, I want configurable JSON-LD structured data on every page supporting Product, FAQPage, BreadcrumbList, and WebPage types, so that pages qualify for rich search results.

**Acceptance Criteria:**

**Given** a template configured with `schemaTypes: [Product, FAQPage]`
**When** the page is built
**Then** the HTML contains a JSON-LD script block with both Product and FAQPage structured data

**Given** the JSON-LD output for any page
**When** validated against Schema.org vocabulary
**Then** it passes Google Rich Results Test

**Given** a different template configured with `schemaTypes: [WebPage, BreadcrumbList]`
**When** the page is built
**Then** only WebPage and BreadcrumbList types are present in the JSON-LD

**Priority:** Must
**Technical Notes:** See Architecture Section 5 (src/builder/structured-data.ts), Section 4 (SEOConfig.schemaTypes, PageSEOData.jsonLd)
**Dependencies:** Story 7.1
**Traces to:** FR-020, DR-01, DR-12, DR-13

### Story 7.4: Implement Responsive and Performant HTML Output

As a user, I want generated pages to render correctly from 320px to 1920px, stay under 50KB, and achieve a Lighthouse mobile score of >=90, so that pages perform well on all devices.

**Acceptance Criteria:**

**Given** any generated page
**When** viewed at viewport widths of 320px, 768px, and 1920px
**Then** no horizontal scrolling occurs and content is readable at each width

**Given** any generated HTML file (excluding images)
**When** its file size is measured
**Then** it is <=50KB

**Given** a sample of 10 generated pages
**When** run through Lighthouse mobile audit
**Then** the average performance score is >=90
**And** LCP is <=2.5 seconds, CLS is <=0.1

**Given** any generated page
**When** audited with axe-core
**Then** zero WCAG 2.1 Level AA violations are reported for programmatically determinable content

**Priority:** Must
**Technical Notes:** See Architecture Section 5 (src/builder/page-assembler.ts — layout template must include responsive meta viewport, minimal CSS)
**Dependencies:** Story 7.1
**Traces to:** FR-024, NFR-003, NFR-004, NFR-016, DR-09, DR-10, DR-11

### Story 7.5: Implement Sitemap.xml and Robots.txt Generation

As a user, I want the build to produce a valid sitemap.xml and robots.txt, so that search engines can discover and crawl all pages.

**Acceptance Criteria:**

**Given** a completed build of 100 pages
**When** the sitemap.xml is generated
**Then** it contains exactly 100 URLs with lastmod dates
**And** it validates against Sitemaps Protocol 0.9

**Given** the generated robots.txt
**When** inspected
**Then** it contains a `Sitemap:` directive pointing to the sitemap.xml location
**And** it validates against the Robots Exclusion Protocol

**Priority:** Must
**Technical Notes:** See Architecture Section 6 Stage 6 steps 1-2, Section 5 (src/builder/sitemap.ts, src/builder/robots.ts)
**Dependencies:** Story 7.1
**Traces to:** FR-021, FR-022, DR-03, DR-04

---

## Epic 8: Internal Linking Engine

Compute and inject internal links between related pages based on shared keyword dimensions.

### Story 8.1: Implement Shared-Dimension Link Computation

As a user, I want the system to automatically identify related pages based on shared keyword dimensions, so that internal links connect semantically related content.

**Acceptance Criteria:**

**Given** a page for "inventory software for restaurants"
**When** internal links are computed
**Then** the page links to >=3 sibling pages sharing at least one dimension value (e.g., same industry or same use case)

**Given** a configurable max links per page (default: 10)
**When** more than 10 related pages exist
**Then** only the top 10 most relevant links are included

**Priority:** Must
**Technical Notes:** See Architecture Section 4 (SEOConfig.internalLinking, InternalLink), Section 5 (src/content/internal-links.ts), Section 6 Stage 5 step 4
**Dependencies:** Story 3.1, Story 7.1
**Traces to:** FR-023

### Story 8.2: Implement Descriptive Anchor Text for Internal Links

As a user, I want internal link anchor text to be descriptive and derived from the target page's keyword data, so that links provide value to both users and search engines.

**Acceptance Criteria:**

**Given** internal links are generated for a page
**When** the anchor text is inspected
**Then** it contains descriptive text derived from the target page's title or keyword dimensions
**And** no anchor text is generic (e.g., "click here" or "read more")

**Given** the complete corpus
**When** all internal links are checked
**Then** zero broken internal links exist (all targets resolve to generated pages)

**Priority:** Must
**Technical Notes:** See Architecture Section 4 (InternalLink.anchorText, InternalLink.relationship)
**Dependencies:** Story 8.1
**Traces to:** FR-023

---

## Epic 9: Quality Assurance Pipeline

Implement the audit command with content uniqueness checking, thin content detection, broken link validation, structured data validation, and reporting.

### Story 9.1: Implement Content Uniqueness Checker

As a user, I want `seo audit` to calculate pairwise content similarity and flag pages exceeding the threshold, so that I can ensure my corpus avoids duplicate content penalties.

**Acceptance Criteria:**

**Given** a corpus with 2 intentionally duplicate pages
**When** I run `seo audit`
**Then** both pages are flagged with similarity >0.90

**Given** a corpus with properly differentiated pages
**When** I run `seo audit`
**Then** the average Jaccard similarity is <=0.30

**Given** the similarity threshold is configured to 0.20
**When** I run `seo audit`
**Then** pages with similarity >0.20 are flagged

**Priority:** Must
**Technical Notes:** See Architecture Section 3.2 (Quality Checker), Section 4 (AuditConfig.uniquenessThreshold, AuditReport.checks.uniqueness), Section 5 (src/audit/uniqueness.ts)
**Dependencies:** Story 7.1
**Traces to:** FR-026, DR-05

### Story 9.2: Implement Thin Content Detector

As a user, I want `seo audit` to flag pages with insufficient body text, so that I can avoid thin content penalties.

**Acceptance Criteria:**

**Given** a page with 250 words of body text and a threshold of 300
**When** I run `seo audit`
**Then** the page is flagged as thin content

**Given** a page with 350 words of body text and a threshold of 300
**When** I run `seo audit`
**Then** the page passes the thin content check

**Given** the threshold is configured to 200 in config
**When** I run `seo audit`
**Then** the custom threshold of 200 is used

**Priority:** Must
**Technical Notes:** See Architecture Section 4 (AuditConfig.minWordCount, AuditReport.checks.thinContent), Section 5 (src/audit/thin-content.ts)
**Dependencies:** Story 7.1
**Traces to:** FR-027, DR-05

### Story 9.3: Implement Broken Link Checker

As a user, I want `seo audit` to verify all internal links resolve to existing pages, so that I deploy a corpus with zero broken links.

**Acceptance Criteria:**

**Given** a corpus with 1 intentionally broken internal link
**When** I run `seo audit`
**Then** the report lists the broken link with source page, target URL, and link text

**Given** a corpus with all valid internal links
**When** I run `seo audit`
**Then** the report shows 0 broken links

**Priority:** Must
**Technical Notes:** See Architecture Section 4 (AuditReport.checks.brokenLinks), Section 5 (src/audit/broken-links.ts)
**Dependencies:** Story 8.1
**Traces to:** FR-028

### Story 9.4: Implement Audit Command and Build Report Generation

As a user, I want `seo audit` to run all checks and output a structured report (JSON and human-readable), so that I can review quality at a glance and automate quality gates.

**Acceptance Criteria:**

**Given** a generated corpus
**When** I run `seo audit`
**Then** uniqueness, thin content, broken link, and structured data checks all execute
**And** a report is printed to stdout and saved to file
**And** exit code is 0 if all checks pass, 1 if any warnings or errors

**Given** a build completes
**When** the build report is generated
**Then** it includes: total pages, build time, per-page quality scores, warnings, and errors
**And** the JSON report is parseable and the terminal report is human-readable

**Priority:** Must
**Technical Notes:** See Architecture Section 3.2 (Quality Checker, Build Cache & Report), Section 4 (BuildReport, AuditReport), Section 5 (src/audit/reporter.ts, src/cli/commands/audit.ts)
**Dependencies:** Stories 9.1, 9.2, 9.3
**Traces to:** FR-029, FR-034

### Story 9.5: Implement Structured Data Validation

As a user, I want `seo audit` to validate JSON-LD on each page against Schema.org vocabulary, so that I can fix structured data errors before deployment.

**Acceptance Criteria:**

**Given** a page with invalid JSON-LD (missing a required Schema.org field)
**When** I run `seo audit`
**Then** the page is flagged with the specific validation error

**Given** a page with valid JSON-LD
**When** I run `seo audit`
**Then** the page passes structured data validation

**Priority:** Should
**Technical Notes:** See Architecture Section 4 (AuditReport.checks.structuredData), Section 5 (src/audit/structured-data.ts)
**Dependencies:** Story 7.3
**Traces to:** FR-030, DR-01, DR-12

---

## Epic 10: Build Pipeline & Performance

Implement parallel processing, build caching, incremental builds, interrupted build recovery, and establish the test infrastructure.

### Story 10.1: Implement Parallel Page Processing Pipeline

As a user, I want pages to be processed in parallel with configurable concurrency, so that builds of large corpora complete within reasonable time.

**Acceptance Criteria:**

**Given** a corpus of 100 pages with page concurrency set to 10
**When** I run `seo build`
**Then** up to 10 pages are processed simultaneously

**Given** consumer hardware (4-core CPU, 8GB RAM)
**When** a full build with AI content generation runs
**Then** the throughput is >=100 pages per hour

**Given** a matrix of 50,000 page combinations
**When** the build processes entries
**Then** peak memory usage does not exceed 4GB

**Priority:** Must
**Technical Notes:** See Architecture Section 6 (Parallel Processing Strategy — Promise-based concurrency pool), Section 5 (src/builder/pipeline.ts)
**Dependencies:** Stories 4.1, 5.1, 6.1, 7.1
**Traces to:** NFR-001, NFR-005

### Story 10.2: Implement Build Cache Manifest

As a developer, I want a build manifest tracking input hashes per page, so that incremental builds and interrupted build recovery can determine which pages need regeneration.

**Acceptance Criteria:**

**Given** a full build completes
**When** the build manifest is inspected
**Then** it contains an entry for every generated page with its inputHash and outputFiles

**Given** a page's template, data, or config changes
**When** the inputHash is recalculated
**Then** it differs from the previous manifest entry

**Priority:** Must
**Technical Notes:** See Architecture Section 4 (BuildManifest, ManifestEntry), Section 6 (Caching Strategy — Build Manifest), Section 5 (src/core/cache.ts)
**Dependencies:** Story 3.1
**Traces to:** FR-038, NFR-006

### Story 10.3: Implement Incremental Builds

As a user, I want `seo build --incremental` to regenerate only pages whose inputs have changed, so that iteration on large projects is fast.

**Acceptance Criteria:**

**Given** a 1,000-page corpus where 1 template affecting 50 pages is modified
**When** I run `seo build --incremental`
**Then** exactly 50 pages are regenerated
**And** build time is <=20% of a full build

**Given** rebuilding 5% of a 10,000-page corpus
**When** the incremental build completes
**Then** it finishes in <=10% of the full build time

**Priority:** Should
**Technical Notes:** See Architecture Section 6 Stage 2 step 7 (incremental filter), Section 4 (PageEntry.inputHash, BuildManifest)
**Dependencies:** Story 10.2, Story 1.5
**Traces to:** FR-038, NFR-006, PT-10

### Story 10.4: Implement Interrupted Build Recovery

As a user, I want to resume a build that was interrupted partway through, so that I do not lose work or waste API calls.

**Acceptance Criteria:**

**Given** a build is interrupted after generating 500 of 1,000 pages
**When** I restart `seo build`
**Then** the build detects the 500 already-generated pages and skips them
**And** only the remaining 500 pages are generated

**Priority:** Should
**Technical Notes:** See Architecture Section 6 (Interrupted Build Recovery — check existing output files and manifest entries on startup)
**Dependencies:** Story 10.2
**Traces to:** NFR-008

### Story 10.5: Establish Cross-Platform Test Infrastructure

As a developer, I want automated unit and integration tests running on macOS, Linux, and Windows/WSL2 in CI, so that regressions are caught early and cross-platform compatibility is verified.

**Acceptance Criteria:**

**Given** the test suite is configured
**When** tests run in CI
**Then** they execute on macOS, Ubuntu Linux, and Windows/WSL2

**Given** the test suite runs
**When** coverage is measured
**Then** line coverage is >=80%

**Given** each CLI command (init, build, preview, audit, export)
**When** integration tests execute against a reference project
**Then** end-to-end behavior is verified for each command

**Priority:** Must
**Technical Notes:** See Architecture Section 2 (Vitest, CI workflows), Section 5 (test/ directory structure, .github/workflows/ci.yml)
**Dependencies:** None (can be set up early and expanded as features are added)
**Traces to:** NFR-012, NFR-013, NFR-014

---

## Epic 11: Export & Deployment

Implement the export command for deployment-ready output and the preview server for local development.

### Story 11.1: Implement Export Command

As a user, I want `seo export --output <dir>` to produce a self-contained deployment-ready directory, so that I can deploy to any static hosting platform.

**Acceptance Criteria:**

**Given** a completed build
**When** I run `seo export --output ./dist`
**Then** the `./dist` directory contains all HTML files, assets, sitemap.xml, and robots.txt
**And** the directory is self-contained with no symlinks or external references

**Given** the exported directory
**When** deployed to a static hosting platform (Netlify, Vercel, Cloudflare Pages)
**Then** all pages are accessible at their canonical URLs

**Priority:** Must
**Technical Notes:** See Architecture Section 3.2 (Export / Output), Section 4 (ExportConfig), Section 5 (src/cli/commands/export.ts)
**Dependencies:** Story 7.1, Story 7.5
**Traces to:** FR-035, PT-07, PT-08

### Story 11.2: Implement Preview Server

As a user, I want `seo preview` to launch a local HTTP server serving my generated pages, so that I can inspect output in a browser during development.

**Acceptance Criteria:**

**Given** a completed build
**When** I run `seo preview`
**Then** a local HTTP server starts on the default port (3000)
**And** pages are accessible via browser at `http://localhost:3000/<page-url>`

**Given** I run `seo preview --port 8080`
**When** the server starts
**Then** it listens on port 8080

**Given** the server is running
**When** I press Ctrl+C
**Then** the server exits cleanly

**Priority:** Must
**Technical Notes:** See Architecture Section 2 (sirv or Node.js http module), Section 5 (src/cli/commands/preview.ts)
**Dependencies:** Story 7.1
**Traces to:** FR-033, PT-09

### Story 11.3: Implement Configurable Output Directory Structure

As a user, I want to choose between flat and nested output directory structures, so that the generated site matches my hosting platform's expectations.

**Acceptance Criteria:**

**Given** `outputStructure: flat` in config
**When** the build outputs pages
**Then** all HTML files are in a single directory level (e.g., `dist/page-slug.html`)

**Given** `outputStructure: nested` in config
**When** the build outputs pages
**Then** pages are organized in subdirectories (e.g., `dist/page-slug/index.html`)

**Priority:** Should
**Technical Notes:** See Architecture Section 4 (ProjectConfig.outputStructure), Section 3.2 (Export / Output)
**Dependencies:** Story 7.1
**Traces to:** PT-08

### Story 11.4: Implement Exit Code Conventions

As a user, I want all CLI commands to follow standard exit code conventions, so that I can use the tool reliably in scripts and CI pipelines.

**Acceptance Criteria:**

**Given** any command completes successfully
**When** the exit code is checked
**Then** it is 0

**Given** a command encounters a runtime error
**When** the exit code is checked
**Then** it is 1

**Given** a command is invoked with invalid arguments
**When** the exit code is checked
**Then** it is 2

**Priority:** Must
**Technical Notes:** See PRD PT-04 (Exit code conventions)
**Dependencies:** Story 1.1
**Traces to:** PT-04
