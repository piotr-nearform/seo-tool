import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { optimizeImage } from '../../../src/images/optimizer.js';

async function createTestPng(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 128, g: 128, b: 128, alpha: 1 },
    },
  })
    .png({ compressionLevel: 0 }) // uncompressed for a larger baseline
    .toBuffer();
}

describe('optimizeImage', () => {
  it('should convert to WebP format', async () => {
    const input = await createTestPng(100, 100);
    const result = await optimizeImage(input, 'webp', 80);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.size).toBeGreaterThan(0);

    const metadata = await sharp(result.buffer).metadata();
    expect(metadata.format).toBe('webp');
  });

  it('should convert to PNG format with compression', async () => {
    const input = await createTestPng(100, 100);
    const result = await optimizeImage(input, 'png');

    const metadata = await sharp(result.buffer).metadata();
    expect(metadata.format).toBe('png');
    expect(result.size).toBe(result.buffer.length);
  });

  it('should produce smaller or equal WebP output compared to uncompressed PNG input', async () => {
    const input = await createTestPng(200, 200);
    const result = await optimizeImage(input, 'webp', 80);
    expect(result.size).toBeLessThanOrEqual(input.length);
  });

  it('should produce smaller or equal compressed PNG output compared to uncompressed input', async () => {
    const input = await createTestPng(200, 200);
    const result = await optimizeImage(input, 'png');
    expect(result.size).toBeLessThanOrEqual(input.length);
  });

  it('should respect quality parameter for WebP', async () => {
    // Use a larger image with noise/gradient so compression differences are visible
    const input = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 3,
        noise: { type: 'gaussian', mean: 128, sigma: 50 },
      },
    })
      .png({ compressionLevel: 0 })
      .toBuffer();
    const highQuality = await optimizeImage(input, 'webp', 100);
    const lowQuality = await optimizeImage(input, 'webp', 10);
    // Low quality should be smaller for a complex image
    expect(lowQuality.size).toBeLessThan(highQuality.size);
  });

  it('should preserve image dimensions', async () => {
    const input = await createTestPng(150, 75);

    const webpResult = await optimizeImage(input, 'webp');
    const webpMeta = await sharp(webpResult.buffer).metadata();
    expect(webpMeta.width).toBe(150);
    expect(webpMeta.height).toBe(75);

    const pngResult = await optimizeImage(input, 'png');
    const pngMeta = await sharp(pngResult.buffer).metadata();
    expect(pngMeta.width).toBe(150);
    expect(pngMeta.height).toBe(75);
  });

  it('should use default quality of 80 for WebP', async () => {
    const input = await createTestPng(50, 50);
    // Should not throw when quality is omitted
    const result = await optimizeImage(input, 'webp');
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
