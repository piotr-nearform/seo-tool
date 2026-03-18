import { describe, it, expect, vi } from 'vitest';
import type { PageEntry, PageTemplateConfig } from '../../../src/schemas/index.js';
import type { AIProvider } from '../../../src/ai/provider.js';
import {
  generateContent,
  countWords,
  validateContentRules,
} from '../../../src/content/content-generator.js';

const mockEntry: PageEntry = {
  id: 'test-id',
  slug: 'best-hotels-london',
  url: '/best-hotels-london',
  title: 'Best Hotels in London',
  description: 'Find the best hotels in London',
  dimensions: { city: 'London', category: 'Hotels' },
  data: {},
  inputHash: 'abc123',
};

// --- Story 4.2: Block-based page templates ---

describe('content-generator', () => {
  describe('countWords', () => {
    it('should count words in plain text', () => {
      expect(countWords('hello world foo bar')).toBe(4);
    });

    it('should strip HTML tags before counting', () => {
      expect(countWords('<p>Hello <strong>world</strong></p>')).toBe(2);
    });

    it('should return 0 for empty string', () => {
      expect(countWords('')).toBe(0);
    });

    it('should handle multiple spaces and newlines', () => {
      expect(countWords('hello   world\n\nfoo')).toBe(3);
    });
  });

  // --- Story 4.4: Content rules validation ---

  describe('validateContentRules', () => {
    it('should warn when word count is below minimum', () => {
      const warnings = validateContentRules('hello world', { minWords: 5 }, 'intro');
      expect(warnings).toHaveLength(1);
      expect(warnings[0].block).toBe('intro');
      expect(warnings[0].message).toContain('below minimum');
    });

    it('should warn when word count exceeds maximum', () => {
      const warnings = validateContentRules(
        'one two three four five six seven eight nine ten',
        { maxWords: 5 },
        'intro',
      );
      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toContain('exceeds maximum');
    });

    it('should not warn when word count is within range', () => {
      const warnings = validateContentRules('one two three', { minWords: 1, maxWords: 10 }, 'intro');
      expect(warnings).toHaveLength(0);
    });

    it('should warn when required keyword is missing', () => {
      const warnings = validateContentRules('hello world', { requiredKeywords: ['foo'] }, 'intro');
      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toContain('foo');
    });

    it('should find required keywords case-insensitively', () => {
      const warnings = validateContentRules('Hello WORLD', { requiredKeywords: ['hello', 'world'] }, 'intro');
      expect(warnings).toHaveLength(0);
    });

    it('should report multiple missing keywords', () => {
      const warnings = validateContentRules('hello', { requiredKeywords: ['foo', 'bar'] }, 'intro');
      expect(warnings).toHaveLength(2);
    });

    it('should combine word count and keyword checks', () => {
      const warnings = validateContentRules('hi', { minWords: 5, requiredKeywords: ['missing'] }, 'intro');
      expect(warnings).toHaveLength(2);
    });
  });

  describe('generateContent', () => {
    it('should generate static blocks with nunjucks format', async () => {
      const templateConfig: PageTemplateConfig = {
        name: 'test',
        file: 'test.njk',
        format: 'nunjucks',
        blocks: [
          {
            name: 'heading',
            type: 'static',
            template: '<h1>{{ page.title }}</h1>',
          },
          {
            name: 'body',
            type: 'static',
            template: '<p>{{ dimensions.city }} {{ dimensions.category }}</p>',
          },
        ],
      };

      const result = await generateContent(mockEntry, templateConfig, {});
      expect(result.blocks['heading']).toBe('<h1>Best Hotels in London</h1>');
      expect(result.blocks['body']).toBe('<p>London Hotels</p>');
      expect(result.warnings).toHaveLength(0);
    });

    it('should generate static blocks with markdown format', async () => {
      const templateConfig: PageTemplateConfig = {
        name: 'test',
        file: 'test.md',
        format: 'markdown',
        blocks: [
          {
            name: 'heading',
            type: 'static',
            template: '# {{ page.title }}',
          },
        ],
      };

      const result = await generateContent(mockEntry, templateConfig, {});
      expect(result.blocks['heading']).toContain('<h1>Best Hotels in London</h1>');
    });

    it('should validate content rules and return warnings', async () => {
      const templateConfig: PageTemplateConfig = {
        name: 'test',
        file: 'test.njk',
        format: 'nunjucks',
        blocks: [
          {
            name: 'intro',
            type: 'static',
            template: '<p>Short</p>',
            rules: { minWords: 10, requiredKeywords: ['hotel'] },
          },
        ],
      };

      const result = await generateContent(mockEntry, templateConfig, {});
      expect(result.blocks['intro']).toBe('<p>Short</p>');
      expect(result.warnings.length).toBeGreaterThanOrEqual(2);
      expect(result.warnings.some((w) => w.message.includes('below minimum'))).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('hotel'))).toBe(true);
    });

    it('should delegate AI blocks to AI provider', async () => {
      const mockProvider: AIProvider = {
        name: 'mock',
        generate: vi.fn().mockResolvedValue('Generated AI content about London hotels'),
      };

      const templateConfig: PageTemplateConfig = {
        name: 'test',
        file: 'test.njk',
        format: 'nunjucks',
        blocks: [
          {
            name: 'ai-block',
            type: 'ai',
            ai: {
              prompt: 'Write about {{ dimensions.city }}',
              model: 'gpt-4o-mini',
              temperature: 0.7,
              maxTokens: 500,
            },
          },
        ],
      };

      const result = await generateContent(mockEntry, templateConfig, {}, mockProvider);
      expect(result.blocks['ai-block']).toBe('Generated AI content about London hotels');
      expect(mockProvider.generate).toHaveBeenCalledWith(
        'Write about London',
        expect.objectContaining({ model: 'gpt-4o-mini' }),
      );
    });

    it('should throw if AI block has no provider', async () => {
      const templateConfig: PageTemplateConfig = {
        name: 'test',
        file: 'test.njk',
        format: 'nunjucks',
        blocks: [
          {
            name: 'ai-block',
            type: 'ai',
            ai: { prompt: 'Write something' },
          },
        ],
      };

      await expect(generateContent(mockEntry, templateConfig, {})).rejects.toThrow(
        'AI provider required',
      );
    });

    it('should handle mixed static and AI blocks', async () => {
      const mockProvider: AIProvider = {
        name: 'mock',
        generate: vi.fn().mockResolvedValue('AI generated intro'),
      };

      const templateConfig: PageTemplateConfig = {
        name: 'test',
        file: 'test.njk',
        format: 'nunjucks',
        blocks: [
          {
            name: 'header',
            type: 'static',
            template: '<h1>{{ page.title }}</h1>',
          },
          {
            name: 'content',
            type: 'ai',
            ai: { prompt: 'Write about {{ page.title }}' },
          },
        ],
      };

      const result = await generateContent(mockEntry, templateConfig, {}, mockProvider);
      expect(result.blocks['header']).toBe('<h1>Best Hotels in London</h1>');
      expect(result.blocks['content']).toBe('AI generated intro');
    });
  });
});
