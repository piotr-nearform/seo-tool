import { describe, it, expect, vi } from 'vitest';
import { createAnthropicProvider } from '../../../src/ai/anthropic.js';

// --- Story 5.3: Anthropic provider implementation ---

function mockFetchSuccess(text: string) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        content: [{ text }],
      }),
  });
}

describe('Anthropic provider', () => {
  const defaultOptions = {
    model: 'claude-sonnet-4-20250514',
    temperature: 0.7,
    maxTokens: 1000,
  };

  it('should have name "anthropic"', () => {
    const provider = createAnthropicProvider('test-key');
    expect(provider.name).toBe('anthropic');
  });

  it('should make a successful API call', async () => {
    const mockFetch = mockFetchSuccess('Hello from Claude');
    const provider = createAnthropicProvider('test-key', undefined, mockFetch as any, 1);

    const result = await provider.generate('Say hello', defaultOptions);
    expect(result).toBe('Hello from Claude');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect(init.headers['x-api-key']).toBe('test-key');
    expect(init.headers['anthropic-version']).toBe('2023-06-01');

    const body = JSON.parse(init.body);
    expect(body.messages[0].content).toBe('Say hello');
    expect(body.temperature).toBe(0.7);
    expect(body.max_tokens).toBe(1000);
  });

  it('should throw on non-retryable error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: { message: 'Server error' } }),
    });
    const provider = createAnthropicProvider('test-key', undefined, mockFetch as any, 1);

    await expect(provider.generate('test', defaultOptions)).rejects.toThrow(
      'Anthropic API error: Server error',
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on 429 rate limit', async () => {
    const rateLimitResponse = {
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: { message: 'Rate limited' } }),
    };
    const successResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ content: [{ text: 'After retry' }] }),
    };

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(rateLimitResponse)
      .mockResolvedValueOnce(successResponse);

    const provider = createAnthropicProvider('test-key', undefined, mockFetch as any, 1);
    const result = await provider.generate('test', defaultOptions);

    expect(result).toBe('After retry');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should retry on 529 overloaded', async () => {
    const overloadedResponse = {
      ok: false,
      status: 529,
      json: () => Promise.resolve({ error: { message: 'Overloaded' } }),
    };
    const successResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ content: [{ text: 'Recovered' }] }),
    };

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(overloadedResponse)
      .mockResolvedValueOnce(successResponse);

    const provider = createAnthropicProvider('test-key', undefined, mockFetch as any, 1);
    const result = await provider.generate('test', defaultOptions);

    expect(result).toBe('Recovered');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should fail after max retries on persistent 429', async () => {
    const rateLimitResponse = {
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: { message: 'Rate limited' } }),
    };

    const mockFetch = vi.fn().mockResolvedValue(rateLimitResponse);
    const provider = createAnthropicProvider('test-key', undefined, mockFetch as any, 1);

    await expect(provider.generate('test', defaultOptions)).rejects.toThrow(
      'Anthropic API error: Rate limited',
    );
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  it('should throw on unexpected response format', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ content: [] }),
    });

    const provider = createAnthropicProvider('test-key', undefined, mockFetch as any, 1);
    await expect(provider.generate('test', defaultOptions)).rejects.toThrow(
      'unexpected response format',
    );
  });

  it('should handle network errors with retry', async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ content: [{ text: 'recovered' }] }),
      });

    const provider = createAnthropicProvider('test-key', undefined, mockFetch as any, 1);
    const result = await provider.generate('test', defaultOptions);
    expect(result).toBe('recovered');
  });
});
