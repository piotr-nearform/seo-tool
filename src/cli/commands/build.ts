import type { Command } from 'commander';
import path from 'node:path';
import { runBuild } from '../../builder/pipeline.js';
import { createLogger, LogLevel } from '../logger.js';
import { loadConfig } from '../../core/config.js';
import { createAIProvider } from '../../ai/provider.js';
import type { BuildOptions } from '../../builder/pipeline.js';

export function registerBuildCommand(program: Command): void {
  program
    .command('build')
    .description('Build all SEO pages from config and templates')
    .option('--dry-run', 'Expand matrix and print summary without generating pages')
    .option('--sample <n>', 'Randomly sample N entries from the matrix', parseInt)
    .option('--incremental', 'Only rebuild changed pages')
    .action(async (options, cmd) => {
      const parentOpts = cmd.parent?.opts() ?? {};
      const configPath = parentOpts.config ?? 'config.yaml';

      const logLevel = parentOpts.quiet
        ? LogLevel.Quiet
        : parentOpts.verbose
          ? LogLevel.Verbose
          : LogLevel.Default;

      const logger = createLogger(logLevel);

      const buildOptions: BuildOptions = {
        configPath,
        verbose: parentOpts.verbose ?? false,
        quiet: parentOpts.quiet ?? false,
        dryRun: options.dryRun ?? false,
        sample: options.sample,
        incremental: options.incremental ?? false,
      };

      const projectDir = path.dirname(path.resolve(configPath));

      try {
        // Load config to create AI provider if configured
        let aiProvider;
        try {
          const config = await loadConfig(path.resolve(configPath));
          const providerName = config.ai.defaultProvider;
          const providerConfig = config.ai.providers[providerName];
          if (providerConfig) {
            const apiKey = process.env[providerConfig.apiKeyEnv];
            if (apiKey) {
              aiProvider = createAIProvider({
                provider: providerName,
                apiKey,
                model: providerConfig.model,
              });
              logger.verbose(`AI provider: ${providerName} (${providerConfig.model})`);
            } else {
              logger.verbose(`No API key found in ${providerConfig.apiKeyEnv} — AI blocks will fail`);
            }
          }
        } catch {
          // Config will be loaded again in runBuild — just skip AI setup
        }

        await runBuild(projectDir, buildOptions, { logger, aiProvider });
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
