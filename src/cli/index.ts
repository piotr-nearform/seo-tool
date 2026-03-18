#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'node:module';
import { registerInitCommand } from './commands/init.js';
import { registerBuildCommand } from './commands/build.js';
import { registerPreviewCommand } from './commands/preview.js';
import { registerAuditCommand } from './commands/audit.js';
import { registerExportCommand } from './commands/export.js';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

const program = new Command();

program
  .name('seo')
  .description('Programmatic SEO page generator')
  .version(pkg.version)
  .option('--verbose', 'Enable verbose output')
  .option('--quiet', 'Suppress all output except errors')
  .option('--config <path>', 'Path to config file', 'config.yaml');

registerInitCommand(program);
registerBuildCommand(program);
registerPreviewCommand(program);
registerAuditCommand(program);
registerExportCommand(program);

program.parse(process.argv);
