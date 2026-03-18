import { readFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import dotenv from 'dotenv';
import { ProjectConfigSchema, type ProjectConfig } from '../schemas/index.js';

/**
 * Format Zod v4 validation errors into human-readable messages.
 */
export function formatConfigErrors(issues: { path: PropertyKey[]; message: string; code: string; expected?: string; received?: unknown }[]): string {
  return issues
    .map((issue) => {
      const fieldPath = issue.path.length > 0 ? issue.path.join('.') : '(root)';
      let msg = `  - ${fieldPath}: ${issue.message}`;
      if (issue.expected !== undefined) {
        msg += ` (expected: ${issue.expected})`;
      }
      return msg;
    })
    .join('\n');
}

/**
 * Validate that required environment variables exist when AI features are configured.
 * Returns an array of missing env var names.
 */
export function validateEnvVars(config: ProjectConfig): string[] {
  const missing: string[] = [];
  const providers = config.ai.providers;

  if (providers.openai) {
    const envName = providers.openai.apiKeyEnv;
    if (!process.env[envName]) {
      missing.push(envName);
    }
  }
  if (providers.anthropic) {
    const envName = providers.anthropic.apiKeyEnv;
    if (!process.env[envName]) {
      missing.push(envName);
    }
  }

  return missing;
}

/**
 * Resolve AI API key env var values. Returns a map of env var name -> value.
 */
export function resolveEnvVars(config: ProjectConfig): Record<string, string> {
  const resolved: Record<string, string> = {};
  const providers = config.ai.providers;

  if (providers.openai) {
    const envName = providers.openai.apiKeyEnv;
    const val = process.env[envName];
    if (val) resolved[envName] = val;
  }
  if (providers.anthropic) {
    const envName = providers.anthropic.apiKeyEnv;
    const val = process.env[envName];
    if (val) resolved[envName] = val;
  }

  return resolved;
}

/**
 * Load, parse, and validate a project configuration file.
 * Merges environment variables from .env if present.
 *
 * @param configPath - Path to the YAML config file. Defaults to config.yaml in cwd.
 * @returns Validated ProjectConfig
 */
export async function loadConfig(configPath?: string): Promise<ProjectConfig> {
  const resolvedPath = configPath ?? path.resolve(process.cwd(), 'config.yaml');

  // Load .env from the same directory as the config file
  const configDir = path.dirname(path.resolve(resolvedPath));
  dotenv.config({ path: path.join(configDir, '.env') });

  let raw: string;
  try {
    raw = await readFile(resolvedPath, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to read config file: ${resolvedPath}. ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(raw);
  } catch (err) {
    throw new Error(`Failed to parse YAML in config file: ${resolvedPath}. ${(err as Error).message}`);
  }

  const result = ProjectConfigSchema.safeParse(parsed);
  if (!result.success) {
    const formatted = formatConfigErrors(result.error.issues as any);
    throw new Error(`Invalid config in ${resolvedPath}:\n${formatted}`);
  }

  return result.data;
}
