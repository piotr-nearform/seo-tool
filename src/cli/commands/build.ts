import type { Command } from 'commander';

export function registerBuildCommand(program: Command): void {
  program
    .command('build')
    .description('Build all SEO pages from config and templates')
    .action(() => {
      console.log('build: not yet implemented');
    });
}
