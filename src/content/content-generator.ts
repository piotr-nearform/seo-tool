import type {
  PageEntry,
  PageTemplateConfig,
  ContentBlockConfig,
  ContentRules,
} from '../schemas/index.js';
import type { DataSources } from '../core/data-sources.js';
import type { AIProvider, GenerateOptions } from '../ai/provider.js';
import { renderString } from './template-engine.js';
import { renderMarkdown } from './markdown.js';

export interface ContentWarning {
  block: string;
  message: string;
}

export interface GeneratedContent {
  blocks: Record<string, string>;
  warnings: ContentWarning[];
}

/**
 * Count words in a string (strips HTML tags first).
 */
export function countWords(text: string): number {
  const stripped = text.replace(/<[^>]*>/g, ' ');
  const words = stripped.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/**
 * Validate content against content rules.
 */
export function validateContentRules(
  content: string,
  rules: ContentRules,
  blockName: string,
): ContentWarning[] {
  const warnings: ContentWarning[] = [];
  const wordCount = countWords(content);

  if (rules.minWords !== undefined && wordCount < rules.minWords) {
    warnings.push({
      block: blockName,
      message: `Word count ${wordCount} is below minimum ${rules.minWords}`,
    });
  }

  if (rules.maxWords !== undefined && wordCount > rules.maxWords) {
    warnings.push({
      block: blockName,
      message: `Word count ${wordCount} exceeds maximum ${rules.maxWords}`,
    });
  }

  if (rules.requiredKeywords) {
    const lowerContent = content.toLowerCase();
    for (const keyword of rules.requiredKeywords) {
      if (!lowerContent.includes(keyword.toLowerCase())) {
        warnings.push({
          block: blockName,
          message: `Required keyword "${keyword}" not found in content`,
        });
      }
    }
  }

  return warnings;
}

/**
 * Build the template context for a page entry.
 */
function buildContext(
  entry: PageEntry,
  dataSources: DataSources,
): Record<string, unknown> {
  return {
    page: {
      id: entry.id,
      slug: entry.slug,
      url: entry.url,
      title: entry.title,
      description: entry.description,
      dimensions: entry.dimensions,
      data: entry.data,
    },
    dimensions: entry.dimensions,
    data: entry.data,
  };
}

/**
 * Generate content for all blocks in a page template.
 */
export async function generateContent(
  entry: PageEntry,
  templateConfig: PageTemplateConfig,
  dataSources: DataSources,
  aiProvider?: AIProvider,
): Promise<GeneratedContent> {
  const context = buildContext(entry, dataSources);
  const blocks: Record<string, string> = {};
  const warnings: ContentWarning[] = [];

  for (const block of templateConfig.blocks) {
    let content: string;

    if (block.type === 'static') {
      content = await renderStaticBlock(block, context, templateConfig.format);
    } else if (block.type === 'ai') {
      content = await renderAIBlock(block, context, aiProvider);
    } else {
      throw new Error(`Unknown block type: ${block.type}`);
    }

    // Validate against rules
    if (block.rules) {
      const blockWarnings = validateContentRules(content, block.rules, block.name);
      warnings.push(...blockWarnings);
    }

    blocks[block.name] = content;
  }

  return { blocks, warnings };
}

async function renderStaticBlock(
  block: ContentBlockConfig,
  context: Record<string, unknown>,
  format: 'nunjucks' | 'markdown',
): Promise<string> {
  const template = block.template ?? '';

  if (format === 'markdown') {
    return renderMarkdown(template, context);
  }
  return renderString(template, context);
}

async function renderAIBlock(
  block: ContentBlockConfig,
  context: Record<string, unknown>,
  aiProvider?: AIProvider,
): Promise<string> {
  if (!aiProvider) {
    throw new Error(
      `AI provider required for block "${block.name}" but none was provided`,
    );
  }

  if (!block.ai) {
    throw new Error(`AI block "${block.name}" is missing ai configuration`);
  }

  // Render the prompt template with context
  const prompt = await renderString(block.ai.prompt, context);

  const options: GenerateOptions = {
    model: block.ai.model ?? 'gpt-4o-mini',
    temperature: block.ai.temperature ?? 0.7,
    maxTokens: block.ai.maxTokens ?? 1000,
  };

  return aiProvider.generate(prompt, options);
}
