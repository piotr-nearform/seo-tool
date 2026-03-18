import type { Command } from 'commander';

export function registerPreviewCommand(program: Command): void {
  program
    .command('preview')
    .description('Start a local preview server for generated pages')
    .action(() => {
      console.log('preview: not yet implemented');
    });
}
