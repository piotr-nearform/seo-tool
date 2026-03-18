import { describe, it, expect } from 'vitest';
import { assemblePage } from '../../../src/builder/page-assembler.js';
import { createEnvironment } from '../../../src/content/template-engine.js';
import type { PageData } from '../../../src/builder/types.js';
import type { PageEntry } from '../../../src/schemas/index.js';
import path from 'node:path';
import fs from 'node:fs';

function makePageData(overrides: Partial<PageData> = {}): PageData {
  return {
    entry: {
      id: 'test-page',
      slug: 'test-page',
      url: '/services/plumbing',
      title: 'Plumbing Services',
      description: 'Best plumbing services.',
      dimensions: { city: 'new-york' },
      data: {},
      inputHash: 'abc123',
    },
    content: {
      intro: '<p>Welcome to our plumbing page.</p>',
      body: '<p>We offer the best services.</p>',
    },
    assets: [{ path: '/images/hero.webp', type: 'image' }],
    seo: {
      title: 'Plumbing Services | ServicePro',
      description: 'Best plumbing services.',
      canonical: 'https://example.com/services/plumbing',
      ogTags: {
        'og:title': 'Plumbing Services',
        'og:description': 'Best plumbing services.',
        'og:url': 'https://example.com/services/plumbing',
        'og:type': 'website',
      },
      twitterTags: {
        'twitter:card': 'summary',
        'twitter:title': 'Plumbing Services',
        'twitter:description': 'Best plumbing services.',
      },
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Plumbing Services' },
      ],
      breadcrumbs: [
        { name: 'Home', url: 'https://example.com/' },
        { name: 'Services', url: 'https://example.com/services' },
        { name: 'Plumbing', url: 'https://example.com/services/plumbing' },
      ],
    },
    internalLinks: [
      { targetUrl: '/services/electrical', anchorText: 'Electrical Services', relationship: 'related' },
    ],
    ...overrides,
  };
}

describe('page-assembler', () => {
  describe('assemblePage', () => {
    it('should render a simple layout template with page data', async () => {
      const layout = `
<html>
<head><title>{{ page.seo.title }}</title></head>
<body>
<h1>{{ page.entry.title }}</h1>
{% for name, html in page.content %}
<div>{{ html | safe }}</div>
{% endfor %}
</body>
</html>`;

      const env = createEnvironment();
      const html = await assemblePage(makePageData(), layout, env);

      expect(html).toContain('<title>Plumbing Services | ServicePro</title>');
      expect(html).toContain('<h1>Plumbing Services</h1>');
      expect(html).toContain('<p>Welcome to our plumbing page.</p>');
      expect(html).toContain('<p>We offer the best services.</p>');
    });

    it('should render OG meta tags', async () => {
      const layout = `{% for key, value in page.seo.ogTags %}<meta property="{{ key }}" content="{{ value }}">
{% endfor %}`;

      const env = createEnvironment();
      const html = await assemblePage(makePageData(), layout, env);

      expect(html).toContain('<meta property="og:title" content="Plumbing Services">');
      expect(html).toContain('<meta property="og:type" content="website">');
    });

    it('should render JSON-LD scripts', async () => {
      const layout = `{% for item in page.seo.jsonLd %}<script type="application/ld+json">{{ item | dump | safe }}</script>
{% endfor %}`;

      const env = createEnvironment();
      const html = await assemblePage(makePageData(), layout, env);

      expect(html).toContain('<script type="application/ld+json">');
      expect(html).toContain('"@type":"WebPage"');
    });

    it('should render internal links', async () => {
      const layout = `{% for link in page.internalLinks %}<a href="{{ link.targetUrl }}">{{ link.anchorText }}</a>
{% endfor %}`;

      const env = createEnvironment();
      const html = await assemblePage(makePageData(), layout, env);

      expect(html).toContain('<a href="/services/electrical">Electrical Services</a>');
    });

    it('should render breadcrumbs', async () => {
      const layout = `{% for crumb in page.seo.breadcrumbs %}<a href="{{ crumb.url }}">{{ crumb.name }}</a>
{% endfor %}`;

      const env = createEnvironment();
      const html = await assemblePage(makePageData(), layout, env);

      expect(html).toContain('<a href="https://example.com/">Home</a>');
      expect(html).toContain('<a href="https://example.com/services/plumbing">Plumbing</a>');
    });
  });

  describe('default layout template', () => {
    const LAYOUT_PATH = path.resolve(
      import.meta.dirname,
      '../../../templates/scaffold/layout.njk',
    );

    it('should exist as a file', () => {
      expect(fs.existsSync(LAYOUT_PATH)).toBe(true);
    });

    it('should include viewport meta tag', async () => {
      const layout = fs.readFileSync(LAYOUT_PATH, 'utf-8');
      const env = createEnvironment();
      const html = await assemblePage(makePageData(), layout, env);

      expect(html).toContain('name="viewport"');
      expect(html).toContain('width=device-width');
    });

    it('should include responsive CSS', async () => {
      const layout = fs.readFileSync(LAYOUT_PATH, 'utf-8');
      const env = createEnvironment();
      const html = await assemblePage(makePageData(), layout, env);

      expect(html).toContain('box-sizing: border-box');
      expect(html).toContain('max-width: 100%');
    });

    it('should render complete HTML structure', async () => {
      const layout = fs.readFileSync(LAYOUT_PATH, 'utf-8');
      const env = createEnvironment();
      const html = await assemblePage(makePageData(), layout, env);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<head>');
      expect(html).toContain('<main>');
      expect(html).toContain('<footer>');
      expect(html).toContain('</html>');
    });

    it('should include JSON-LD script tags', async () => {
      const layout = fs.readFileSync(LAYOUT_PATH, 'utf-8');
      const env = createEnvironment();
      const html = await assemblePage(makePageData(), layout, env);

      expect(html).toContain('<script type="application/ld+json">');
    });

    it('should render content blocks', async () => {
      const layout = fs.readFileSync(LAYOUT_PATH, 'utf-8');
      const env = createEnvironment();
      const html = await assemblePage(makePageData(), layout, env);

      expect(html).toContain('Welcome to our plumbing page.');
      expect(html).toContain('We offer the best services.');
    });

    it('should render SEO meta tags', async () => {
      const layout = fs.readFileSync(LAYOUT_PATH, 'utf-8');
      const env = createEnvironment();
      const html = await assemblePage(makePageData(), layout, env);

      expect(html).toContain('<meta name="description"');
      expect(html).toContain('<link rel="canonical"');
      expect(html).toContain('og:title');
      expect(html).toContain('twitter:card');
    });
  });
});
