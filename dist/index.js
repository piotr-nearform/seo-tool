// src/schemas/index.ts
import { z } from "zod/v4";
var DimensionDefSchema = z.object({
  values: z.array(z.string()).min(1),
  source: z.string().optional(),
  column: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});
var FilterRuleSchema = z.object({
  type: z.enum(["include", "exclude"]),
  condition: z.string()
});
var MatrixConfigSchema = z.object({
  dimensions: z.record(z.string(), DimensionDefSchema),
  pattern: z.object({
    url: z.string(),
    title: z.string(),
    description: z.string()
  }),
  filters: z.array(FilterRuleSchema)
});
var ContentRulesSchema = z.object({
  minWords: z.number().optional(),
  maxWords: z.number().optional(),
  requiredKeywords: z.array(z.string()).optional(),
  tone: z.string().optional()
});
var AIBlockConfigSchema = z.object({
  prompt: z.string(),
  provider: z.enum(["openai", "anthropic"]).optional(),
  model: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional()
});
var ContentBlockConfigSchema = z.object({
  name: z.string(),
  type: z.enum(["static", "ai"]),
  template: z.string().optional(),
  ai: AIBlockConfigSchema.optional(),
  rules: ContentRulesSchema.optional()
});
var PageTemplateConfigSchema = z.object({
  name: z.string(),
  file: z.string(),
  format: z.enum(["nunjucks", "markdown"]),
  blocks: z.array(ContentBlockConfigSchema)
});
var TemplateConfigSchema = z.object({
  layout: z.string(),
  pages: z.array(PageTemplateConfigSchema)
});
var ImageOverlaySchema = z.object({
  type: z.enum(["text", "image"]),
  content: z.string().optional(),
  font: z.string().optional(),
  fontSize: z.number().optional(),
  fontColor: z.string().optional(),
  x: z.number(),
  y: z.number(),
  maxWidth: z.number().optional(),
  source: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional()
});
var ImageTemplateConfigSchema = z.object({
  name: z.string(),
  baseImage: z.string(),
  width: z.number(),
  height: z.number(),
  overlays: z.array(ImageOverlaySchema)
});
var ImageConfigSchema = z.object({
  templates: z.array(ImageTemplateConfigSchema),
  outputFormats: z.array(z.enum(["webp", "png"])),
  quality: z.number()
});
var SEOConfigSchema = z.object({
  siteName: z.string(),
  defaultOgImage: z.string().optional(),
  schemaTypes: z.array(z.enum(["Product", "FAQPage", "BreadcrumbList", "WebPage"])),
  internalLinking: z.object({
    enabled: z.boolean(),
    maxLinksPerPage: z.number(),
    strategy: z.literal("shared-dimension")
  })
});
var AuditConfigSchema = z.object({
  uniquenessThreshold: z.number(),
  minWordCount: z.number(),
  validateStructuredData: z.boolean()
});
var AIConfigSchema = z.object({
  defaultProvider: z.enum(["openai", "anthropic"]),
  concurrency: z.number(),
  cache: z.boolean(),
  cacheTtlDays: z.number(),
  providers: z.object({
    openai: z.object({
      model: z.string(),
      apiKeyEnv: z.string()
    }).optional(),
    anthropic: z.object({
      model: z.string(),
      apiKeyEnv: z.string()
    }).optional()
  })
});
var PageEntrySchema = z.object({
  id: z.string(),
  slug: z.string(),
  url: z.string(),
  title: z.string(),
  description: z.string(),
  dimensions: z.record(z.string(), z.string()),
  data: z.record(z.string(), z.unknown()),
  inputHash: z.string()
});
var ProjectConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  baseUrl: z.string(),
  outputDir: z.string(),
  outputStructure: z.enum(["flat", "nested"]),
  matrix: MatrixConfigSchema,
  templates: TemplateConfigSchema,
  images: ImageConfigSchema,
  ai: AIConfigSchema,
  seo: SEOConfigSchema,
  audit: AuditConfigSchema
});
var PageSEODataSchema = z.object({
  title: z.string(),
  description: z.string(),
  canonical: z.string(),
  ogImage: z.string().optional(),
  schema: z.record(z.string(), z.unknown()).optional()
});
var PageDataSchema = z.object({
  entry: PageEntrySchema,
  content: z.record(z.string(), z.unknown()),
  seo: PageSEODataSchema
});
var ManifestEntrySchema = z.object({
  inputHash: z.string(),
  outputFiles: z.array(z.string()),
  builtAt: z.string(),
  contentHash: z.string()
});
var BuildManifestSchema = z.object({
  version: z.string(),
  builtAt: z.string(),
  configHash: z.string(),
  templateHash: z.string(),
  entries: z.record(z.string(), ManifestEntrySchema)
});
var PageReportSchema = z.object({
  url: z.string(),
  status: z.enum(["generated", "skipped", "error"]),
  wordCount: z.number(),
  fileSize: z.number(),
  uniquenessScore: z.number().optional(),
  warnings: z.array(z.string()),
  errors: z.array(z.string()),
  buildTimeMs: z.number()
});
var BuildReportSchema = z.object({
  summary: z.object({
    totalPages: z.number(),
    pagesGenerated: z.number(),
    pagesSkipped: z.number(),
    buildTimeMs: z.number(),
    aiApiCalls: z.number(),
    aiCacheHits: z.number(),
    warnings: z.number(),
    errors: z.number()
  }),
  pages: z.array(PageReportSchema)
});
var AuditReportSchema = z.object({
  summary: z.object({
    totalPages: z.number(),
    passedPages: z.number(),
    warnedPages: z.number(),
    failedPages: z.number(),
    averageUniqueness: z.number(),
    brokenLinks: z.number()
  }),
  checks: z.object({
    uniqueness: z.array(
      z.object({
        page: z.string(),
        score: z.number(),
        nearestSibling: z.string()
      })
    ),
    thinContent: z.array(
      z.object({
        page: z.string(),
        wordCount: z.number(),
        threshold: z.number()
      })
    ),
    brokenLinks: z.array(
      z.object({
        source: z.string(),
        target: z.string()
      })
    ),
    structuredData: z.array(
      z.object({
        page: z.string(),
        errors: z.array(z.string())
      })
    )
  })
});

