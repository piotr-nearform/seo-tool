import { describe, it, expect } from 'vitest';
import { createAIProvider } from '../../../src/ai/provider.js';

// --- Story 5.1: AI provider interface and factory ---

describe('AI provider factory', () => {
  it('should create an OpenAI provider', () => {
    const provider = createAIProvider({
      provider: 'openai',
      apiKey: 'test-key',
    });
    expect(provider.name).toBe('openai');
    expect(typeof provider.generate).toBe('function');
  });

  it('should create an Anthropic provider', () => {
    const provider = createAIProvider({
      provider: 'anthropic',
      apiKey: 'test-key',
    });
    expect(provider.name).toBe('anthropic');
    expect(typeof provider.generate).toBe('function');
  });

  it('should pass model to provider', () => {
    const provider = createAIProvider({
      provider: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4o',
    });
    expect(provider.name).toBe('openai');
  });

  it('should throw for unsupported provider', () => {
    expect(() =>
      createAIProvider({
        provider: 'invalid' as any,
        apiKey: 'test-key',
      }),
    ).toThrow('Unsupported AI provider');
  });
});
