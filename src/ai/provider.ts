export interface GenerateOptions {
  model: string;
  temperature: number;
  maxTokens: number;
  cacheKey?: string;
}

export interface AIProvider {
  name: string;
  generate(prompt: string, options: GenerateOptions): Promise<string>;
}

export interface AIProviderConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model?: string;
}

export function createAIProvider(config: AIProviderConfig): AIProvider {
  switch (config.provider) {
    case 'openai':
      return createOpenAIProvider(config.apiKey, config.model);
    case 'anthropic':
      return createAnthropicProvider(config.apiKey, config.model);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}

// Lazy imports to avoid circular dependencies - the actual providers
// are imported dynamically but for simplicity we import directly
import { createOpenAIProvider } from './openai.js';
import { createAnthropicProvider } from './anthropic.js';