// src/core/config.ts
import { readFile } from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import dotenv from "dotenv";
async function loadConfig(configPath) {
  const resolvedPath = configPath ?? path.resolve(process.cwd(), "config.yaml");
  const configDir = path.dirname(path.resolve(resolvedPath));
  dotenv.config({ path: path.join(configDir, ".env") });
  let raw;
  try {
    raw = await readFile(resolvedPath, "utf-8");
  } catch (err) {
    throw new Error(`Failed to read config file: ${resolvedPath}. ${err.message}`);
  }
  let parsed;
  try {
    parsed = yaml.load(raw);
  } catch (err) {
    throw new Error(`Failed to parse YAML in config file: ${resolvedPath}. ${err.message}`);
  }
  const result = ProjectConfigSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(`Invalid config in ${resolvedPath}:
${issues}`);
  }
  return result.data;
}

// src/cli/logger.ts
import pc from "picocolors";
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["Quiet"] = 0] = "Quiet";
  LogLevel2[LogLevel2["Default"] = 1] = "Default";
  LogLevel2[LogLevel2["Verbose"] = 2] = "Verbose";
  return LogLevel2;
})(LogLevel || {});
function createLogger(level = 1 /* Default */) {
  return {
    error(message) {
      console.error(pc.red(`[ERROR] ${message}`));
    },
    warn(message) {
      if (level >= 1 /* Default */) {
        console.warn(pc.yellow(`[WARN] ${message}`));
      }
    },
    info(message) {
      if (level >= 1 /* Default */) {
        console.log(pc.cyan(`[INFO] ${message}`));
      }
    },
    debug(message) {
      if (level >= 2 /* Verbose */) {
        console.log(pc.gray(`[DEBUG] ${message}`));
      }
    },
    progress(current, total, label) {
      if (level >= 1 /* Default */) {
        console.log(pc.green(`[${current}/${total}] ${label}`));
      }
    }
  };
}
export {
  AIBlockConfigSchema,
  AIConfigSchema,
  AuditConfigSchema,
  AuditReportSchema,
  BuildManifestSchema,
  BuildReportSchema,
  ContentBlockConfigSchema,
  ContentRulesSchema,
  DimensionDefSchema,
  FilterRuleSchema,
  ImageConfigSchema,
  ImageOverlaySchema,
  ImageTemplateConfigSchema,
  LogLevel,
  ManifestEntrySchema,
  MatrixConfigSchema,
  PageDataSchema,
  PageEntrySchema,
  PageReportSchema,
  PageSEODataSchema,
  PageTemplateConfigSchema,
  ProjectConfigSchema,
  SEOConfigSchema,
  TemplateConfigSchema,
  createLogger,
  loadConfig
};
//# sourceMappingURL=index.js.map