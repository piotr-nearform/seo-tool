import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { startPreviewServer } from '../../../src/cli/commands/preview.js';

function fetch(url: string): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () =>
        resolve({ status: res.statusCode ?? 0, headers: res.headers, body }),
      );
      res.on('error', reject);
    }).on('error', reject);
  });
}

describe('cli/commands/preview — startPreviewServer', () => {
  let tmpDir: string;
  let server: http.Server;

  beforeEach(async () => {
    tmpDir = path.join(
      os.tmpdir(),
      `seo-preview-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('should start a server and serve an HTML file', async () => {
    await writeFile(path.join(tmpDir, 'index.html'), '<html><body>Hello</body></html>');
    server = await startPreviewServer(tmpDir, 0);
    const addr = server.address() as { port: number };

    const res = await fetch(`http://localhost:${addr.port}/index.html`);
    expect(res.status).toBe(200);
    expect(res.body).toContain('Hello');
    expect(res.headers['content-type']).toContain('text/html');
  });

  it('should serve index.html for directory requests', async () => {
    await writeFile(path.join(tmpDir, 'index.html'), '<html><body>Root</body></html>');
    server = await startPreviewServer(tmpDir, 0);
    const addr = server.address() as { port: number };

    const res = await fetch(`http://localhost:${addr.port}/`);
    expect(res.status).toBe(200);
    expect(res.body).toContain('Root');
  });

  it('should serve index.html for subdirectory requests', async () => {
    const subDir = path.join(tmpDir, 'about');
    await mkdir(subDir, { recursive: true });
    await writeFile(path.join(subDir, 'index.html'), '<html><body>About</body></html>');
    server = await startPreviewServer(tmpDir, 0);
    const addr = server.address() as { port: number };

    const res = await fetch(`http://localhost:${addr.port}/about/`);
    expect(res.status).toBe(200);
    expect(res.body).toContain('About');
  });

  it('should return 404 for missing files', async () => {
    server = await startPreviewServer(tmpDir, 0);
    const addr = server.address() as { port: number };

    const res = await fetch(`http://localhost:${addr.port}/nonexistent.html`);
    expect(res.status).toBe(404);
  });

  it('should serve CSS with correct content-type', async () => {
    await writeFile(path.join(tmpDir, 'style.css'), 'body { color: red; }');
    server = await startPreviewServer(tmpDir, 0);
    const addr = server.address() as { port: number };

    const res = await fetch(`http://localhost:${addr.port}/style.css`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/css');
  });

  it('should serve JSON with correct content-type', async () => {
    await writeFile(path.join(tmpDir, 'data.json'), '{"key":"value"}');
    server = await startPreviewServer(tmpDir, 0);
    const addr = server.address() as { port: number };

    const res = await fetch(`http://localhost:${addr.port}/data.json`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
  });

  it('should serve XML with correct content-type', async () => {
    await writeFile(path.join(tmpDir, 'sitemap.xml'), '<urlset></urlset>');
    server = await startPreviewServer(tmpDir, 0);
    const addr = server.address() as { port: number };

    const res = await fetch(`http://localhost:${addr.port}/sitemap.xml`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/xml');
  });

  it('should serve JS with correct content-type', async () => {
    await writeFile(path.join(tmpDir, 'app.js'), 'console.log("hi")');
    server = await startPreviewServer(tmpDir, 0);
    const addr = server.address() as { port: number };

    const res = await fetch(`http://localhost:${addr.port}/app.js`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/javascript');
  });

  it('should serve SVG with correct content-type', async () => {
    await writeFile(path.join(tmpDir, 'icon.svg'), '<svg></svg>');
    server = await startPreviewServer(tmpDir, 0);
    const addr = server.address() as { port: number };

    const res = await fetch(`http://localhost:${addr.port}/icon.svg`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/svg+xml');
  });

  it('should prevent path traversal attacks', async () => {
    server = await startPreviewServer(tmpDir, 0);
    const addr = server.address() as { port: number };

    // Node's HTTP client normalizes /../ paths, so the server sees /etc/passwd
    // which should return 404 (not found in the served directory)
    const res = await fetch(`http://localhost:${addr.port}/../../../etc/passwd`);
    // Should either be 403 (forbidden) or 404 (not found) — never 200
    expect([403, 404]).toContain(res.status);
    expect(res.body).not.toContain('root:');
  });
});
