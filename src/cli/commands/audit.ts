import type { Command } from 'commander';

export function registerAuditCommand(program: Command): void {
  program
    .command('audit')
    .description('Run content quality and SEO audit on generated pages')
    .action(() => {
      console.log('audit: not yet implemented');
    });
}
