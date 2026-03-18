import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import type {
  PageEntry,
  ImageConfig,
  GeneratedAsset,
} from '../schemas/index.js';
import { compositeImage } from './compositor.js';
import { optimizeImage } from './optimizer.js';

/**
 * Build a context object from a PageEntry for template interpolation.
 */
export function buildContext(entry: PageEntry): Record<string, unknown> {
  return {
    title: entry.title,
    description: entry.description,
    slug: entry.slug,
    url: entry.url,
    ...entry.dimensions,
    ...Object.fromEntries(
      Object.entries(entry.data).filter(
        ([, v]) => typeof v === 'string' || typeof v === 'number',
      ),
    ),
  };
}

/**
 * Generate alt text from page entry dimensions.
 */
export function generateAltText(entry: PageEntry): string {
  const dimensionValues = Object.values(entry.dimensions);
  if (dimensionValues.length > 0) {
    return `${entry.title} - ${dimensionValues.join(' ')}`;
  }
  return entry.title;
}

/**
 * Generate images for a page entry using the provided image config.
 * Returns metadata about all generated files.
 */
export async function generateImages(
  entry: PageEntry,
  imageConfig: ImageConfig,
  projectDir: string,
): Promise<GeneratedAsset[]> {
  const context = buildContext(entry);
  const assets: GeneratedAsset[] = [];

  for (const template of imageConfig.templates) {
    const imageBuffer = await compositeImage(template, context, projectDir);
    const files: { format: string; path: string; size: number }[] = [];

    for (const format of imageConfig.outputFormats) {
      const optimized = await optimizeImage(
        imageBuffer,
        format,
        imageConfig.quality,
      );

      const relativePath = join(
        'assets',
        'images',
        entry.slug,
        `${template.name}.${format}`,
      );
      const absolutePath = join(projectDir, relativePath);

      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, optimized.buffer);

      files.push({
        format,
        path: relativePath,
        size: optimized.size,
      });
    }

    assets.push({
      templateName: template.name,
      files,
      altText: generateAltText(entry),
    });
  }

  return assets;
}
