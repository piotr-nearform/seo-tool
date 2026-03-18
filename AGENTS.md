# SEO Tool — Agent Reference

This document is designed for AI agents that need to use the `seo` CLI tool to generate programmatic SEO pages for a project.

## What This Tool Does

`seo` is a CLI-based static site generator for programmatic SEO. It takes a keyword matrix (dimensions × values), content templates, and optionally AI prompts to generate thousands of unique, SEO-optimized landing pages as static HTML.

**Input:** `config.yaml` + templates + data files + `.env` (API keys)
**Output:** Static HTML pages in `dist/` with sitemap, robots.txt, JSON-LD, internal linking

## Prerequisites

- Node.js 18+
- pnpm (`corepack enable && corepack install`)
- The `seo` CLI installed and linked (`pnpm install && pnpm build && npm link` from the tool repo)
- OpenAI or Anthropic API key (for AI content blocks)

## CLI Commands

```
seo init <project-name>    # Scaffold a new project directory
seo build                  # Generate all pages
seo build --dry-run        # Show page matrix without generating
seo build --sample <n>     # Generate only n random pages (for testing)
seo build --incremental    # Only rebuild changed pages
seo preview                # Local server at http://localhost:3000
seo preview --port <n>     # Custom port
seo audit                  # Run quality checks on generated output
seo export --output <dir>  # Copy output to deployment directory
```

Global flags: `--verbose`, `--quiet`, `--config <path>`

## Workflow for Agents

When asked to generate SEO pages for a project, follow these steps:

### Step 1: Scaffold

```bash
seo init <project-name>
cd <project-name>
```

This creates:
```
<project-name>/
├── config.yaml            # EDIT THIS — defines everything
├── templates/
│   ├── layout.njk         # Base HTML layout (usually fine as-is)
│   └── landing-page.njk   # Page template (usually fine as-is)
├── data/
│   └── example.csv        # Replace with real data
├── assets/                # Optional images
├── .env.example           # Copy to .env, add API keys
└── .gitignore
```

### Step 2: Configure `.env`

```bash
cp .env.example .env
```

Add API key(s):
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

Only one provider is needed.

### Step 3: Edit `config.yaml`

This is where ALL the important configuration happens. See the full schema reference below.

### Step 4: Test

```bash
seo build --dry-run        # Verify matrix expansion
seo build --sample 2       # Generate 2 pages to check quality
seo preview                # Review in browser
```

### Step 5: Build all

```bash
seo build                  # Generate all pages
seo audit                  # Check quality
seo preview                # Final review
```

---

## config.yaml Full Schema Reference

Every field is required unless marked `(optional)`.

