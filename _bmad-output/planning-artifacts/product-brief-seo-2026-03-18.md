---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
date: 2026-03-18
author: Pete
---

# Product Brief: seo

## Executive Summary

Businesses chasing long-tail search traffic face a brutal choice: manually craft hundreds of landing pages (expensive, slow) or use SaaS platforms that charge per page, lock you into their ecosystem, and produce generic content that Google increasingly penalizes. The programmatic SEO space has matured rapidly, but the tooling remains fragmented across expensive subscriptions — SEOmatic for templating, Surfer for optimization, Unbounce for landing pages, Airtable for data — with no unified, self-hosted solution that handles the full pipeline from keyword matrix to published page.

**seo** is a self-hosted, open-source system for generating conversion-focused SEO landing pages at scale. It programmatically combines keyword variations (head terms + modifiers), structured content templates, and dynamic visual assets to produce ready-to-deploy pages targeting long-tail search intent. The system turns a keyword database and content strategy into thousands of unique, product-driven landing pages without ongoing SaaS costs or vendor lock-in.

The core insight: most programmatic SEO failures (estimated at 60% of implementations) stem from producing thin, templated pages that add no unique value. **seo** addresses this by combining structured data, AI-augmented content generation, and dynamic visual asset composition to ensure each page delivers genuine value to searchers while maintaining production-line efficiency.

## Core Vision

### Problem Statement

Marketing teams and solo operators who want to capture long-tail search traffic face compounding problems:

- **Manual page creation doesn't scale.** A single landing page takes 2-4 hours to research, write, design, and publish. Targeting 500 keyword variations means 1,000-2,000 hours of work.
- **Existing pSEO tools are expensive and fragmented.** SEOmatic starts at $41/month, Surfer at $99/month, Byword at $99-$1,999/month. A full stack of tools easily runs $300-500/month before producing a single page.
- **Template-only approaches produce thin content.** Google's Helpful Content updates aggressively demote pages that are obviously templated with swapped keywords and no substantive differentiation. Most pSEO implementations fail because they produce pages that look and read identically.
- **No visual asset pipeline exists.** Existing tools focus on text. Nobody addresses the need for unique hero images, comparison graphics, or product-specific visuals that make pages convert — not just rank.
- **Vendor lock-in is pervasive.** SaaS platforms own your page infrastructure. Migrating away from Unbounce or Webflow means rebuilding everything from scratch.

### Impact

The global SEO services market reached approximately $83-93 billion in 2025 and is growing at 13-17% CAGR, with projections reaching $148-204 billion by 2030-2031. The digital content creation market alone is valued at $36.4 billion, heading toward $70 billion by 2030.

Within this, programmatic SEO is one of the fastest-growing segments because it directly addresses the economics of content production. Companies like Zapier, TripAdvisor, and Nomadlist have demonstrated that programmatic page generation can capture massive organic traffic — Zapier generates pages for every possible integration combination, creating tens of thousands of indexed pages from structured data.

The opportunity for a self-hosted solution is significant: small-to-mid businesses and solo operators are priced out of enterprise pSEO tooling but have the same need for scalable organic traffic. An open-source tool that eliminates the $300-500/month SaaS stack addresses a market segment that current tools ignore.

### Why Existing Solutions Fall Short

**SEOmatic ($41+/month)** — The closest direct competitor. Turns structured data into templated pages and publishes to various CMSs. However, it's a hosted SaaS with per-page economics, limited visual asset generation, and no built-in content differentiation beyond AI copy prompts referencing dataset fields. You're renting infrastructure, not owning it.

**Byword AI ($99-$1,999/month)** — Focused on full-article generation rather than structured landing pages. Strong on SEO workflow automation (keyword research, GSC integration, internal linking) but not designed for product-driven conversion pages. Pricing scales steeply — the Scale plan at $999/month puts it out of reach for most solo operators.

