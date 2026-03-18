import type { Command } from 'commander';

export function registerExportCommand(program: Command): void {
  program
    .command('export')
    .description('Export generated pages for deployment')
    .action(() => {
      console.log('export: not yet implemented');
    });
}
