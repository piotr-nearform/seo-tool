import { z } from 'zod/v4';

// --- Dimension & Filter ---

export const DimensionDefSchema = z.object({
  values: z.array(z.string()).min(1),
  source: z.string().optional(),
  column: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type DimensionDef = z.infer<typeof DimensionDefSchema>;

export const FilterRuleSchema = z.object({
  type: z.enum(['include', 'exclude']),
  condition: z.string(),
});
export type FilterRule = z.infer<typeof FilterRuleSchema>;

// --- Matrix ---

export const MatrixConfigSchema = z.object({
  dimensions: z.record(z.string(), DimensionDefSchema),
  pattern: z.object({
    url: z.string(),
    title: z.string(),
    description: z.string(),
  }),
  filters: z.array(FilterRuleSchema),
});
export type MatrixConfig = z.infer<typeof MatrixConfigSchema>;

// --- Content ---

export const ContentRulesSchema = z.object({
  minWords: z.number().optional(),
  maxWords: z.number().optional(),
  requiredKeywords: z.array(z.string()).optional(),
  tone: z.string().optional(),
});
export type ContentRules = z.infer<typeof ContentRulesSchema>;

export const AIBlockConfigSchema = z.object({
  prompt: z.string(),
  provider: z.enum(['openai', 'anthropic']).optional(),
  model: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
});
export type AIBlockConfig = z.infer<typeof AIBlockConfigSchema>;

export const ContentBlockConfigSchema = z.object({
  name: z.string(),
  type: z.enum(['static', 'ai']),
  template: z.string().optional(),
  ai: AIBlockConfigSchema.optional(),
  rules: ContentRulesSchema.optional(),
});
export type ContentBlockConfig = z.infer<typeof ContentBlockConfigSchema>;

// --- Templates ---

export const PageTemplateConfigSchema = z.object({
  name: z.string(),
  file: z.string(),
  format: z.enum(['nunjucks', 'markdown']),
  blocks: z.array(ContentBlockConfigSchema),
});
export type PageTemplateConfig = z.infer<typeof PageTemplateConfigSchema>;

export const TemplateConfigSchema = z.object({
  layout: z.string(),
  pages: z.array(PageTemplateConfigSchema),
});
export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;

// --- Images ---

export const ImageOverlaySchema = z.object({
  type: z.enum(['text', 'image']),
  content: z.string().optional(),
  font: z.string().optional(),
  fontSize: z.number().optional(),
  fontColor: z.string().optional(),
  x: z.number(),
  y: z.number(),
  maxWidth: z.number().optional(),
  source: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});
export type ImageOverlay = z.infer<typeof ImageOverlaySchema>;

export const ImageTemplateConfigSchema = z.object({
  name: z.string(),
  baseImage: z.string(),
  width: z.number(),
  height: z.number(),
  overlays: z.array(ImageOverlaySchema),
});
export type ImageTemplateConfig = z.infer<typeof ImageTemplateConfigSchema>;

export const ImageConfigSchema = z.object({
  templates: z.array(ImageTemplateConfigSchema),
  outputFormats: z.array(z.enum(['webp', 'png'])),
  quality: z.number(),
});
export type ImageConfig = z.infer<typeof ImageConfigSchema>;

// --- SEO ---

export const SEOConfigSchema = z.object({
  siteName: z.string(),
  defaultOgImage: z.string().optional(),
  schemaTypes: z.array(z.enum(['Product', 'FAQPage', 'BreadcrumbList', 'WebPage'])),
  internalLinking: z.object({
    enabled: z.boolean(),
    maxLinksPerPage: z.number(),
    strategy: z.literal('shared-dimension'),
  }),
});
export type SEOConfig = z.infer<typeof SEOConfigSchema>;

// --- Audit ---

export const AuditConfigSchema = z.object({
  uniquenessThreshold: z.number(),
  minWordCount: z.number(),
  validateStructuredData: z.boolean(),
});
export type AuditConfig = z.infer<typeof AuditConfigSchema>;

// --- AI ---

export const AIConfigSchema = z.object({
  defaultProvider: z.enum(['openai', 'anthropic']),
  concurrency: z.number(),
  cache: z.boolean(),
  cacheTtlDays: z.number(),
  providers: z.object({
    openai: z
      .object({
        model: z.string(),
        apiKeyEnv: z.string(),
      })
      .optional(),
    anthropic: z
      .object({
        model: z.string(),
        apiKeyEnv: z.string(),
      })
      .optional(),
  }),
});
export type AIConfig = z.infer<typeof AIConfigSchema>;

// --- Page Entry ---

export const PageEntrySchema = z.object({
  id: z.string(),
  slug: z.string(),
  url: z.string(),
  title: z.string(),
  description: z.string(),
  dimensions: z.record(z.string(), z.string()),
  data: z.record(z.string(), z.unknown()),
  inputHash: z.string(),
});
export type PageEntry = z.infer<typeof PageEntrySchema>;

// --- Project Config ---

export const ProjectConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  baseUrl: z.string(),
  outputDir: z.string(),
  outputStructure: z.enum(['flat', 'nested']),
  matrix: MatrixConfigSchema,
  templates: TemplateConfigSchema,
  images: ImageConfigSchema,
  ai: AIConfigSchema,
  seo: SEOConfigSchema,
  audit: AuditConfigSchema,
});
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