**Surfer SEO ($99-$219/month)** — Excellent content optimization and SERP analysis but fundamentally a content editor, not a page generation system. It tells you what to write, not how to build and deploy pages at scale. No programmatic generation pipeline.

**Unbounce ($99+/month)** — Landing page builder with strong conversion optimization (Smart Traffic AI routing). But it's designed for paid traffic campaigns, not organic SEO. Pages are often noindexed to avoid duplicate content issues. No structured data pipeline, no keyword matrix support.

**DIY with Airtable + Make + Webflow** — The "duct tape" approach many practitioners use today. Airtable holds the data, Make automates the workflow, Webflow renders the pages. It works but is fragile, expensive in aggregate ($50-150/month across tools), and requires significant technical setup with no visual asset generation.

**Open-source alternatives** — Tools like RustySEO, SerpBear, and ContentSwift address specific pieces (auditing, rank tracking, content research) but nothing provides an end-to-end programmatic page generation pipeline. There is a clear gap in the open-source ecosystem for a self-hosted pSEO page builder.

### Proposed Solution

**seo** is a CLI-first, self-hosted system that takes three inputs and produces deployment-ready landing pages:

1. **Keyword Matrix** — A structured combination of head terms, modifiers, and location/attribute variations that define the page universe (e.g., "best {product} for {use-case} in {location}").
2. **Content Templates** — Structured content blocks (hero, features, comparisons, FAQs, CTAs) with AI-augmented generation that produces genuinely differentiated copy per page, not just variable substitution.
3. **Visual Asset Pipeline** — Programmatic generation of page-specific images, comparison graphics, and product visuals using templated compositions with dynamic data overlays.

The system outputs static HTML pages (or headless CMS-compatible JSON) ready for deployment to any hosting infrastructure — Netlify, Vercel, Cloudflare Pages, a simple Apache/Nginx server, or integration into an existing site.

### Key Differentiators

- **Self-hosted and open-source.** Zero ongoing costs beyond hosting. Full ownership of the pipeline and output. No vendor lock-in.
- **Visual asset generation built in.** No other pSEO tool generates page-specific images and graphics as part of the pipeline. This is a significant ranking and conversion advantage.
- **Content differentiation by design.** AI-augmented content generation that goes beyond variable substitution — each page gets unique, contextually relevant copy sections that pass Google's helpful content standards.
- **Conversion-focused, not just traffic-focused.** Pages are designed around product-driven CTAs, not just information delivery. The goal is conversions, not just impressions.
- **Single-system pipeline.** Keyword matrix to published page in one tool, replacing a $300-500/month multi-tool stack.
- **Static output, deploy anywhere.** No runtime dependencies. Pages are pre-built and served from CDN, ensuring sub-second load times that boost both rankings and conversions.

## Target Users

### Primary Users

**Marcus — Solo SaaS Founder**
- Age 32, runs a B2B SaaS tool for inventory management
- Technical background (can use CLI tools, read JSON configs, deploy to Netlify)
- Wants to capture long-tail search traffic like "inventory management software for {industry}" across 50+ industries and 200+ use cases
- Currently paying $250/month across Surfer, Webflow, and a freelance writer; producing ~10 pages/month
- Pain: Can't afford to manually create the 2,000+ pages needed to cover his keyword space. Tried SEOmatic but the per-page costs add up and the output looks generic
- Motivation: Organic traffic is his most cost-effective acquisition channel but he's leaving 90% of the keyword opportunity on the table
- Success looks like: 500+ unique, indexed landing pages driving qualified trial signups within 3 months of deployment

