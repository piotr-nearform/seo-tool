import type { AIProvider, GenerateOptions } from './provider.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 1000;

export function createAnthropicProvider(
  apiKey: string,
  defaultModel?: string,
  fetchFn?: typeof fetch,
  baseDelayMs: number = DEFAULT_BASE_DELAY_MS,
): AIProvider {
  const _fetch = fetchFn ?? globalThis.fetch;

  return {
    name: 'anthropic',

    async generate(prompt: string, options: GenerateOptions): Promise<string> {
      const model = options.model || defaultModel || 'claude-sonnet-4-20250514';
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          await sleep(delay);
        }

        let response: Response;
        try {
          response = await _fetch(ANTHROPIC_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model,
              max_tokens: options.maxTokens,
              temperature: options.temperature,
              messages: [{ role: 'user', content: prompt }],
            }),
          });
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          continue;
        }

        if ((response.status === 429 || response.status === 529) && attempt < MAX_RETRIES) {
          lastError = new Error(`Rate limited (${response.status})`);
          continue;
        }

        if (!response.ok) {
          let errorMessage: string;
          try {
            const errorBody = await response.json();
            errorMessage =
              (errorBody as any)?.error?.message ?? `HTTP ${response.status}`;
          } catch {
            errorMessage = `HTTP ${response.status}`;
          }
          throw new Error(`Anthropic API error: ${errorMessage}`);
        }

        const data = (await response.json()) as any;
        const content = data?.content?.[0]?.text;
        if (typeof content !== 'string') {
          throw new Error('Anthropic API returned unexpected response format');
        }
        return content;
      }

      throw lastError ?? new Error('Anthropic API request failed after retries');
    },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
