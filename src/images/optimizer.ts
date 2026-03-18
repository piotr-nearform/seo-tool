import sharp from 'sharp';

export interface OptimizedImage {
  buffer: Buffer;
  size: number;
}

/**
 * Optimize an image buffer to the specified format and quality.
 */
export async function optimizeImage(
  buffer: Buffer,
  format: 'webp' | 'png',
  quality: number = 80,
): Promise<OptimizedImage> {
  let pipeline = sharp(buffer);

  if (format === 'webp') {
    pipeline = pipeline.webp({ quality });
  } else {
    pipeline = pipeline.png({ compressionLevel: 9 });
  }

  const outputBuffer = await pipeline.toBuffer();
  return {
    buffer: outputBuffer,
    size: outputBuffer.length,
  };
}
