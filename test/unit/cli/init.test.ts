import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { scaffoldProject } from '../../../src/cli/commands/init.js';

describe('cli/commands/init — scaffoldProject', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(
      os.tmpdir(),
      `seo-init-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('should create the project directory', async () => {
    const projectDir = path.join(tmpDir, 'my-project');
    await scaffoldProject(projectDir);

    const stat = await access(projectDir);
    // access does not throw => directory exists
  });

  it('should create config.yaml', async () => {
    const projectDir = path.join(tmpDir, 'my-project');
    await scaffoldProject(projectDir);

    const content = await readFile(path.join(projectDir, 'config.yaml'), 'utf-8');
    expect(content).toContain('name:');
    expect(content).toContain('matrix:');
    expect(content).toContain('templates:');
    expect(content).toContain('seo:');
  });

  it('should create templates/layout.njk', async () => {
    const projectDir = path.join(tmpDir, 'my-project');
    await scaffoldProject(projectDir);

    const content = await readFile(
      path.join(projectDir, 'templates', 'layout.njk'),
      'utf-8',
    );
    expect(content).toContain('<!DOCTYPE html>');
  });

  it('should create templates/landing-page.njk', async () => {
    const projectDir = path.join(tmpDir, 'my-project');
    await scaffoldProject(projectDir);

    const content = await readFile(
      path.join(projectDir, 'templates', 'landing-page.njk'),
      'utf-8',
    );
    expect(content).toContain('hero');
    expect(content).toContain('content');
  });

  it('should create data/example.csv with sample rows', async () => {
    const projectDir = path.join(tmpDir, 'my-project');
    await scaffoldProject(projectDir);

    const content = await readFile(
      path.join(projectDir, 'data', 'example.csv'),
      'utf-8',
    );
    const lines = content.trim().split('\n');
    // header + at least 3 data rows
    expect(lines.length).toBeGreaterThanOrEqual(4);
  });

  it('should create assets/ directory', async () => {
    const projectDir = path.join(tmpDir, 'my-project');
    await scaffoldProject(projectDir);

    await access(path.join(projectDir, 'assets'));
  });

  it('should create .env.example with API key placeholders', async () => {
    const projectDir = path.join(tmpDir, 'my-project');
    await scaffoldProject(projectDir);

    const content = await readFile(
      path.join(projectDir, '.env.example'),
      'utf-8',
    );
    expect(content).toContain('OPENAI_API_KEY=');
    expect(content).toContain('ANTHROPIC_API_KEY=');
  });

  it('should create .gitignore', async () => {
    const projectDir = path.join(tmpDir, 'my-project');
    await scaffoldProject(projectDir);

    const content = await readFile(
      path.join(projectDir, '.gitignore'),
      'utf-8',
    );
    expect(content).toContain('dist/');
    expect(content).toContain('.seo-cache/');
    expect(content).toContain('.env');
    expect(content).toContain('node_modules/');
  });

  it('should throw if directory already exists', async () => {
    const projectDir = path.join(tmpDir, 'my-project');
    await mkdir(projectDir, { recursive: true });

    await expect(scaffoldProject(projectDir)).rejects.toThrow(/already exists/);
  });

  it('should update config name to match project directory name', async () => {
    const projectDir = path.join(tmpDir, 'awesome-site');
    await scaffoldProject(projectDir);

    const content = await readFile(path.join(projectDir, 'config.yaml'), 'utf-8');
    expect(content).toContain('name: awesome-site');
  });
});
