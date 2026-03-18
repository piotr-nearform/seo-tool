import type { Command } from 'commander';
import { mkdir, rm, readdir, copyFile, stat, access } from 'node:fs/promises';
import path from 'node:path';

export interface ExportSummary {
  pages: number;
  assets: number;
  totalBytes: number;
}

export interface ExportOptions {
  force?: boolean;
}

/**
 * Recursively gather all files in a directory.
 */
async function walkFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Export (copy) a generated site from sourceDir to targetDir.
 * Returns a summary of what was copied.
 */
export async function exportSite(
  sourceDir: string,
  targetDir: string,
  options: ExportOptions = {},
): Promise<ExportSummary> {
  // Verify source exists
  await access(sourceDir);

  const sourceResolved = path.resolve(sourceDir);
  const targetResolved = path.resolve(targetDir);
  const sameDir = sourceResolved === targetResolved;

  // Gather all source files
  const allFiles = await walkFiles(sourceResolved);

  // Clean target (unless same directory)
  if (!sameDir) {
    await rm(targetResolved, { recursive: true, force: true });
    await mkdir(targetResolved, { recursive: true });

    // Copy all files
    for (const srcFile of allFiles) {
      const relPath = path.relative(sourceResolved, srcFile);
      const destFile = path.join(targetResolved, relPath);
      await mkdir(path.dirname(destFile), { recursive: true });
      await copyFile(srcFile, destFile);
    }
  }

  // Compute summary
  let pages = 0;
  let assets = 0;
  let totalBytes = 0;

  for (const file of allFiles) {
    const fileStat = await stat(file);
    totalBytes += fileStat.size;

    if (file.endsWith('.html')) {
      pages++;
    } else {
      assets++;
    }
  }

  return { pages, assets, totalBytes };
}

export function registerExportCommand(program: Command): void {
  program
    .command('export')
    .description('Export generated pages for deployment')
    .option('--output <dir>', 'Target output directory')
    .option('--force', 'Skip confirmation prompt', false)
    .action(async (options, cmd) => {
      const parentOpts = cmd.parent?.opts() ?? {};
      const configPath = parentOpts.config ?? 'config.yaml';

      // Determine source dir (from config or default)
      const sourceDir = path.resolve('dist');
      const targetDir = options.output
        ? path.resolve(options.output)
        : sourceDir;

      try {
        const summary = await exportSite(sourceDir, targetDir, {
          force: options.force,
        });

        console.log('Export complete!');
        console.log(`  Pages: ${summary.pages}`);
        console.log(`  Assets: ${summary.assets}`);
        console.log(`  Total size: ${formatBytes(summary.totalBytes)}`);
      } catch (err) {
        console.error(`Export failed: ${(err as Error).message}`);
        process.exitCode = 1;
      }
    });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
