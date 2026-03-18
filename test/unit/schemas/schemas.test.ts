import { describe, it, expect } from 'vitest';
import {
  ProjectConfigSchema,
  MatrixConfigSchema,
  DimensionDefSchema,
  FilterRuleSchema,
  PageEntrySchema,
  TemplateConfigSchema,
  PageTemplateConfigSchema,
  ContentBlockConfigSchema,
  AIBlockConfigSchema,
  ContentRulesSchema,
  ImageConfigSchema,
  ImageTemplateConfigSchema,
  ImageOverlaySchema,
  SEOConfigSchema,
  AuditConfigSchema,
  AIConfigSchema,
  BuildManifestSchema,
  BuildReportSchema,
  AuditReportSchema,
  PageDataSchema,
  PageSEODataSchema,
} from '../../../src/schemas/index.js';

describe('Zod Schemas', () => {
  describe('DimensionDefSchema', () => {
    it('should accept valid dimension definition', () => {
      const result = DimensionDefSchema.safeParse({
        values: ['new-york', 'los-angeles', 'chicago'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept dimension with source and metadata', () => {
      const result = DimensionDefSchema.safeParse({
        values: ['a', 'b'],
        source: 'cities.csv',
        column: 'name',
        metadata: { population: true },
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty values array', () => {
      const result = DimensionDefSchema.safeParse({
        values: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing values', () => {
      const result = DimensionDefSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('FilterRuleSchema', () => {
    it('should accept include filter', () => {
      const result = FilterRuleSchema.safeParse({
        type: 'include',
        condition: 'city !== "test"',
      });
      expect(result.success).toBe(true);
    });

    it('should accept exclude filter', () => {
      const result = FilterRuleSchema.safeParse({
        type: 'exclude',
        condition: 'city === "test"',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid filter type', () => {
      const result = FilterRuleSchema.safeParse({
        type: 'maybe',
        condition: 'x',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ContentRulesSchema', () => {
    it('should accept valid content rules', () => {
      const result = ContentRulesSchema.safeParse({
        minWords: 100,
        maxWords: 500,
        requiredKeywords: ['seo', 'marketing'],
        tone: 'professional',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty content rules', () => {
      const result = ContentRulesSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('AIBlockConfigSchema', () => {
    it('should accept valid AI block config', () => {
      const result = AIBlockConfigSchema.safeParse({
        prompt: 'Write about {{city}}',
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
      });
      expect(result.success).toBe(true);
    });

    it('should accept minimal AI block config', () => {
      const result = AIBlockConfigSchema.safeParse({
        prompt: 'Write something',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing prompt', () => {
      const result = AIBlockConfigSchema.safeParse({
        provider: 'openai',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid provider', () => {
      const result = AIBlockConfigSchema.safeParse({
        prompt: 'test',
        provider: 'google',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ContentBlockConfigSchema', () => {
    it('should accept static block', () => {
      const result = ContentBlockConfigSchema.safeParse({
        name: 'intro',
        type: 'static',
        template: 'Welcome to {{city}}',
      });
      expect(result.success).toBe(true);
    });

    it('should accept AI block', () => {
      const result = ContentBlockConfigSchema.safeParse({
        name: 'body',
        type: 'ai',
        ai: {
          prompt: 'Write about {{city}}',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject unknown block type', () => {
      const result = ContentBlockConfigSchema.safeParse({
        name: 'body',
        type: 'dynamic',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ImageOverlaySchema', () => {
    it('should accept text overlay', () => {
      const result = ImageOverlaySchema.safeParse({
        type: 'text',
        content: '{{city}}',
        font: 'Arial',
        fontSize: 48,
        fontColor: '#ffffff',
        x: 100,
        y: 200,
        maxWidth: 800,
      });
      expect(result.success).toBe(true);
    });

    it('should accept image overlay', () => {
      const result = ImageOverlaySchema.safeParse({
        type: 'image',
        source: 'logo.png',
        x: 10,
        y: 10,
        width: 100,
        height: 50,
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing coordinates', () => {
      const result = ImageOverlaySchema.safeParse({
        type: 'text',
        content: 'hello',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ImageTemplateConfigSchema', () => {
    it('should accept valid image template', () => {
      const result = ImageTemplateConfigSchema.safeParse({
        name: 'og-image',
        baseImage: 'templates/og-bg.png',
        width: 1200,
        height: 630,
        overlays: [
          { type: 'text', content: '{{title}}', x: 100, y: 200 },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('ImageConfigSchema', () => {
    it('should accept valid image config', () => {
      const result = ImageConfigSchema.safeParse({
        templates: [
          {
            name: 'og-image',
            baseImage: 'bg.png',
            width: 1200,
            height: 630,
            overlays: [],
          },
        ],
        outputFormats: ['webp', 'png'],
        quality: 85,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid output format', () => {
      const result = ImageConfigSchema.safeParse({
        templates: [],
        outputFormats: ['jpg'],
        quality: 85,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('SEOConfigSchema', () => {
    it('should accept valid SEO config', () => {
      const result = SEOConfigSchema.safeParse({
        siteName: 'My Site',
        defaultOgImage: '/og.png',
        schemaTypes: ['WebPage', 'FAQPage'],
        internalLinking: {
          enabled: true,
          maxLinksPerPage: 5,
          strategy: 'shared-dimension',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid schema type', () => {
      const result = SEOConfigSchema.safeParse({
        siteName: 'My Site',
        schemaTypes: ['InvalidType'],
        internalLinking: {
          enabled: true,
          maxLinksPerPage: 5,
          strategy: 'shared-dimension',
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('AuditConfigSchema', () => {
    it('should accept valid audit config', () => {
      const result = AuditConfigSchema.safeParse({
        uniquenessThreshold: 0.7,
        minWordCount: 300,
        validateStructuredData: true,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('AIConfigSchema', () => {
    it('should accept valid AI config', () => {
      const result = AIConfigSchema.safeParse({
        defaultProvider: 'openai',
        concurrency: 5,
        cache: true,
        cacheTtlDays: 7,
        providers: {
          openai: { model: 'gpt-4', apiKeyEnv: 'OPENAI_API_KEY' },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept config with both providers', () => {
      const result = AIConfigSchema.safeParse({
        defaultProvider: 'anthropic',
        concurrency: 3,
        cache: false,
        cacheTtlDays: 1,
        providers: {
          openai: { model: 'gpt-4', apiKeyEnv: 'OPENAI_API_KEY' },
          anthropic: { model: 'claude-3', apiKeyEnv: 'ANTHROPIC_API_KEY' },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid provider name', () => {
      const result = AIConfigSchema.safeParse({
        defaultProvider: 'google',
        concurrency: 1,
        cache: false,
        cacheTtlDays: 1,
        providers: {},
      });
      expect(result.success).toBe(false);
    });
  });

  describe('MatrixConfigSchema', () => {
    it('should accept valid matrix config', () => {
      const result = MatrixConfigSchema.safeParse({
        dimensions: {
          city: { values: ['new-york', 'chicago'] },
          service: { values: ['plumbing', 'electrical'] },
        },
        pattern: {
          url: '/{{city}}/{{service}}',
          title: '{{service}} in {{city}}',
          description: 'Find {{service}} services in {{city}}.',
        },
        filters: [],
      });
      expect(result.success).toBe(true);
    });

    it('should accept matrix with filters', () => {
      const result = MatrixConfigSchema.safeParse({
        dimensions: {
          city: { values: ['ny'] },
        },
        pattern: { url: '/{{city}}', title: '{{city}}', description: '{{city}}' },
        filters: [{ type: 'exclude', condition: 'city === "test"' }],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('PageTemplateConfigSchema', () => {
    it('should accept valid page template config', () => {
      const result = PageTemplateConfigSchema.safeParse({
        name: 'city-service',
        file: 'templates/city-service.njk',
        format: 'nunjucks',
        blocks: [
          { name: 'intro', type: 'static', template: 'Hello {{city}}' },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid format', () => {
      const result = PageTemplateConfigSchema.safeParse({
        name: 'test',
        file: 'test.html',
        format: 'html',
        blocks: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('TemplateConfigSchema', () => {
    it('should accept valid template config', () => {
      const result = TemplateConfigSchema.safeParse({
        layout: 'templates/layout.njk',
        pages: [
          {
            name: 'main',
            file: 'templates/main.njk',
            format: 'nunjucks',
            blocks: [],
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('PageEntrySchema', () => {
    it('should accept valid page entry', () => {
      const result = PageEntrySchema.safeParse({
        id: 'new-york-plumbing',
        slug: 'new-york-plumbing',
        url: '/new-york/plumbing',
        title: 'Plumbing in New York',
        description: 'Find plumbing services in New York.',
        dimensions: { city: 'new-york', service: 'plumbing' },
        data: {},
        inputHash: 'abc123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const result = PageEntrySchema.safeParse({
        id: 'test',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ProjectConfigSchema', () => {
    const validConfig = {
      name: 'my-seo-project',
      version: '1.0.0',
      baseUrl: 'https://example.com',
      outputDir: 'dist',
      outputStructure: 'nested' as const,
      matrix: {
        dimensions: {
          city: { values: ['new-york'] },
        },
        pattern: {
          url: '/{{city}}',
          title: '{{city}}',
          description: 'About {{city}}',
        },
        filters: [],
      },
      templates: {
        layout: 'templates/layout.njk',
        pages: [
          {
            name: 'main',
            file: 'templates/main.njk',
            format: 'nunjucks' as const,
            blocks: [],
          },
        ],
      },
      images: {
        templates: [],
        outputFormats: ['webp' as const],
        quality: 80,
      },
      ai: {
        defaultProvider: 'openai' as const,
        concurrency: 3,
        cache: true,
        cacheTtlDays: 7,
        providers: {
          openai: { model: 'gpt-4', apiKeyEnv: 'OPENAI_API_KEY' },
        },
      },
      seo: {
        siteName: 'My Site',
        schemaTypes: ['WebPage' as const],
        internalLinking: {
          enabled: true,
          maxLinksPerPage: 5,
          strategy: 'shared-dimension' as const,
        },
      },
      audit: {
        uniquenessThreshold: 0.7,
        minWordCount: 300,
        validateStructuredData: true,
      },
    };

    it('should accept a complete valid config', () => {
      const result = ProjectConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should reject config with invalid outputStructure', () => {
      const result = ProjectConfigSchema.safeParse({
        ...validConfig,
        outputStructure: 'weird',
      });
      expect(result.success).toBe(false);
    });

    it('should reject config missing name', () => {
      const { name, ...rest } = validConfig;
      const result = ProjectConfigSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('should reject config missing baseUrl', () => {
      const { baseUrl, ...rest } = validConfig;
      const result = ProjectConfigSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });

  describe('PageDataSchema', () => {
    it('should accept valid page data', () => {
      const result = PageDataSchema.safeParse({
        entry: {
          id: 'test',
          slug: 'test',
          url: '/test',
          title: 'Test',
          description: 'Test page',
          dimensions: { city: 'ny' },
          data: {},
          inputHash: 'abc',
        },
        content: { intro: 'Hello' },
        seo: {
          title: 'Test',
          description: 'Test page',
          canonical: '/test',
          ogImage: '/og.png',
          schema: {},
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('PageSEODataSchema', () => {
    it('should accept valid SEO data', () => {
      const result = PageSEODataSchema.safeParse({
        title: 'Test',
        description: 'Test page',
        canonical: '/test',
        ogImage: '/og.png',
        schema: { '@type': 'WebPage' },
      });
      expect(result.success).toBe(true);
    });

    it('should accept minimal SEO data', () => {
      const result = PageSEODataSchema.safeParse({
        title: 'Test',
        description: 'Test page',
        canonical: '/test',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('BuildManifestSchema', () => {
    it('should accept valid build manifest', () => {
      const result = BuildManifestSchema.safeParse({
        version: '1.0.0',
        builtAt: '2024-01-01T00:00:00Z',
        configHash: 'abc123',
        templateHash: 'def456',
        entries: {
          'new-york-plumbing': {
            inputHash: 'abc',
            outputFiles: ['dist/new-york/plumbing/index.html'],
            builtAt: '2024-01-01T00:00:00Z',
            contentHash: 'ghi789',
          },
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('BuildReportSchema', () => {
    it('should accept valid build report', () => {
      const result = BuildReportSchema.safeParse({
        summary: {
          totalPages: 10,
          pagesGenerated: 8,
          pagesSkipped: 2,
          buildTimeMs: 5000,
          aiApiCalls: 16,
          aiCacheHits: 4,
          warnings: 1,
          errors: 0,
        },
        pages: [
          {
            url: '/new-york/plumbing',
            status: 'generated',
            wordCount: 500,
            fileSize: 12000,
            uniquenessScore: 0.85,
            warnings: [],
            errors: [],
            buildTimeMs: 200,
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('AuditReportSchema', () => {
    it('should accept valid audit report', () => {
      const result = AuditReportSchema.safeParse({
        summary: {
          totalPages: 10,
          passedPages: 8,
          warnedPages: 1,
          failedPages: 1,
          averageUniqueness: 0.82,
          brokenLinks: 0,
        },
        checks: {
          uniqueness: [
            { page: '/ny/plumbing', score: 0.85, nearestSibling: '/la/plumbing' },
          ],
          thinContent: [
            { page: '/ny/test', wordCount: 50, threshold: 300 },
          ],
          brokenLinks: [],
          structuredData: [
            { page: '/ny/plumbing', errors: [] },
          ],
        },
      });
      expect(result.success).toBe(true);
    });
  });
});