```yaml
# ─── Project Metadata ───
name: string                    # Project name
version: string                 # e.g., "1.0"
baseUrl: string                 # e.g., "https://example.com" — used for canonical URLs, sitemap, OG tags
outputDir: string               # e.g., "./dist" — where generated pages go
outputStructure: flat | nested  # flat: slug.html, nested: slug/index.html (use nested for clean URLs)

# ─── Keyword Matrix ───
# Defines the combinatorial space of pages to generate.
# Total pages = product of all dimension value counts.
# Example: 10 products × 20 use_cases × 5 locations = 1,000 pages
matrix:
  dimensions:
    <dimension_name>:                  # Any name: product, use_case, location, industry, etc.
      values:                          # Inline values
        - "Value 1"
        - "Value 2"
      # OR load from external file:
      source: "data/filename.csv"      # (optional) Path to CSV file
      column: "column_name"            # (optional) Column to extract values from
      # When using source/column, all other CSV columns become available as
      # metadata in templates via {{dimensions.<dim_name>_<column>}} or {{data.<column>}}

  pattern:
    url: "best-{{product}}-for-{{use_case}}"           # URL slug pattern — {{dimension_name}} interpolation
    title: "Best {{product}} for {{use_case}} in 2026"  # Page <title> and <h1>
    description: "Compare top {{product}} options..."    # Meta description

  filters:                             # (optional) Filter out unwanted combinations
    - type: include | exclude
      condition: "dimension_name == 'value'"
      # Supported operators: ==, !=, &&, ||
      # Examples:
      #   "product == 'CRM' && use_case == 'Gaming'"  → exclude nonsensical combos
      #   "location != 'Antarctica'"

# ─── Templates ───
templates:
  layout: templates/layout.njk         # Base HTML layout (head, body wrapper, footer)
  pages:
    - name: string                     # Template identifier
      file: templates/landing-page.njk # Template file path
      format: nunjucks | markdown      # Template format
      blocks:                          # Content blocks rendered into the page
        - name: string                 # Block identifier (e.g., "hero", "introduction", "faq")
          type: static | ai            # static = template interpolation, ai = LLM-generated

          # For type: static
          template: string             # (optional) Inline template string with {{variable}} interpolation
                                       # If omitted, block renders empty

          # For type: ai
          ai:                          # (required when type: ai)
            prompt: string             # Prompt template — supports {{dimensions.X}} and {{data.X}} variables
            provider: openai | anthropic  # (optional) Override default provider
            model: string              # (optional) Override default model, e.g., "gpt-4o-mini", "claude-sonnet-4-5-20241022"
            temperature: number        # (optional) Default: 0.7. Lower = more deterministic
            maxTokens: number          # (optional) Default: 500. Max tokens in response

          # Content quality rules (optional, works for both static and ai)
          rules:
            minWords: number           # (optional) Warn if block has fewer words
            maxWords: number           # (optional) Warn if block has more words
            requiredKeywords:          # (optional) Warn if these strings are missing from output
              - "{{dimensions.product}}"  # Supports variable interpolation
            tone: string               # (optional) Passed to AI prompts if present

# ─── Image Generation ───
# (optional — leave templates: [] to skip image generation)
images:
  templates:
    - name: string                     # e.g., "hero", "og-image"
      baseImage: string                # (optional) Path to base image file. Omit for solid color canvas
      width: number                    # Output width in pixels
      height: number                   # Output height in pixels
      overlays:
        - type: text | image
          # Text overlay:
          content: string              # Text with {{variable}} interpolation
          fontSize: number             # (optional)
          fontColor: string            # (optional) Hex color e.g., "#ffffff"
          x: number                    # X position in pixels
          y: number                    # Y position in pixels
          maxWidth: number             # (optional) Text wrapping boundary
          # Image overlay:
          source: string               # Path to image file
          width: number                # (optional) Resize width
          height: number               # (optional) Resize height
          x: number
          y: number
  outputFormats:
    - webp                             # Recommended — smaller files
    - png                              # Fallback format
  quality: 80                          # WebP quality (1-100)

# ─── AI Provider Configuration ───
ai:
  defaultProvider: openai | anthropic
  concurrency: number                  # Max parallel API calls (default: 5, use 3 for rate limit safety)
  cache: boolean                       # Cache AI responses (default: true — saves money on rebuilds)
  cacheTtlDays: number                 # Cache expiry in days (default: 30)
  providers:
    openai:                            # (optional — include if using OpenAI)
      model: string                    # e.g., "gpt-4o-mini" (cheap, fast), "gpt-4o" (better quality)
      apiKeyEnv: OPENAI_API_KEY        # Name of env var containing the API key
    anthropic:                         # (optional — include if using Anthropic)
      model: string                    # e.g., "claude-sonnet-4-5-20241022", "claude-haiku-4-5-20241022"
      apiKeyEnv: ANTHROPIC_API_KEY

# ─── SEO Settings ───
seo:
  siteName: string                     # Used in structured data and OG tags
  defaultOgImage: string               # (optional) Fallback OG image path
  schemaTypes:                         # JSON-LD structured data types to generate
    - WebPage                          # Always include
    - BreadcrumbList                   # Always include
    - FAQPage                          # Include if you have FAQ blocks
    - Product                          # Include if pages are product-focused
  internalLinking:
    enabled: boolean                   # Auto-link pages sharing dimension values
    maxLinksPerPage: number            # Max internal links per page (default: 10)
    strategy: shared-dimension         # Only supported strategy currently

# ─── Audit Thresholds ───
audit:
  uniquenessThreshold: number          # Max allowed similarity between pages (0.0-1.0, default: 0.30)
  minWordCount: number                 # Minimum words per page (default: 300)
  validateStructuredData: boolean      # Validate JSON-LD on audit
```