// --- Page Data & SEO Data ---

export const PageSEODataSchema = z.object({
  title: z.string(),
  description: z.string(),
  canonical: z.string(),
  ogImage: z.string().optional(),
  schema: z.record(z.string(), z.unknown()).optional(),
});
export type PageSEOData = z.infer<typeof PageSEODataSchema>;

export const PageDataSchema = z.object({
  entry: PageEntrySchema,
  content: z.record(z.string(), z.unknown()),
  seo: PageSEODataSchema,
});
export type PageData = z.infer<typeof PageDataSchema>;

// --- Build Manifest ---

export const ManifestEntrySchema = z.object({
  inputHash: z.string(),
  outputFiles: z.array(z.string()),
  builtAt: z.string(),
  contentHash: z.string(),
});
export type ManifestEntry = z.infer<typeof ManifestEntrySchema>;

export const BuildManifestSchema = z.object({
  version: z.string(),
  builtAt: z.string(),
  configHash: z.string(),
  templateHash: z.string(),
  entries: z.record(z.string(), ManifestEntrySchema),
});
export type BuildManifest = z.infer<typeof BuildManifestSchema>;

// --- Build Report ---

export const PageReportSchema = z.object({
  url: z.string(),
  status: z.enum(['generated', 'skipped', 'error']),
  wordCount: z.number(),
  fileSize: z.number(),
  uniquenessScore: z.number().optional(),
  warnings: z.array(z.string()),
  errors: z.array(z.string()),
  buildTimeMs: z.number(),
});
export type PageReport = z.infer<typeof PageReportSchema>;

export const BuildReportSchema = z.object({
  summary: z.object({
    totalPages: z.number(),
    pagesGenerated: z.number(),
    pagesSkipped: z.number(),
    buildTimeMs: z.number(),
    aiApiCalls: z.number(),
    aiCacheHits: z.number(),
    warnings: z.number(),
    errors: z.number(),
  }),
  pages: z.array(PageReportSchema),
});
export type BuildReport = z.infer<typeof BuildReportSchema>;

// --- Audit Report ---

export const AuditReportSchema = z.object({
  summary: z.object({
    totalPages: z.number(),
    passedPages: z.number(),
    warnedPages: z.number(),
    failedPages: z.number(),
    averageUniqueness: z.number(),
    brokenLinks: z.number(),
  }),
  checks: z.object({
    uniqueness: z.array(
      z.object({
        page: z.string(),
        score: z.number(),
        nearestSibling: z.string(),
      }),
    ),
    thinContent: z.array(
      z.object({
        page: z.string(),
        wordCount: z.number(),
        threshold: z.number(),
      }),
    ),
    brokenLinks: z.array(
      z.object({
        source: z.string(),
        target: z.string(),
      }),
    ),
    structuredData: z.array(
      z.object({
        page: z.string(),
        errors: z.array(z.string()),
      }),
    ),
  }),
});
export type AuditReport = z.infer<typeof AuditReportSchema>;
