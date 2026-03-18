import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadConfig, formatConfigErrors, validateEnvVars, resolveEnvVars } from '../../../src/core/config.js';
import { ProjectConfigSchema } from '../../../src/schemas/index.js';
import path from 'node:path';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures');

describe('Config Loader', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load and validate a valid config file', async () => {
    const config = await loadConfig(path.join(FIXTURES, 'valid-config.yaml'));
    expect(config.name).toBe('my-seo-project');
    expect(config.version).toBe('1.0.0');
    expect(config.baseUrl).toBe('https://example.com');
    expect(config.outputDir).toBe('dist');
    expect(config.outputStructure).toBe('nested');
  });

  it('should correctly parse matrix dimensions', async () => {
    const config = await loadConfig(path.join(FIXTURES, 'valid-config.yaml'));
    expect(config.matrix.dimensions.city.values).toContain('new-york');
    expect(config.matrix.dimensions.service.values).toContain('plumbing');
  });

  it('should correctly parse template config', async () => {
    const config = await loadConfig(path.join(FIXTURES, 'valid-config.yaml'));
    expect(config.templates.pages).toHaveLength(1);
    expect(config.templates.pages[0].name).toBe('city-service');
    expect(config.templates.pages[0].blocks).toHaveLength(2);
  });

  it('should correctly parse AI config', async () => {
    const config = await loadConfig(path.join(FIXTURES, 'valid-config.yaml'));
    expect(config.ai.defaultProvider).toBe('openai');
    expect(config.ai.concurrency).toBe(5);
    expect(config.ai.providers.openai?.model).toBe('gpt-4');
  });

  it('should correctly parse SEO config', async () => {
    const config = await loadConfig(path.join(FIXTURES, 'valid-config.yaml'));
    expect(config.seo.siteName).toBe('My SEO Site');
    expect(config.seo.schemaTypes).toContain('WebPage');
    expect(config.seo.internalLinking.enabled).toBe(true);
  });

  it('should throw on invalid config file', async () => {
    await expect(
      loadConfig(path.join(FIXTURES, 'invalid-config.yaml')),
    ).rejects.toThrow();
  });

  it('should throw on non-existent config file', async () => {
    await expect(
      loadConfig(path.join(FIXTURES, 'does-not-exist.yaml')),
    ).rejects.toThrow();
  });

  it('should use default config path when none specified', async () => {
    // loadConfig with no args should look for config.yaml in cwd, which won't exist
    // in the test environment
    await expect(loadConfig()).rejects.toThrow();
  });

  it('should merge environment variables for AI API keys', async () => {
    process.env.OPENAI_API_KEY = 'test-key-123';
    const config = await loadConfig(path.join(FIXTURES, 'valid-config.yaml'));
    expect(config.ai.providers.openai?.apiKeyEnv).toBe('OPENAI_API_KEY');
  });
});

// --- Story 2.1: Config validation with detailed error messages ---

describe('formatConfigErrors', () => {
  it('should format errors with field path and message', () => {
    const issues = [
      { path: ['matrix', 'dimensions'], message: 'Required', code: 'invalid_type' },
    ];
    const result = formatConfigErrors(issues);
    expect(result).toContain('matrix.dimensions');
    expect(result).toContain('Required');
  });

  it('should format multiple errors', () => {
    const issues = [
      { path: ['name'], message: 'Required', code: 'invalid_type' },
      { path: ['version'], message: 'Expected string, received number', code: 'invalid_type', expected: 'string' },
    ];
    const result = formatConfigErrors(issues);
    expect(result).toContain('name: Required');
    expect(result).toContain('version: Expected string, received number');
    expect(result).toContain('(expected: string)');
  });

  it('should handle root-level errors', () => {
    const issues = [{ path: [], message: 'Invalid input', code: 'invalid_type' }];
    const result = formatConfigErrors(issues);
    expect(result).toContain('(root)');
  });

  it('should include expected type when available', () => {
    const issues = [
      { path: ['outputStructure'], message: 'Invalid enum value', code: 'invalid_enum_value', expected: 'flat | nested' },
    ];
    const result = formatConfigErrors(issues);
    expect(result).toContain('outputStructure');
    expect(result).toContain('(expected: flat | nested)');
  });
});

