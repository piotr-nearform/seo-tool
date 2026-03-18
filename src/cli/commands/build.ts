import type { Command } from 'commander';
import path from 'node:path';
import { runBuild } from '../../builder/pipeline.js';
import { createLogger, LogLevel } from '../logger.js';
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
        await runBuild(projectDir, buildOptions, { logger });
      } catch (err) {
        logger.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
