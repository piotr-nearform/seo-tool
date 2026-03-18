import type { Command } from 'commander';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from '../../core/config.js';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.txt': 'text/plain; charset=utf-8',
};

/**
 * Start a static file preview server.
 * Returns the http.Server instance (useful for testing).
 * Pass port=0 to let the OS assign a free port.
 */
export function startPreviewServer(
  rootDir: string,
  port: number,
): Promise<http.Server> {
  const resolvedRoot = path.resolve(rootDir);

  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url?.split('?')[0] ?? '/');

    // Resolve file path
    let filePath = path.join(resolvedRoot, urlPath);

    // Prevent path traversal
    if (!filePath.startsWith(resolvedRoot)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    // Check if path is a directory — serve index.html
    try {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
    } catch {
      // File doesn't exist — will be handled below
    }

    // Read and serve the file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve(server);
    });
  });
}

export function registerPreviewCommand(program: Command): void {
  program
    .command('preview')
    .description('Start a local preview server for generated pages')
    .option('--port <port>', 'Port to listen on', '3000')
    .option('--dir <dir>', 'Directory to serve')
    .action(async (options) => {
      const port = parseInt(options.port, 10);

      // Resolve output directory: explicit --dir > config.outputDir > 'dist'
      let dir: string;
      if (options.dir) {
        dir = path.resolve(options.dir);
      } else {
        try {
          const configPath = (options as any).__parentCommand?.opts?.()?.config ?? 'config.yaml';
          const config = await loadConfig(path.resolve(configPath));
          dir = path.resolve(config.outputDir);
        } catch {
          dir = path.resolve('dist');
        }
      }

      try {
        const server = await startPreviewServer(dir, port);
        const addr = server.address() as { port: number };
        console.log(`Preview server running at http://localhost:${addr.port}`);
        console.log('Press Ctrl+C to stop');

        process.on('SIGINT', () => {
          console.log('\nShutting down preview server...');
          server.close(() => {
            process.exit(0);
          });
        });
      } catch (err) {
        console.error(`Failed to start preview server: ${(err as Error).message}`);
        process.exitCode = 1;
      }
    });
}