## Template Variables Available in Prompts and Templates

Inside `{{...}}` in prompt strings, static template strings, and .njk files:

| Variable | Description | Example |
|---|---|---|
| `dimensions.<name>` | Value of a keyword dimension | `{{dimensions.product}}` → "CRM Software" |
| `dimensions.<name>_<column>` | CSV metadata column for a dimension | `{{dimensions.product_description}}` |
| `data.<key>` | Merged external data for this entry | `{{data.price}}` |
| `page.title` | Rendered page title (from pattern) | In .njk templates only |
| `page.description` | Rendered meta description | In .njk templates only |
| `page.entry.slug` | URL slug | In .njk templates only |
| `page.entry.url` | Full URL path | In .njk templates only |
| `page.content.<block_name>` | Rendered HTML of a content block | In .njk templates only |
| `page.seo.*` | SEO metadata (title, canonical, ogTags, etc.) | In .njk templates only |
| `page.internalLinks` | Array of `{targetUrl, anchorText, relationship}` | In .njk templates only |

## Writing Effective AI Prompts

### Prompt Guidelines

1. **Be specific about format** — Tell the LLM exactly what HTML tags to use: "Format as HTML with `<h2>` heading and `<p>` tags"
2. **Reference dimensions** — Use `{{dimensions.X}}` so each page gets unique content: "Write about {{dimensions.product}} for {{dimensions.use_case}}"
3. **Specify word count** — "Write 200 words..." and back it up with `rules.minWords`/`maxWords`
4. **Set the audience** — "The reader is a {{dimensions.use_case}} evaluating options..."
5. **Forbid generic filler** — "Be specific and practical, not generic. Include concrete examples"
6. **Request structured output** — Tables, numbered lists, and sections make pages more useful for SEO

### Recommended Block Structure for Landing Pages

A high-quality SEO landing page typically needs these content blocks:

```yaml
blocks:
  # 1. Hero / intro — static is fine, sets context
  - name: hero
    type: static
    template: '<p class="lead">Updated for 2026 — independently researched.</p>'

  # 2. Introduction — AI-generated, ~150 words
  - name: introduction
    type: ai
    ai:
      prompt: >
        Write a 150-word introduction for "Best {{dimensions.product}} for
        {{dimensions.use_case}}". Address the reader's pain points and what
        this guide covers. Use <p> tags only. Second person voice.
      maxTokens: 400
    rules:
      minWords: 100
      maxWords: 250

  # 3. Feature breakdown — AI-generated, ~300 words
  - name: features
    type: ai
    ai:
      prompt: >
        Write a "Key Features to Look For" section for {{dimensions.product}}
        for {{dimensions.use_case}}. List 5-6 features with <h3> headings
        and <p> explanations specific to this audience.
      maxTokens: 800
    rules:
      minWords: 200
      maxWords: 500

  # 4. Comparison table — AI-generated
  - name: comparison
    type: ai
    ai:
      prompt: >
        Create a comparison of the top 3-4 {{dimensions.product}} options
        for {{dimensions.use_case}}. Format as <h2>Top Picks</h2> followed
        by an HTML <table> with columns: Product, Best For, Strength,
        Limitation, Starting Price. Use real products and realistic pricing.
      temperature: 0.5
      maxTokens: 600

  # 5. Buying guide — AI-generated, ~200 words
  - name: buying_guide
    type: ai
    ai:
      prompt: >
        Write a 200-word "How to Choose" guide for {{dimensions.product}}
        for {{dimensions.use_case}}. Cover budget, must-haves vs nice-to-haves,
        and common mistakes. <h2> heading and <p> tags.
      maxTokens: 500
    rules:
      minWords: 150
      maxWords: 350

  # 6. FAQ — AI-generated
  - name: faq
    type: ai
    ai:
      prompt: >
        Write 4 FAQs about choosing {{dimensions.product}} for
        {{dimensions.use_case}}. Format: <div class="faq"><h2>FAQ</h2>
        then <h3> for each question, <p> for each answer (2-3 sentences).
      maxTokens: 500

  # 7. CTA — static
  - name: cta
    type: static
    template: |
      <div class="cta-section">
        <h2>Ready to Choose?</h2>
        <a href="/contact" class="cta-button">Get Started</a>
      </div>
```