**Priya — Agency SEO Strategist**
- Age 28, works at a 15-person digital marketing agency
- Manages pSEO campaigns for 5-8 clients simultaneously
- Strong SEO knowledge, moderate technical skills (comfortable with spreadsheets and basic scripting)
- Needs to produce location-based landing pages for service businesses (e.g., "plumber in {city}" x 500 cities per client)
- Pain: Each client needs 200-1,000 pages. Current workflow (Airtable + Make + WordPress) breaks constantly, takes 2 weeks to set up per client, and produces pages that look identical
- Motivation: Faster client delivery, better page quality, lower tool costs that improve margins
- Success looks like: New client page generation setup in 1 day instead of 2 weeks; pages that rank within 60 days

### Secondary Users

**Jake — Affiliate Marketer**
- Age 35, runs comparison and review sites across multiple niches
- Wants to generate "best {product} for {use-case}" pages at scale with dynamic comparison tables and product images
- Highly technical, comfortable with code and self-hosting
- Price-sensitive — currently spending $0 on tools and doing everything manually
- Motivation: Scale from 50 hand-crafted pages to 2,000+ programmatic pages without sacrificing the conversion rate that pays his bills

**Elena — E-commerce Marketing Manager**
- Age 40, manages SEO for a mid-size e-commerce brand with 3,000 SKUs
- Needs category and product landing pages optimized for long-tail product searches
- Less technical — would rely on documentation and GUI if available
- Motivation: Compete with larger retailers who have dedicated SEO engineering teams

### User Journeys

**Marcus's Journey (Primary)**

1. **Discovery:** Finds the project on GitHub while searching for open-source pSEO alternatives after his SEOmatic bill crosses $200/month
2. **Evaluation:** Reads the README, sees example output pages, and recognizes the keyword matrix approach matches his mental model of how he thinks about his keyword space
3. **Setup:** Clones the repo, installs dependencies (Node.js or Python runtime), runs the example project to generate 10 sample pages in under 5 minutes
4. **Configuration:** Defines his keyword matrix (50 industries x 40 use cases = 2,000 combinations), creates content templates for his landing page structure, adds his product data and CTAs
5. **Generation:** Runs the build command. System generates 2,000 unique pages with differentiated content and dynamic visuals. Build takes 15-30 minutes
6. **Review:** Spot-checks 20 pages for quality. Uses built-in quality report to flag thin or duplicate content. Adjusts templates for problem areas
7. **Deployment:** Pushes static output to Netlify. All 2,000 pages are live within minutes
8. **Iteration:** Monitors GSC data over 4-8 weeks. Uses keyword performance to refine templates and expand the matrix. Adds 500 more pages in the next cycle
9. **Success:** 6 months in, organic traffic has 4x'd. 15% of trial signups now come from programmatic pages. Total cost: $0/month in tooling

## Success Metrics

### User Success Metrics

- **Pages generated per hour:** Target 100+ pages per hour on consumer hardware (the build pipeline must be fast enough to iterate)
- **Content uniqueness score:** Each page should have >70% unique content vs. sibling pages (measured by Jaccard similarity across the generated corpus)
- **Time from zero to first 100 pages deployed:** Under 2 hours for a technical user following documentation
- **Indexation rate:** >90% of generated pages indexed by Google within 60 days (indicates quality threshold is met)
- **Bounce rate parity:** Programmatic pages should have bounce rates within 15% of hand-crafted equivalents

### Business Objectives

- **Adoption:** 500+ GitHub stars and 100+ active installations within 6 months of public launch
- **Community:** 20+ contributors submitting templates, content strategies, and integrations within the first year
- **Ecosystem:** Become the default open-source answer to "how do I do programmatic SEO" in developer and marketer communities
- **Strategic positioning:** Establish credibility for potential future premium offerings (managed hosting, enterprise features, template marketplace)

### KPIs

| Metric | Target (6 months) | Target (12 months) |
|---|---|---|
| GitHub stars | 500 | 2,000 |
| Monthly active users (self-reported/telemetry opt-in) | 100 | 500 |
| Pages generated (aggregate across users) | 50,000 | 500,000 |
| Average pages per project | 500 | 1,000 |
| Community-contributed templates | 10 | 50 |
| Documentation completeness | 80% | 95% |

