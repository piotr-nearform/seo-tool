import type { AIProvider, GenerateOptions } from './provider.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 1000;

export function createOpenAIProvider(
  apiKey: string,
  defaultModel?: string,
  fetchFn?: typeof fetch,
  baseDelayMs: number = DEFAULT_BASE_DELAY_MS,
): AIProvider {
  const _fetch = fetchFn ?? globalThis.fetch;

  return {
    name: 'openai',

    async generate(prompt: string, options: GenerateOptions): Promise<string> {
      const model = options.model || defaultModel || 'gpt-4o-mini';
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          await sleep(delay);
        }

        let response: Response;
        try {
          response = await _fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'user', content: prompt }],
              temperature: options.temperature,
              max_tokens: options.maxTokens,
            }),
          });
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          continue;
        }

        if (response.status === 429 && attempt < MAX_RETRIES) {
          lastError = new Error('Rate limited (429)');
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
          throw new Error(`OpenAI API error: ${errorMessage}`);
        }

        const data = (await response.json()) as any;
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content !== 'string') {
          throw new Error('OpenAI API returned unexpected response format');
        }
        return content;
      }

      throw lastError ?? new Error('OpenAI API request failed after retries');
    },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
