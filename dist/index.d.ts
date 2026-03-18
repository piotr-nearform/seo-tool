import { z } from 'zod/v4';

declare const DimensionDefSchema: z.ZodObject<{
    values: z.ZodArray<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    column: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
type DimensionDef = z.infer<typeof DimensionDefSchema>;
declare const FilterRuleSchema: z.ZodObject<{
    type: z.ZodEnum<{
        include: "include";
        exclude: "exclude";
    }>;
    condition: z.ZodString;
}, z.core.$strip>;
type FilterRule = z.infer<typeof FilterRuleSchema>;
declare const MatrixConfigSchema: z.ZodObject<{
    dimensions: z.ZodRecord<z.ZodString, z.ZodObject<{
        values: z.ZodArray<z.ZodString>;
        source: z.ZodOptional<z.ZodString>;
        column: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>>;
    pattern: z.ZodObject<{
        url: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
    }, z.core.$strip>;
    filters: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            include: "include";
            exclude: "exclude";
        }>;
        condition: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
type MatrixConfig = z.infer<typeof MatrixConfigSchema>;
declare const ContentRulesSchema: z.ZodObject<{
    minWords: z.ZodOptional<z.ZodNumber>;
    maxWords: z.ZodOptional<z.ZodNumber>;
    requiredKeywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
    tone: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type ContentRules = z.infer<typeof ContentRulesSchema>;
declare const AIBlockConfigSchema: z.ZodObject<{
    prompt: z.ZodString;
    provider: z.ZodOptional<z.ZodEnum<{
        openai: "openai";
        anthropic: "anthropic";
    }>>;
    model: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
type AIBlockConfig = z.infer<typeof AIBlockConfigSchema>;
declare const ContentBlockConfigSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<{
        static: "static";
        ai: "ai";
    }>;
    template: z.ZodOptional<z.ZodString>;
    ai: z.ZodOptional<z.ZodObject<{
        prompt: z.ZodString;
        provider: z.ZodOptional<z.ZodEnum<{
            openai: "openai";
            anthropic: "anthropic";
        }>>;
        model: z.ZodOptional<z.ZodString>;
        temperature: z.ZodOptional<z.ZodNumber>;
        maxTokens: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    rules: z.ZodOptional<z.ZodObject<{
        minWords: z.ZodOptional<z.ZodNumber>;
        maxWords: z.ZodOptional<z.ZodNumber>;
        requiredKeywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
        tone: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type ContentBlockConfig = z.infer<typeof ContentBlockConfigSchema>;
declare const PageTemplateConfigSchema: z.ZodObject<{
    name: z.ZodString;
    file: z.ZodString;
    format: z.ZodEnum<{
        nunjucks: "nunjucks";
        markdown: "markdown";
    }>;
    blocks: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<{
            static: "static";
            ai: "ai";
        }>;
        template: z.ZodOptional<z.ZodString>;
        ai: z.ZodOptional<z.ZodObject<{
            prompt: z.ZodString;
            provider: z.ZodOptional<z.ZodEnum<{
                openai: "openai";
                anthropic: "anthropic";
            }>>;
            model: z.ZodOptional<z.ZodString>;
            temperature: z.ZodOptional<z.ZodNumber>;
            maxTokens: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        rules: z.ZodOptional<z.ZodObject<{
            minWords: z.ZodOptional<z.ZodNumber>;
            maxWords: z.ZodOptional<z.ZodNumber>;
            requiredKeywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
            tone: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type PageTemplateConfig = z.infer<typeof PageTemplateConfigSchema>;
declare const TemplateConfigSchema: z.ZodObject<{
    layout: z.ZodString;
    pages: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        file: z.ZodString;
        format: z.ZodEnum<{
            nunjucks: "nunjucks";
            markdown: "markdown";
        }>;
        blocks: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<{
                static: "static";
                ai: "ai";
            }>;
            template: z.ZodOptional<z.ZodString>;
            ai: z.ZodOptional<z.ZodObject<{
                prompt: z.ZodString;
                provider: z.ZodOptional<z.ZodEnum<{
                    openai: "openai";
                    anthropic: "anthropic";
                }>>;
                model: z.ZodOptional<z.ZodString>;
                temperature: z.ZodOptional<z.ZodNumber>;
                maxTokens: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            rules: z.ZodOptional<z.ZodObject<{
                minWords: z.ZodOptional<z.ZodNumber>;
                maxWords: z.ZodOptional<z.ZodNumber>;
                requiredKeywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
                tone: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type TemplateConfig = z.infer<typeof TemplateConfigSchema>;
declare const ImageOverlaySchema: z.ZodObject<{
    type: z.ZodEnum<{
        text: "text";
        image: "image";
    }>;
    content: z.ZodOptional<z.ZodString>;
    font: z.ZodOptional<z.ZodString>;
    fontSize: z.ZodOptional<z.ZodNumber>;
    fontColor: z.ZodOptional<z.ZodString>;
    x: z.ZodNumber;
    y: z.ZodNumber;
    maxWidth: z.ZodOptional<z.ZodNumber>;
    source: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
type ImageOverlay = z.infer<typeof ImageOverlaySchema>;
declare const ImageTemplateConfigSchema: z.ZodObject<{
    name: z.ZodString;
    baseImage: z.ZodString;
    width: z.ZodNumber;
    height: z.ZodNumber;
    overlays: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            text: "text";
            image: "image";
        }>;
        content: z.ZodOptional<z.ZodString>;
        font: z.ZodOptional<z.ZodString>;
        fontSize: z.ZodOptional<z.ZodNumber>;
        fontColor: z.ZodOptional<z.ZodString>;
        x: z.ZodNumber;
        y: z.ZodNumber;
        maxWidth: z.ZodOptional<z.ZodNumber>;
        source: z.ZodOptional<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type ImageTemplateConfig = z.infer<typeof ImageTemplateConfigSchema>;
declare const ImageConfigSchema: z.ZodObject<{
    templates: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        baseImage: z.ZodString;
        width: z.ZodNumber;
        height: z.ZodNumber;
        overlays: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                text: "text";
                image: "image";
            }>;
            content: z.ZodOptional<z.ZodString>;
            font: z.ZodOptional<z.ZodString>;
            fontSize: z.ZodOptional<z.ZodNumber>;
            fontColor: z.ZodOptional<z.ZodString>;
            x: z.ZodNumber;
            y: z.ZodNumber;
            maxWidth: z.ZodOptional<z.ZodNumber>;
            source: z.ZodOptional<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    outputFormats: z.ZodArray<z.ZodEnum<{
        webp: "webp";
        png: "png";
    }>>;
    quality: z.ZodNumber;
}, z.core.$strip>;
type ImageConfig = z.infer<typeof ImageConfigSchema>;
declare const SEOConfigSchema: z.ZodObject<{
    siteName: z.ZodString;
    defaultOgImage: z.ZodOptional<z.ZodString>;
    schemaTypes: z.ZodArray<z.ZodEnum<{
        Product: "Product";
        FAQPage: "FAQPage";
        BreadcrumbList: "BreadcrumbList";
        WebPage: "WebPage";
    }>>;
    internalLinking: z.ZodObject<{
        enabled: z.ZodBoolean;
        maxLinksPerPage: z.ZodNumber;
        strategy: z.ZodLiteral<"shared-dimension">;
    }, z.core.$strip>;
}, z.core.$strip>;
type SEOConfig = z.infer<typeof SEOConfigSchema>;
declare const AuditConfigSchema: z.ZodObject<{
    uniquenessThreshold: z.ZodNumber;
    minWordCount: z.ZodNumber;
    validateStructuredData: z.ZodBoolean;
}, z.core.$strip>;
type AuditConfig = z.infer<typeof AuditConfigSchema>;
declare const AIConfigSchema: z.ZodObject<{
    defaultProvider: z.ZodEnum<{
        openai: "openai";
        anthropic: "anthropic";
    }>;
    concurrency: z.ZodNumber;
    cache: z.ZodBoolean;
    cacheTtlDays: z.ZodNumber;
    providers: z.ZodObject<{
        openai: z.ZodOptional<z.ZodObject<{
            model: z.ZodString;
            apiKeyEnv: z.ZodString;
        }, z.core.$strip>>;
        anthropic: z.ZodOptional<z.ZodObject<{
            model: z.ZodString;
            apiKeyEnv: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
type AIConfig = z.infer<typeof AIConfigSchema>;
declare const PageEntrySchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    url: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    dimensions: z.ZodRecord<z.ZodString, z.ZodString>;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    inputHash: z.ZodString;
}, z.core.$strip>;
type PageEntry = z.infer<typeof PageEntrySchema>;
declare const ProjectConfigSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    baseUrl: z.ZodString;
    outputDir: z.ZodString;
    outputStructure: z.ZodEnum<{
        flat: "flat";
        nested: "nested";
    }>;
    matrix: z.ZodObject<{
        dimensions: z.ZodRecord<z.ZodString, z.ZodObject<{
            values: z.ZodArray<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            column: z.ZodOptional<z.ZodString>;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        pattern: z.ZodObject<{
            url: z.ZodString;
            title: z.ZodString;
            description: z.ZodString;
        }, z.core.$strip>;
        filters: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                include: "include";
                exclude: "exclude";
            }>;
            condition: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    templates: z.ZodObject<{
        layout: z.ZodString;
        pages: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            file: z.ZodString;
            format: z.ZodEnum<{
                nunjucks: "nunjucks";
                markdown: "markdown";
            }>;
            blocks: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                type: z.ZodEnum<{
                    static: "static";
                    ai: "ai";
                }>;
                template: z.ZodOptional<z.ZodString>;
                ai: z.ZodOptional<z.ZodObject<{
                    prompt: z.ZodString;
                    provider: z.ZodOptional<z.ZodEnum<{
                        openai: "openai";
                        anthropic: "anthropic";
                    }>>;
                    model: z.ZodOptional<z.ZodString>;
                    temperature: z.ZodOptional<z.ZodNumber>;
                    maxTokens: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>>;
                rules: z.ZodOptional<z.ZodObject<{
                    minWords: z.ZodOptional<z.ZodNumber>;
                    maxWords: z.ZodOptional<z.ZodNumber>;
                    requiredKeywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    tone: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    images: z.ZodObject<{
        templates: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            baseImage: z.ZodString;
            width: z.ZodNumber;
            height: z.ZodNumber;
            overlays: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<{
                    text: "text";
                    image: "image";
                }>;
                content: z.ZodOptional<z.ZodString>;
                font: z.ZodOptional<z.ZodString>;
                fontSize: z.ZodOptional<z.ZodNumber>;
                fontColor: z.ZodOptional<z.ZodString>;
                x: z.ZodNumber;
                y: z.ZodNumber;
                maxWidth: z.ZodOptional<z.ZodNumber>;
                source: z.ZodOptional<z.ZodString>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        outputFormats: z.ZodArray<z.ZodEnum<{
            webp: "webp";
            png: "png";
        }>>;
        quality: z.ZodNumber;
    }, z.core.$strip>;
    ai: z.ZodObject<{
        defaultProvider: z.ZodEnum<{
            openai: "openai";
            anthropic: "anthropic";
        }>;
        concurrency: z.ZodNumber;
        cache: z.ZodBoolean;
        cacheTtlDays: z.ZodNumber;
        providers: z.ZodObject<{
            openai: z.ZodOptional<z.ZodObject<{
                model: z.ZodString;
                apiKeyEnv: z.ZodString;
            }, z.core.$strip>>;
            anthropic: z.ZodOptional<z.ZodObject<{
                model: z.ZodString;
                apiKeyEnv: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    seo: z.ZodObject<{
        siteName: z.ZodString;
        defaultOgImage: z.ZodOptional<z.ZodString>;
        schemaTypes: z.ZodArray<z.ZodEnum<{
            Product: "Product";
            FAQPage: "FAQPage";
            BreadcrumbList: "BreadcrumbList";
            WebPage: "WebPage";
        }>>;
        internalLinking: z.ZodObject<{
            enabled: z.ZodBoolean;
            maxLinksPerPage: z.ZodNumber;
            strategy: z.ZodLiteral<"shared-dimension">;
        }, z.core.$strip>;
    }, z.core.$strip>;
    audit: z.ZodObject<{
        uniquenessThreshold: z.ZodNumber;
        minWordCount: z.ZodNumber;
        validateStructuredData: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
declare const PageSEODataSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    canonical: z.ZodString;
    ogImage: z.ZodOptional<z.ZodString>;
    schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
type PageSEOData = z.infer<typeof PageSEODataSchema>;
declare const PageDataSchema: z.ZodObject<{
    entry: z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        url: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        dimensions: z.ZodRecord<z.ZodString, z.ZodString>;
        data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        inputHash: z.ZodString;
    }, z.core.$strip>;
    content: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    seo: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        canonical: z.ZodString;
        ogImage: z.ZodOptional<z.ZodString>;
        schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
type PageData = z.infer<typeof PageDataSchema>;
declare const ManifestEntrySchema: z.ZodObject<{
    inputHash: z.ZodString;
    outputFiles: z.ZodArray<z.ZodString>;
    builtAt: z.ZodString;
    contentHash: z.ZodString;
}, z.core.$strip>;
type ManifestEntry = z.infer<typeof ManifestEntrySchema>;
declare const BuildManifestSchema: z.ZodObject<{
    version: z.ZodString;
    builtAt: z.ZodString;
    configHash: z.ZodString;
    templateHash: z.ZodString;
    entries: z.ZodRecord<z.ZodString, z.ZodObject<{
        inputHash: z.ZodString;
        outputFiles: z.ZodArray<z.ZodString>;
        builtAt: z.ZodString;
        contentHash: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
type BuildManifest = z.infer<typeof BuildManifestSchema>;
declare const PageReportSchema: z.ZodObject<{
    url: z.ZodString;
    status: z.ZodEnum<{
        error: "error";
        generated: "generated";
        skipped: "skipped";
    }>;
    wordCount: z.ZodNumber;
    fileSize: z.ZodNumber;
    uniquenessScore: z.ZodOptional<z.ZodNumber>;
    warnings: z.ZodArray<z.ZodString>;
    errors: z.ZodArray<z.ZodString>;
    buildTimeMs: z.ZodNumber;
}, z.core.$strip>;
type PageReport = z.infer<typeof PageReportSchema>;
declare const BuildReportSchema: z.ZodObject<{
    summary: z.ZodObject<{
        totalPages: z.ZodNumber;
        pagesGenerated: z.ZodNumber;
        pagesSkipped: z.ZodNumber;
        buildTimeMs: z.ZodNumber;
        aiApiCalls: z.ZodNumber;
        aiCacheHits: z.ZodNumber;
        warnings: z.ZodNumber;
        errors: z.ZodNumber;
    }, z.core.$strip>;
    pages: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        status: z.ZodEnum<{
            error: "error";
            generated: "generated";
            skipped: "skipped";
        }>;
        wordCount: z.ZodNumber;
        fileSize: z.ZodNumber;
        uniquenessScore: z.ZodOptional<z.ZodNumber>;
        warnings: z.ZodArray<z.ZodString>;
        errors: z.ZodArray<z.ZodString>;
        buildTimeMs: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
type BuildReport = z.infer<typeof BuildReportSchema>;
declare const AuditReportSchema: z.ZodObject<{
    summary: z.ZodObject<{
        totalPages: z.ZodNumber;
        passedPages: z.ZodNumber;
        warnedPages: z.ZodNumber;
        failedPages: z.ZodNumber;
        averageUniqueness: z.ZodNumber;
        brokenLinks: z.ZodNumber;
    }, z.core.$strip>;
    checks: z.ZodObject<{
        uniqueness: z.ZodArray<z.ZodObject<{
            page: z.ZodString;
            score: z.ZodNumber;
            nearestSibling: z.ZodString;
        }, z.core.$strip>>;
        thinContent: z.ZodArray<z.ZodObject<{
            page: z.ZodString;
            wordCount: z.ZodNumber;
            threshold: z.ZodNumber;
        }, z.core.$strip>>;
        brokenLinks: z.ZodArray<z.ZodObject<{
            source: z.ZodString;
            target: z.ZodString;
        }, z.core.$strip>>;
        structuredData: z.ZodArray<z.ZodObject<{
            page: z.ZodString;
            errors: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
type AuditReport = z.infer<typeof AuditReportSchema>;

/**
 * Load, parse, and validate a project configuration file.
 * Merges environment variables from .env if present.
 *
 * @param configPath - Path to the YAML config file. Defaults to config.yaml in cwd.
 * @returns Validated ProjectConfig
 */
declare function loadConfig(configPath?: string): Promise<ProjectConfig>;

declare enum LogLevel {
    Quiet = 0,
    Default = 1,
    Verbose = 2
}
interface Logger {
    error(message: string): void;
    warn(message: string): void;
    info(message: string): void;
    debug(message: string): void;
    progress(current: number, total: number, label: string): void;
}
declare function createLogger(level?: LogLevel): Logger;

export { type AIBlockConfig, AIBlockConfigSchema, type AIConfig, AIConfigSchema, type AuditConfig, AuditConfigSchema, type AuditReport, AuditReportSchema, type BuildManifest, BuildManifestSchema, type BuildReport, BuildReportSchema, type ContentBlockConfig, ContentBlockConfigSchema, type ContentRules, ContentRulesSchema, type DimensionDef, DimensionDefSchema, type FilterRule, FilterRuleSchema, type ImageConfig, ImageConfigSchema, type ImageOverlay, ImageOverlaySchema, type ImageTemplateConfig, ImageTemplateConfigSchema, LogLevel, type Logger, type ManifestEntry, ManifestEntrySchema, type MatrixConfig, MatrixConfigSchema, type PageData, PageDataSchema, type PageEntry, PageEntrySchema, type PageReport, PageReportSchema, type PageSEOData, PageSEODataSchema, type PageTemplateConfig, PageTemplateConfigSchema, type ProjectConfig, ProjectConfigSchema, type SEOConfig, SEOConfigSchema, type TemplateConfig, TemplateConfigSchema, createLogger, loadConfig };
