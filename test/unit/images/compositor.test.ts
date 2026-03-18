import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  compositeImage,
  generateTextSVG,
  interpolate,
  wrapText,
} from '../../../src/images/compositor.js';
import type { ImageTemplateConfig, ImageOverlay } from '../../../src/schemas/index.js';

const TMP_DIR = join(import.meta.dirname, '../../.tmp-compositor');

beforeAll(async () => {
  await mkdir(TMP_DIR, { recursive: true });
  // Create a small 50x50 red PNG fixture
  const fixture = await sharp({
    create: {
      width: 50,
      height: 50,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
  await writeFile(join(TMP_DIR, 'base.png'), fixture);

  // Create a small 10x10 blue PNG for overlay tests
  const overlayFixture = await sharp({
    create: {
      width: 10,
      height: 10,
      channels: 4,
      background: { r: 0, g: 0, b: 255, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
  await writeFile(join(TMP_DIR, 'overlay.png'), overlayFixture);
});

afterAll(async () => {
  await rm(TMP_DIR, { recursive: true, force: true });
});

describe('interpolate', () => {
  it('should replace {{variable}} placeholders with context values', () => {
    expect(interpolate('Hello {{name}}!', { name: 'World' })).toBe(
      'Hello World!',
    );
  });

  it('should replace multiple variables', () => {
    expect(
      interpolate('{{greeting}} {{name}}', { greeting: 'Hi', name: 'Bob' }),
    ).toBe('Hi Bob');
  });

  it('should replace missing variables with empty string', () => {
    expect(interpolate('Hello {{name}}!', {})).toBe('Hello !');
  });

  it('should handle numeric values', () => {
    expect(interpolate('Count: {{n}}', { n: 42 })).toBe('Count: 42');
  });

  it('should leave text without variables unchanged', () => {
    expect(interpolate('no variables here', { foo: 'bar' })).toBe(
      'no variables here',
    );
  });
});

describe('wrapText', () => {
  it('should return single line when no maxWidth', () => {
    expect(wrapText('hello world', 24)).toEqual(['hello world']);
  });

  it('should wrap long text into multiple lines', () => {
    const result = wrapText(
      'This is a fairly long sentence that should wrap',
      20,
      100,
    );
    expect(result.length).toBeGreaterThan(1);
    // All original words should be present
    const joined = result.join(' ');
    expect(joined).toBe('This is a fairly long sentence that should wrap');
  });

  it('should handle empty text', () => {
    expect(wrapText('', 24, 100)).toEqual(['']);
  });

  it('should return single line when text fits within maxWidth', () => {
    expect(wrapText('Hi', 20, 500)).toEqual(['Hi']);
  });
});

describe('generateTextSVG', () => {
  it('should produce valid SVG string', () => {
    const overlay: ImageOverlay = {
      type: 'text',
      content: 'Hello World',
      fontSize: 24,
      fontColor: '#FF0000',
      x: 10,
      y: 20,
    };
    const svg = generateTextSVG(overlay, {});
    expect(svg).toContain('<svg');
    expect(svg).toContain('Hello World');
    expect(svg).toContain('font-size="24"');
    expect(svg).toContain('fill="#FF0000"');
  });

  it('should interpolate variables in text', () => {
    const overlay: ImageOverlay = {
      type: 'text',
      content: '{{city}} Guide',
      x: 0,
      y: 0,
    };
    const svg = generateTextSVG(overlay, { city: 'New York' });
    expect(svg).toContain('New York Guide');
  });

  it('should use default values when optional fields are missing', () => {
    const overlay: ImageOverlay = { type: 'text', content: 'test', x: 0, y: 0 };
    const svg = generateTextSVG(overlay, {});
    expect(svg).toContain('font-size="24"');
    expect(svg).toContain('fill="#000000"');
    expect(svg).toContain('sans-serif');
  });

  it('should escape XML special characters', () => {
    const overlay: ImageOverlay = {
      type: 'text',
      content: 'A & B <C>',
      x: 0,
      y: 0,
    };
    const svg = generateTextSVG(overlay, {});
    expect(svg).toContain('&amp;');
    expect(svg).toContain('&lt;');
    expect(svg).toContain('&gt;');
  });

  it('should wrap text when maxWidth is set', () => {
    const overlay: ImageOverlay = {
      type: 'text',
      content: 'This is a long title that should definitely wrap onto multiple lines',
      fontSize: 20,
      maxWidth: 100,
      x: 0,
      y: 0,
    };
    const svg = generateTextSVG(overlay, {});
    // Multiple text elements indicate wrapping
    const textMatches = svg.match(/<text /g);
    expect(textMatches!.length).toBeGreaterThan(1);
  });

  it('should handle empty content', () => {
    const overlay: ImageOverlay = { type: 'text', x: 0, y: 0 };
    const svg = generateTextSVG(overlay, {});
    expect(svg).toContain('<svg');
  });
});

describe('compositeImage', () => {
  it('should create image from blank canvas when no baseImage', async () => {
    const template: ImageTemplateConfig = {
      name: 'test',
      width: 50,
      height: 50,
      overlays: [],
    };
    const buffer = await compositeImage(template, {});
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    // Verify it's a valid PNG
    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toBe(50);
    expect(metadata.height).toBe(50);
    expect(metadata.format).toBe('png');
  });

  it('should load base image from file', async () => {
    const template: ImageTemplateConfig = {
      name: 'test',
      baseImage: 'base.png',
      width: 50,
      height: 50,
      overlays: [],
    };
    const buffer = await compositeImage(template, {}, TMP_DIR);
    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toBe(50);
    expect(metadata.height).toBe(50);
  });

  it('should composite text overlay onto image', async () => {
    const template: ImageTemplateConfig = {
      name: 'test',
      width: 200,
      height: 100,
      overlays: [
        {
          type: 'text',
          content: 'Hello {{name}}',
          fontSize: 16,
          fontColor: '#000000',
          x: 10,
          y: 10,
        },
      ],
    };
    const buffer = await compositeImage(template, { name: 'World' });
    expect(buffer).toBeInstanceOf(Buffer);
    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toBe(200);
    expect(metadata.height).toBe(100);
  });

  it('should composite image overlay onto base', async () => {
    const template: ImageTemplateConfig = {
      name: 'test',
      baseImage: 'base.png',
      width: 50,
      height: 50,
      overlays: [
        {
          type: 'image',
          source: 'overlay.png',
          x: 5,
          y: 5,
          width: 10,
          height: 10,
        },
      ],
    };
    const buffer = await compositeImage(template, {}, TMP_DIR);
    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toBe(50);
    expect(metadata.height).toBe(50);
  });

  it('should handle multiple overlays in order', async () => {
    const template: ImageTemplateConfig = {
      name: 'test',
      width: 200,
      height: 100,
      overlays: [
        { type: 'text', content: 'First', fontSize: 12, x: 0, y: 0 },
        { type: 'text', content: 'Second', fontSize: 12, x: 0, y: 30 },
      ],
    };
    const buffer = await compositeImage(template, {});
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should skip image overlay without source', async () => {
    const template: ImageTemplateConfig = {
      name: 'test',
      width: 50,
      height: 50,
      overlays: [{ type: 'image', x: 0, y: 0 }],
    };
    const buffer = await compositeImage(template, {});
    expect(buffer).toBeInstanceOf(Buffer);
  });
});
