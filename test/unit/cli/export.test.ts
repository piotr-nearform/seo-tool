import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, writeFile, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { exportSite, type ExportSummary } from '../../../src/cli/commands/export.js';

describe('cli/commands/export — exportSite', () => {
  let tmpDir: string;
  let sourceDir: string;
  let targetDir: string;

  beforeEach(async () => {
    tmpDir = path.join(
      os.tmpdir(),
      `seo-export-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    sourceDir = path.join(tmpDir, 'dist');
    targetDir = path.join(tmpDir, 'output');
    await mkdir(sourceDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('should copy all files from source to target', async () => {
    await writeFile(path.join(sourceDir, 'index.html'), '<html>Home</html>');
    await mkdir(path.join(sourceDir, 'about'), { recursive: true });
    await writeFile(path.join(sourceDir, 'about', 'index.html'), '<html>About</html>');

    await exportSite(sourceDir, targetDir, { force: true });

    const homeContent = await readFile(path.join(targetDir, 'index.html'), 'utf-8');
    expect(homeContent).toContain('Home');
    const aboutContent = await readFile(
      path.join(targetDir, 'about', 'index.html'),
      'utf-8',
    );
    expect(aboutContent).toContain('About');
  });

  it('should return a summary with page count, asset count, and total size', async () => {
    await writeFile(path.join(sourceDir, 'index.html'), '<html>Home</html>');
    await writeFile(path.join(sourceDir, 'style.css'), 'body{}');
    await writeFile(path.join(sourceDir, 'sitemap.xml'), '<urlset/>');

    const summary = await exportSite(sourceDir, targetDir, { force: true });

    expect(summary.pages).toBe(1);
    expect(summary.assets).toBe(2); // css + xml
    expect(summary.totalBytes).toBeGreaterThan(0);
  });

  it('should clean target directory before copying', async () => {
    // Create pre-existing file in target
    await mkdir(targetDir, { recursive: true });
    await writeFile(path.join(targetDir, 'old.html'), 'old');

    await writeFile(path.join(sourceDir, 'new.html'), 'new');

    await exportSite(sourceDir, targetDir, { force: true });

    const files = await readdir(targetDir);
    expect(files).toContain('new.html');
    expect(files).not.toContain('old.html');
  });

  it('should throw if source directory does not exist', async () => {
    await expect(
      exportSite(path.join(tmpDir, 'nonexistent'), targetDir, { force: true }),
    ).rejects.toThrow();
  });

  it('should count nested HTML files as pages', async () => {
    await writeFile(path.join(sourceDir, 'index.html'), '<html>Root</html>');
    await mkdir(path.join(sourceDir, 'blog'), { recursive: true });
    await writeFile(path.join(sourceDir, 'blog', 'index.html'), '<html>Blog</html>');
    await mkdir(path.join(sourceDir, 'blog', 'post-1'), { recursive: true });
    await writeFile(
      path.join(sourceDir, 'blog', 'post-1', 'index.html'),
      '<html>Post 1</html>',
    );

    const summary = await exportSite(sourceDir, targetDir, { force: true });

    expect(summary.pages).toBe(3);
  });

  it('should handle source directory being same as target (no-op copy)', async () => {
    await writeFile(path.join(sourceDir, 'index.html'), '<html>Home</html>');

    // Exporting to same dir should work (just reports summary)
    const summary = await exportSite(sourceDir, sourceDir, { force: true });
    expect(summary.pages).toBe(1);
  });
});
