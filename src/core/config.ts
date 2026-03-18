import { readFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import dotenv from 'dotenv';
import { ProjectConfigSchema, type ProjectConfig } from '../schemas/index.js';

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
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid config in ${resolvedPath}:\n${issues}`);
  }

  return result.data;
}
