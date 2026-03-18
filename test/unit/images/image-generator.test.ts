import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdir, rm, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  generateImages,
  buildContext,
  generateAltText,
} from '../../../src/images/image-generator.js';
import type { PageEntry, ImageConfig } from '../../../src/schemas/index.js';

const TMP_DIR = join(import.meta.dirname, '../../.tmp-image-gen');

const testEntry: PageEntry = {
  id: 'abc123',
  slug: 'plumbing-new-york',
  url: '/plumbing/new-york',
  title: 'Plumbing in New York',
  description: 'Find the best plumbing services in New York.',
  dimensions: { service: 'plumbing', city: 'new-york' },
  data: { rating: 4.5 },
  inputHash: 'hash123',
};

beforeAll(async () => {
  await mkdir(TMP_DIR, { recursive: true });
  // Create a base image fixture
  const fixture = await sharp({
    create: {
      width: 50,
      height: 50,
      channels: 4,
      background: { r: 100, g: 200, b: 50, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
  await writeFixture(join(TMP_DIR, 'templates', 'og-bg.png'), fixture);
});

async function writeFixture(path: string, data: Buffer) {
  const { dirname } = await import('node:path');
  await mkdir(dirname(path), { recursive: true });
  const { writeFile } = await import('node:fs/promises');
  await writeFile(path, data);
}

afterAll(async () => {
  await rm(TMP_DIR, { recursive: true, force: true });
});

describe('buildContext', () => {
  it('should include title, description, slug, url from entry', () => {
    const ctx = buildContext(testEntry);
    expect(ctx.title).toBe('Plumbing in New York');
    expect(ctx.description).toBe(
      'Find the best plumbing services in New York.',
    );
    expect(ctx.slug).toBe('plumbing-new-york');
    expect(ctx.url).toBe('/plumbing/new-york');
  });

  it('should include dimensions in context', () => {
    const ctx = buildContext(testEntry);
    expect(ctx.service).toBe('plumbing');
    expect(ctx.city).toBe('new-york');
  });

  it('should include string and number data values', () => {
    const ctx = buildContext(testEntry);
    expect(ctx.rating).toBe(4.5);
  });
});

describe('generateAltText', () => {
  it('should combine title and dimension values', () => {
    const alt = generateAltText(testEntry);
    expect(alt).toBe('Plumbing in New York - plumbing new-york');
  });

  it('should return just title when no dimensions', () => {
    const entry: PageEntry = {
      ...testEntry,
      dimensions: {},
    };
    expect(generateAltText(entry)).toBe('Plumbing in New York');
  });
});

describe('generateImages', () => {
  it('should generate images in all configured output formats', async () => {
    const config: ImageConfig = {
      templates: [
        {
          name: 'og-image',
          width: 100,
          height: 50,
          overlays: [
            {
              type: 'text',
              content: '{{title}}',
              fontSize: 12,
              fontColor: '#FFFFFF',
              x: 5,
              y: 5,
            },
          ],
        },
      ],
      outputFormats: ['webp', 'png'],
      quality: 80,
    };

    const assets = await generateImages(testEntry, config, TMP_DIR);

    expect(assets).toHaveLength(1);
    expect(assets[0].templateName).toBe('og-image');
    expect(assets[0].files).toHaveLength(2);
    expect(assets[0].altText).toContain('Plumbing in New York');

    // Verify files were written
    for (const file of assets[0].files) {
      const fullPath = join(TMP_DIR, file.path);
      const fileStat = await stat(fullPath);
      expect(fileStat.size).toBeGreaterThan(0);
      expect(file.size).toBe(fileStat.size);
    }

    // Verify formats
    const formats = assets[0].files.map((f) => f.format);
    expect(formats).toContain('webp');
    expect(formats).toContain('png');
  });

  it('should write files to correct paths', async () => {
    const config: ImageConfig = {
      templates: [
        {
          name: 'hero',
          width: 50,
          height: 50,
          overlays: [],
        },
      ],
      outputFormats: ['png'],
      quality: 80,
    };

    const assets = await generateImages(testEntry, config, TMP_DIR);
    expect(assets[0].files[0].path).toBe(
      join('assets', 'images', 'plumbing-new-york', 'hero.png'),
    );
  });

  it('should use base image when specified', async () => {
    const config: ImageConfig = {
      templates: [
        {
          name: 'with-base',
          baseImage: 'templates/og-bg.png',
          width: 50,
          height: 50,
          overlays: [],
        },
      ],
      outputFormats: ['png'],
      quality: 80,
    };

    const assets = await generateImages(testEntry, config, TMP_DIR);
    expect(assets).toHaveLength(1);
    expect(assets[0].files[0].size).toBeGreaterThan(0);
  });

  it('should handle multiple templates', async () => {
    const config: ImageConfig = {
      templates: [
        { name: 'og-image', width: 100, height: 50, overlays: [] },
        { name: 'thumbnail', width: 50, height: 50, overlays: [] },
      ],
      outputFormats: ['webp'],
      quality: 80,
    };

    const assets = await generateImages(testEntry, config, TMP_DIR);
    expect(assets).toHaveLength(2);
    expect(assets[0].templateName).toBe('og-image');
    expect(assets[1].templateName).toBe('thumbnail');
  });

  it('should interpolate variables in text overlays', async () => {
    const config: ImageConfig = {
      templates: [
        {
          name: 'dynamic',
          width: 200,
          height: 100,
          overlays: [
            {
              type: 'text',
              content: '{{title}} - {{city}}',
              fontSize: 14,
              x: 5,
              y: 5,
            },
          ],
        },
      ],
      outputFormats: ['png'],
      quality: 80,
    };

    const assets = await generateImages(testEntry, config, TMP_DIR);
    expect(assets).toHaveLength(1);
    // Image was generated successfully (no errors)
    expect(assets[0].files[0].size).toBeGreaterThan(0);
  });
});
