import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadConfig } from '../../../src/core/config.js';
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
