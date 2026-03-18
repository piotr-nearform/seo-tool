import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const CLI_PATH = path.resolve(import.meta.dirname, '../../src/cli/index.ts');
const TSX_PATH = 'tsx';

function runCli(args: string[]): string {
  try {
    return execFileSync(TSX_PATH, [CLI_PATH, ...args], {
      encoding: 'utf-8',
      timeout: 15000,
    });
  } catch (error: any) {
    // Commander exits with code 1 for --help, capture stdout
    return error.stdout || error.stderr || error.message;
  }
}

describe('CLI Integration', () => {
  it('should display help text', () => {
    const output = runCli(['--help']);
    expect(output).toContain('seo');
    expect(output).toContain('init');
    expect(output).toContain('build');
    expect(output).toContain('preview');
    expect(output).toContain('audit');
    expect(output).toContain('export');
  });

  it('should display version', () => {
    const output = runCli(['--version']);
    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should accept --verbose flag', () => {
    const output = runCli(['build', '--verbose']);
    expect(output).toContain('not yet implemented');
  });

  it('should accept --quiet flag', () => {
    const output = runCli(['build', '--quiet']);
    expect(output).toContain('not yet implemented');
  });

  it('should accept --config flag', () => {
    const output = runCli(['build', '--config', 'custom.yaml']);
    expect(output).toContain('not yet implemented');
  });

  it('should show init command help', () => {
    const output = runCli(['init', '--help']);
    expect(output).toContain('init');
  });

  it('should show build command help', () => {
    const output = runCli(['build', '--help']);
    expect(output).toContain('build');
  });

  it('should show preview command help', () => {
    const output = runCli(['preview', '--help']);
    expect(output).toContain('preview');
  });

  it('should show audit command help', () => {
    const output = runCli(['audit', '--help']);
    expect(output).toContain('audit');
  });

  it('should show export command help', () => {
    const output = runCli(['export', '--help']);
    expect(output).toContain('export');
  });

  it('should log stub message for each command', () => {
    const commands = ['init', 'build', 'preview', 'audit', 'export'];
    for (const cmd of commands) {
      const output = runCli([cmd]);
      expect(output).toContain('not yet implemented');
    }
  });
});
