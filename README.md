# seo

A CLI tool for generating conversion-focused SEO landing pages at scale. Combines keyword matrices, structured content templates, AI content generation, and dynamic visual assets to produce static, deployment-ready pages.

Turn long-tail search intent like "Best {product} for {use case}" into thousands of unique, SEO-optimized landing pages — without a $300+/month SaaS stack.

## Features

- **Keyword Matrix Engine** — Define dimensions (products, use cases, locations) and automatically generate the cartesian product of all pages, with filtering and CSV import
- **Content Templates** — Nunjucks/Markdown block-based templates with variable interpolation
- **AI Content Generation** — OpenAI and Anthropic integration for unique per-page content (with caching and rate limiting)
- **Dynamic Visual Assets** — Sharp-based image composition with text overlays, output in WebP/PNG
- **Full SEO Infrastructure** — Meta tags, Open Graph, Twitter cards, JSON-LD structured data, sitemaps, robots.txt, breadcrumbs
- **Internal Linking** — Automatic cross-linking between pages sharing dimensions
- **Quality Assurance** — Content uniqueness (MinHash/Jaccard), thin content detection, broken link checking, structured data validation
- **Incremental Builds** — Cache-based rebuilds that skip unchanged pages
- **Static Output** — Zero-dependency HTML files deployable to any host

## Quick Start

```bash
# Install
git clone https://github.com/piotr-nearform/seo-tool.git
cd seo-tool
pnpm install
pnpm build
npm link

# Create a project
seo init my-project
cd my-project

# Preview what will be generated
seo build --dry-run

# Build all pages
seo build

# Preview locally
seo preview

# Check quality
seo audit
```

## CLI Commands

```
seo init <name>          Create a new project with example config and templates
seo build                Generate all pages from config and templates
seo build --dry-run      Preview the page matrix without generating
seo build --sample 5     Generate only 5 random pages for testing
seo build --incremental  Only rebuild changed pages
seo preview              Start local server at http://localhost:3000
seo preview --port 8080  Custom port
seo audit                Run quality checks on generated pages
seo export --output dir  Copy generated site for deployment
```

Global flags: `--verbose`, `--quiet`, `--config <path>`

## How It Works

1. **Define a keyword matrix** in `config.yaml` — dimensions like `product` and `use_case` with values
2. **Create templates** — Nunjucks/Markdown files with content blocks (hero, features, FAQ, CTA)
3. **Run `seo build`** — the tool expands the matrix, generates content (optionally via AI), composes images, assembles HTML pages with full SEO metadata, and writes static files to `dist/`
4. **Deploy** — push `dist/` to Netlify, Vercel, Cloudflare Pages, or any static host

## Project Structure

After `seo init my-project`:

```
my-project/
├── config.yaml           # Keyword matrix, templates, AI, SEO settings
├── templates/
│   ├── layout.njk        # Base HTML layout
│   └── landing-page.njk  # Page template with content blocks
├── data/
│   └── example.csv       # Dimension values from external data
├── assets/               # Base images for visual asset templates
├── .env.example          # API key placeholders
├── .gitignore
└── dist/                 # Generated output (after build)
    ├── {page-slug}/
    │   └── index.html
    ├── sitemap.xml
    └── robots.txt
```

## Configuration

`config.yaml` defines everything:

```yaml
name: my-project
baseUrl: https://example.com
outputDir: ./dist

matrix:
  dimensions:
    product:
      values: [CRM Software, Project Management Tool]
    use_case:
      source: data/use-cases.csv  # or load from CSV
      column: name
  pattern:
    url: "best-{{product}}-for-{{use_case}}"
    title: "Best {{product}} for {{use_case}} in 2026"
    description: "Compare top {{product}} options for {{use_case}}."
  filters:
    - type: exclude
      condition: "product == 'CRM Software' && use_case == 'Gaming'"

templates:
  layout: templates/layout.njk
  pages:
    - name: landing
      file: templates/landing-page.njk
      format: nunjucks
      blocks:
        - name: intro
          type: static
          template: "<p>Explore {{dimensions.product}} for {{dimensions.use_case}}.</p>"
        - name: detail
          type: ai
          ai:
            prompt: "Write 200 words about why {{dimensions.product}} is ideal for {{dimensions.use_case}}."
            provider: openai
            model: gpt-4o-mini

ai:
  defaultProvider: openai
  concurrency: 5
  cache: true
  providers:
    openai:
      model: gpt-4o-mini
      apiKeyEnv: OPENAI_API_KEY

seo:
  siteName: My Site
  schemaTypes: [WebPage, BreadcrumbList]
  internalLinking:
    enabled: true
    maxLinksPerPage: 10
    strategy: shared-dimension

audit:
  uniquenessThreshold: 0.30
  minWordCount: 300
  validateStructuredData: true
```

## AI Content Generation

Add API keys to `.env`:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

Mark template blocks as `type: ai` with a prompt template. The tool:
- Calls the API with page-specific context interpolated into prompts
- Caches responses (default 30 days) to avoid redundant API calls
- Retries on rate limits with exponential backoff
- Falls back to stale cache on API failure

## Tech Stack

- TypeScript (strict mode)
- Node.js 18+
- Commander.js (CLI)
- Nunjucks (templates)
- Sharp (images)
- Zod (validation)
- markdown-it (Markdown processing)
- Vitest (testing — 431 tests)

## Development

```bash
pnpm install
pnpm test          # run all 431 tests
pnpm build         # compile to dist/
npm link           # make 'seo' command available globally
```

## License

MIT
