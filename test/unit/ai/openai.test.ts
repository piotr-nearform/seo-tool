import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOpenAIProvider } from '../../../src/ai/openai.js';

// --- Story 5.2: OpenAI provider implementation ---

function mockFetchSuccess(content: string) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        choices: [{ message: { content } }],
      }),
  });
}

function mockFetchError(status: number, message: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ error: { message } }),
  });
}

describe('OpenAI provider', () => {
  const defaultOptions = {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1000,
  };

  it('should have name "openai"', () => {
    const provider = createOpenAIProvider('test-key');
    expect(provider.name).toBe('openai');
  });

  it('should make a successful API call', async () => {
    const mockFetch = mockFetchSuccess('Hello from GPT');
    const provider = createOpenAIProvider('test-key', undefined, mockFetch as any);

    const result = await provider.generate('Say hello', defaultOptions);
    expect(result).toBe('Hello from GPT');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer test-key');

    const body = JSON.parse(init.body);
    expect(body.model).toBe('gpt-4o-mini');
    expect(body.messages[0].content).toBe('Say hello');
    expect(body.temperature).toBe(0.7);
    expect(body.max_tokens).toBe(1000);
  });

  it('should throw on non-429 error', async () => {
    const mockFetch = mockFetchError(500, 'Internal server error');
    const provider = createOpenAIProvider('test-key', undefined, mockFetch as any);

    await expect(provider.generate('test', defaultOptions)).rejects.toThrow(
      'OpenAI API error: Internal server error',
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
      json: () => Promise.resolve({ choices: [{ message: { content: 'Success after retry' } }] }),
    };

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(rateLimitResponse)
      .mockResolvedValueOnce(successResponse);

    const provider = createOpenAIProvider('test-key', undefined, mockFetch as any, 1);
    const result = await provider.generate('test', defaultOptions);

    expect(result).toBe('Success after retry');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should fail after max retries on persistent 429', async () => {
    const rateLimitResponse = {
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: { message: 'Rate limited' } }),
    };

    // After MAX_RETRIES (3) retries + 1 initial = 4 attempts, the 4th 429 is not retried
    const mockFetch = vi.fn().mockResolvedValue(rateLimitResponse);
    const provider = createOpenAIProvider('test-key', undefined, mockFetch as any, 1);

    await expect(provider.generate('test', defaultOptions)).rejects.toThrow(
      'OpenAI API error: Rate limited',
    );
    // 1 initial + 3 retries = 4, but last 429 throws directly
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  it('should throw on unexpected response format', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ choices: [] }),
    });

    const provider = createOpenAIProvider('test-key', undefined, mockFetch as any);
    await expect(provider.generate('test', defaultOptions)).rejects.toThrow(
      'unexpected response format',
    );
  });

  it('should use default model when none specified in options', async () => {
    const mockFetch = mockFetchSuccess('response');
    const provider = createOpenAIProvider('test-key', 'gpt-4o', mockFetch as any);

    await provider.generate('test', { ...defaultOptions, model: '' });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.model).toBe('gpt-4o');
  });

  it('should handle network errors with retry', async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ choices: [{ message: { content: 'recovered' } }] }),
      });

    const provider = createOpenAIProvider('test-key', undefined, mockFetch as any, 1);
    const result = await provider.generate('test', defaultOptions);
    expect(result).toBe('recovered');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
