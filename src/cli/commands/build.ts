import type { Command } from 'commander';
import { loadConfig } from '../../core/config.js';
import { loadDataSources } from '../../core/data-sources.js';
import { expandMatrix, sampleEntries, dryRunSummary } from '../../core/matrix.js';
import path from 'node:path';

export function registerBuildCommand(program: Command): void {
  program
    .command('build')
    .description('Build all SEO pages from config and templates')
    .option('--dry-run', 'Expand matrix and print summary without generating pages')
    .option('--sample <n>', 'Randomly sample N entries from the matrix', parseInt)
    .action(async (options, cmd) => {
      const parentOpts = cmd.parent?.opts() ?? {};
      const configPath = parentOpts.config ?? 'config.yaml';

      let config;
      try {
        config = await loadConfig(configPath);
      } catch (err) {
        console.error((err as Error).message);
        process.exitCode = 1;
        return;
      }

      const basePath = path.dirname(path.resolve(configPath));

      let dataSources;
      try {
        dataSources = await loadDataSources(config.matrix.dimensions, basePath);
      } catch (err) {
        console.error((err as Error).message);
        process.exitCode = 1;
        return;
      }

      let entries = expandMatrix(config.matrix, dataSources, basePath);

      if (options.sample && options.sample > 0) {
        entries = sampleEntries(entries, options.sample);
      }

      if (options.dryRun) {
        console.log(dryRunSummary(entries));
        return;
      }

      // Full build — not yet implemented
      console.log('build: not yet implemented');
    });
}
