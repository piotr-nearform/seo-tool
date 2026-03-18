import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { renderTemplate, renderString, createEnvironment } from '../../../src/content/template-engine.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures/templates');

describe('template-engine', () => {
  // --- Story 4.1: Nunjucks template engine setup ---

  describe('renderString', () => {
    it('should render variables', async () => {
      const result = await renderString('Hello {{ name }}!', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should render nested variables', async () => {
      const result = await renderString('{{ page.title }}', {
        page: { title: 'My Page' },
      });
      expect(result).toBe('My Page');
    });

    it('should render conditionals', async () => {
      const template = '{% if show %}visible{% else %}hidden{% endif %}';
      expect(await renderString(template, { show: true })).toBe('visible');
      expect(await renderString(template, { show: false })).toBe('hidden');
    });

    it('should render loops', async () => {
      const template = '{% for item in items %}{{ item }} {% endfor %}';
      const result = await renderString(template, { items: ['a', 'b', 'c'] });
      expect(result).toBe('a b c ');
    });

    it('should handle missing variables gracefully', async () => {
      const result = await renderString('Hello {{ missing }}!', {});
      expect(result).toBe('Hello !');
    });
  });

  describe('custom filters', () => {
    it('should apply slugify filter', async () => {
      const result = await renderString('{{ name | slugify }}', {
        name: 'Hello World!',
      });
      expect(result).toBe('hello-world');
    });

    it('should apply truncate filter', async () => {
      const result = await renderString('{{ text | truncate(10) }}', {
        text: 'This is a long string',
      });
      expect(result).toBe('This is a ...');
    });

    it('should not truncate short strings', async () => {
      const result = await renderString('{{ text | truncate(50) }}', {
        text: 'Short',
      });
      expect(result).toBe('Short');
    });

    it('should apply uppercase filter', async () => {
      const result = await renderString('{{ text | uppercase }}', {
        text: 'hello',
      });
      expect(result).toBe('HELLO');
    });

    it('should apply lowercase filter', async () => {
      const result = await renderString('{{ text | lowercase }}', {
        text: 'HELLO',
      });
      expect(result).toBe('hello');
    });

    it('should apply titlecase filter', async () => {
      const result = await renderString('{{ text | titlecase }}', {
        text: 'hello world foo',
      });
      expect(result).toBe('Hello World Foo');
    });

    it('should chain filters', async () => {
      const result = await renderString('{{ text | uppercase | truncate(5) }}', {
        text: 'hello world',
      });
      expect(result).toBe('HELLO...');
    });
  });

  describe('renderTemplate', () => {
    it('should render a template file with context', async () => {
      const result = await renderTemplate(path.join(FIXTURES, 'test.njk'), {
        page: { title: 'Test Page', description: 'A test page' },
        dimensions: { city: 'London', category: 'Hotels' },
      });
      expect(result).toContain('<h1>Test Page</h1>');
      expect(result).toContain('<p>A test page</p>');
      expect(result).toContain('city: London');
      expect(result).toContain('category: Hotels');
    });
  });

  describe('createEnvironment', () => {
    it('should create an environment with custom filters', () => {
      const env = createEnvironment();
      // Verify filters are registered by rendering
      const result = env.renderString('{{ "hello world" | slugify }}');
      expect(result).toBe('hello-world');
    });

    it('should create an environment with a template directory', () => {
      const env = createEnvironment(FIXTURES);
      expect(env).toBeDefined();
    });
  });
});