describe('Config validation produces detailed errors', () => {
  it('should show field paths for missing required fields', async () => {
    await expect(
      loadConfig(path.join(FIXTURES, 'invalid-config.yaml')),
    ).rejects.toThrow(/Invalid config/);
  });

  it('should include field path in error for wrong types', () => {
    const result = ProjectConfigSchema.safeParse({
      name: 123, // should be string
      version: '1.0.0',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatConfigErrors(result.error.issues as any);
      expect(formatted).toContain('name');
    }
  });

  it('should include field path for invalid enum values', () => {
    const result = ProjectConfigSchema.safeParse({
      name: 'test',
      version: '1.0.0',
      baseUrl: 'https://example.com',
      outputDir: 'dist',
      outputStructure: 'INVALID',
      matrix: { dimensions: {}, pattern: { url: '/', title: 't', description: 'd' }, filters: [] },
      templates: { layout: 'l', pages: [] },
      images: { templates: [], outputFormats: ['webp'], quality: 80 },
      ai: {
        defaultProvider: 'openai',
        concurrency: 5,
        cache: true,
        cacheTtlDays: 7,
        providers: {},
      },
      seo: {
        siteName: 'Test',
        schemaTypes: ['WebPage'],
        internalLinking: { enabled: true, maxLinksPerPage: 5, strategy: 'shared-dimension' },
      },
      audit: { uniquenessThreshold: 0.7, minWordCount: 300, validateStructuredData: true },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatConfigErrors(result.error.issues as any);
      expect(formatted).toContain('outputStructure');
    }
  });
});

// --- Story 2.3: Environment variable integration ---

describe('validateEnvVars', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const makeConfig = (providers: any) =>
    ({
      ai: { providers },
    }) as any;

  it('should return empty array when all required env vars exist', () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    const config = makeConfig({ openai: { model: 'gpt-4', apiKeyEnv: 'OPENAI_API_KEY' } });
    expect(validateEnvVars(config)).toEqual([]);
  });

  it('should return missing env var names', () => {
    delete process.env.OPENAI_API_KEY;
    const config = makeConfig({ openai: { model: 'gpt-4', apiKeyEnv: 'OPENAI_API_KEY' } });
    expect(validateEnvVars(config)).toEqual(['OPENAI_API_KEY']);
  });

  it('should check multiple providers', () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    const config = makeConfig({
      openai: { model: 'gpt-4', apiKeyEnv: 'OPENAI_API_KEY' },
      anthropic: { model: 'claude-3', apiKeyEnv: 'ANTHROPIC_API_KEY' },
    });
    const missing = validateEnvVars(config);
    expect(missing).toContain('OPENAI_API_KEY');
    expect(missing).toContain('ANTHROPIC_API_KEY');
  });

  it('should skip unconfigured providers', () => {
    const config = makeConfig({});
    expect(validateEnvVars(config)).toEqual([]);
  });
});

describe('resolveEnvVars', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should resolve available env vars', () => {
    process.env.OPENAI_API_KEY = 'sk-test-123';
    const config = {
      ai: {
        providers: {
          openai: { model: 'gpt-4', apiKeyEnv: 'OPENAI_API_KEY' },
        },
      },
    } as any;
    const resolved = resolveEnvVars(config);
    expect(resolved).toEqual({ OPENAI_API_KEY: 'sk-test-123' });
  });

  it('should omit missing env vars from result', () => {
    delete process.env.OPENAI_API_KEY;
    const config = {
      ai: {
        providers: {
          openai: { model: 'gpt-4', apiKeyEnv: 'OPENAI_API_KEY' },
        },
      },
    } as any;
    const resolved = resolveEnvVars(config);
    expect(resolved).toEqual({});
  });
});