## CSV Data Sources

Dimensions can load values from CSV files:

```yaml
matrix:
  dimensions:
    industry:
      source: data/industries.csv
      column: name
```

Given `data/industries.csv`:
```csv
name,slug,description,avg_revenue
Healthcare,healthcare,"Hospitals and clinics",500000
Finance,finance,"Banks and fintech",1200000
Retail,retail,"Physical and e-commerce stores",350000
```

The `name` column becomes dimension values. All other columns are available as metadata:
- In prompts: `{{dimensions.industry}}` gives the name, and additional data is available via `{{data.slug}}`, `{{data.description}}`, `{{data.avg_revenue}}`
- This means you can write prompts like: "Write about {{dimensions.product}} for the {{dimensions.industry}} industry, where the average company revenue is {{data.avg_revenue}}"

## Filtering Combinations

Remove nonsensical keyword combinations:

```yaml
filters:
  - type: exclude
    condition: "industry == 'Healthcare' && product == 'Gaming Software'"
  - type: exclude
    condition: "location == 'Antarctica'"
  - type: include
    condition: "tier == 'enterprise'"    # Only keep enterprise tier
```

Operators: `==`, `!=`, `&&`, `||`. Values must be quoted strings.

## Cost Estimation

Each `type: ai` block makes one API call per page.

| Model | Cost per 1K input tokens | Cost per 1K output tokens | ~Cost per page (5 AI blocks) |
|---|---|---|---|
| gpt-4o-mini | $0.00015 | $0.0006 | ~$0.002 |
| gpt-4o | $0.0025 | $0.01 | ~$0.03 |
| claude-haiku-4-5-20241022 | $0.0008 | $0.004 | ~$0.01 |
| claude-sonnet-4-5-20241022 | $0.003 | $0.015 | ~$0.05 |

At 1,000 pages with 5 AI blocks using gpt-4o-mini: **~$2 total**.

Responses are cached in `.seo-cache/ai-cache/`, so rebuilds don't re-call the API.

## Common Patterns

### Location-based service pages
```yaml
# "plumber in {city}" × 500 cities
dimensions:
  service:
    values: [Plumber, Electrician, HVAC Repair]
  city:
    source: data/cities.csv
    column: name
pattern:
  url: "{{service}}-in-{{city}}"
  title: "Best {{service}} in {{city}} — Rated & Reviewed"
```

### Product comparison pages
```yaml
# "best {product} for {use_case}"
dimensions:
  product:
    values: [CRM, Project Management, Accounting Software]
  use_case:
    values: [Small Business, Enterprise, Freelancers, Nonprofits]
pattern:
  url: "best-{{product}}-for-{{use_case}}"
  title: "Best {{product}} for {{use_case}} in 2026"
```

### Affiliate/review pages
```yaml
# "{product} review" and "{product} vs {product}" pages
dimensions:
  product:
    source: data/products.csv
    column: name
  angle:
    values: [Review, Pricing, Features, Alternatives]
pattern:
  url: "{{product}}-{{angle}}"
  title: "{{product}} {{angle}} (2026) — Honest Assessment"
```

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| "ENOENT config.yaml" | Not in project directory | `cd` into the project directory first |
| Pages have no AI content | All blocks are `type: static` | Change blocks to `type: ai` with prompts |
| "API key not found" | Missing `.env` or wrong env var name | Check `.env` exists and `apiKeyEnv` matches |
| High similarity in audit | Templates too similar across pages | Add more AI blocks, use dimension-specific prompts |
| Thin content warning | Pages have fewer than 300 words | Add more content blocks or increase prompt word targets |
| Build is slow | Too many concurrent API calls | Reduce `ai.concurrency` to 3 |
