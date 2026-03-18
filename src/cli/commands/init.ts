import type { Command } from 'commander';
import { mkdir, writeFile, copyFile, access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Scaffold a new SEO project into the given directory.
 * Throws if the directory already exists.
 */
export async function scaffoldProject(projectDir: string): Promise<void> {
  // Check if directory already exists
  try {
    await access(projectDir);
    throw new Error(`Directory already exists: ${projectDir}`);
  } catch (err: any) {
    if (err.code !== 'ENOENT') throw err;
  }

  const projectName = path.basename(projectDir);

  // Create directories
  await mkdir(projectDir, { recursive: true });
  await mkdir(path.join(projectDir, 'templates'), { recursive: true });
  await mkdir(path.join(projectDir, 'data'), { recursive: true });
  await mkdir(path.join(projectDir, 'assets'), { recursive: true });

  // Resolve scaffold template directory
  const thisFile = fileURLToPath(import.meta.url);
  const scaffoldDir = path.resolve(path.dirname(thisFile), '../../../templates/scaffold');

  // Copy config.yaml and replace project name
  const configTemplate = await readFile(path.join(scaffoldDir, 'config.yaml'), 'utf-8');
  const config = configTemplate.replace(/^name:\s*.+$/m, `name: ${projectName}`);
  await writeFile(path.join(projectDir, 'config.yaml'), config, 'utf-8');

  // Copy layout.njk
  await copyFile(
    path.join(scaffoldDir, 'layout.njk'),
    path.join(projectDir, 'templates', 'layout.njk'),
  );

  // Copy landing-page.njk
  await copyFile(
    path.join(scaffoldDir, 'landing-page.njk'),
    path.join(projectDir, 'templates', 'landing-page.njk'),
  );

  // Create data/example.csv
  const csv = `product,use_case
CRM Software,Small Business
CRM Software,Enterprise
CRM Software,Startups
Project Management Tool,Small Business
Project Management Tool,Enterprise
`;
  await writeFile(path.join(projectDir, 'data', 'example.csv'), csv, 'utf-8');

  // Create .env.example
  const envExample = `OPENAI_API_KEY=
ANTHROPIC_API_KEY=
`;
  await writeFile(path.join(projectDir, '.env.example'), envExample, 'utf-8');

  // Create .gitignore
  const gitignore = `dist/
.seo-cache/
.env
node_modules/
`;
  await writeFile(path.join(projectDir, '.gitignore'), gitignore, 'utf-8');
}

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize a new SEO pages project')
    .argument('<project-name>', 'Name of the project directory to create')
    .action(async (projectName: string) => {
      const projectDir = path.resolve(process.cwd(), projectName);
      try {
        await scaffoldProject(projectDir);
        console.log(`\nProject created at ${projectDir}\n`);
        console.log('Next steps:');
        console.log(`  cd ${projectName}`);
        console.log('  # Edit config.yaml to customize your project');
        console.log('  # Add your data to data/example.csv');
        console.log('  seo build --dry-run');
        console.log('  seo build');
        console.log('  seo preview');
      } catch (err) {
        console.error((err as Error).message);
        process.exitCode = 1;
      }
    });
}