## MVP Scope

### Core Features (Must Have)

1. **Keyword Matrix Engine**
   - Define head terms, modifiers, and variation dimensions in YAML/JSON config
   - Cartesian product generation with filtering rules (exclude nonsensical combinations)
   - Import from CSV for users migrating from spreadsheet-based workflows

2. **Content Template System**
   - Block-based page templates (hero, features, comparison, FAQ, CTA sections)
   - Variable interpolation from keyword matrix and data sources
   - AI content generation integration (OpenAI/Anthropic API) for producing unique paragraph-level content per page, not just keyword swaps
   - Markdown or HTML template format

3. **Dynamic Visual Asset Generator**
   - Template-based image composition (hero images, comparison charts, feature graphics)
   - Dynamic text overlay on base images using keyword/product data
   - Output optimized WebP/PNG assets per page
   - Support for product image integration from a local asset library

4. **Static Site Builder**
   - Generate static HTML pages from templates + data
   - Built-in SEO fundamentals: meta tags, Open Graph, structured data (JSON-LD), canonical URLs, sitemap.xml, robots.txt
   - Responsive, fast-loading output (target <50KB per page before images)
   - Internal linking engine that cross-links related pages automatically

5. **Quality Assurance Pipeline**
   - Content uniqueness checker across generated corpus
   - Thin content detector (flag pages below content thresholds)
   - Broken link checker for internal links
   - Build report with page-level quality scores

6. **CLI Interface**
   - `seo init` — scaffold a new project with example config
   - `seo build` — generate all pages
   - `seo preview` — local server to preview generated pages
   - `seo audit` — run quality checks on generated output
   - `seo export` — output to specified format/directory for deployment

### Out of Scope (v1)

- **Web-based GUI** — MVP is CLI-only. A web UI may come in v2 but adds massive scope
- **Built-in keyword research** — Users bring their own keyword strategy. Integration with keyword APIs (SEMrush, Ahrefs) is a future feature
- **CMS publishing integrations** — v1 outputs static files. Direct WordPress/Webflow/Shopify publishing is post-MVP
- **Real-time analytics integration** — No GSC or analytics dashboards built in. Users monitor performance with their existing tools
- **Multi-language support** — v1 is English-only. i18n templating is a v2 feature
- **Hosted/managed version** — This is self-hosted only in v1
- **A/B testing infrastructure** — Users can implement this at the CDN/hosting layer
- **Dynamic server-side rendering** — All output is static. No runtime application server

### Success Criteria for MVP

- A technical user can go from `git clone` to 100 deployed pages in under 2 hours
- Generated pages pass Google's Page Speed Insights with a score of 90+ on mobile
- Content uniqueness across generated pages exceeds 70% (not just keyword-swapped clones)
- The tool replaces a $300+/month SaaS stack for the primary use case (keyword matrix to deployed pages)
- At least 3 real-world projects use it to generate and deploy 500+ pages within the first month of release

### Future Vision

**v2 — Integration & Intelligence**
- Web-based project management UI
- Direct CMS publishing (WordPress, Webflow, Shopify, Ghost)
- Keyword research API integrations (SEMrush, Ahrefs, Google Keyword Planner)
- GSC performance feedback loop — automatically identify underperforming pages and suggest template/content improvements
- Template marketplace where users share and discover content strategies

**v3 — Optimization & Scale**
- Built-in A/B testing for content variations
- Automated content refresh based on SERP changes
- Multi-language page generation with locale-aware templates
- GEO (Generative Engine Optimization) — optimize pages for AI search engines (ChatGPT, Perplexity, Google AI Overviews)
- Enterprise features: team collaboration, approval workflows, brand guideline enforcement

**Long-term:** Become the infrastructure layer for programmatic SEO the way Hugo/Jekyll became the infrastructure for static blogs — the default open-source choice that a commercial ecosystem builds around.
