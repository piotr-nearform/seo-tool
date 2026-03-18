import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { ImageTemplateConfig, ImageOverlay } from '../schemas/index.js';

/**
 * Interpolate {{variable}} placeholders in a string using the provided context.
 */
export function interpolate(
  template: string,
  context: Record<string, unknown>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = context[key];
    return value !== undefined && value !== null ? String(value) : '';
  });
}

/**
 * Generate an SVG string for a text overlay.
 * Supports maxWidth-based text wrapping by splitting text into lines.
 */
export function generateTextSVG(
  overlay: ImageOverlay,
  context: Record<string, unknown>,
): string {
  const content = overlay.content
    ? interpolate(overlay.content, context)
    : '';
  const fontSize = overlay.fontSize ?? 24;
  const fontColor = overlay.fontColor ?? '#000000';
  const font = overlay.font ?? 'sans-serif';
  const maxWidth = overlay.maxWidth;

  const lines = wrapText(content, fontSize, maxWidth);

  const lineHeight = fontSize * 1.3;
  const totalHeight = lines.length * lineHeight;
  // Use a generous width for the SVG canvas
  const svgWidth = maxWidth ?? 1200;
  const svgHeight = totalHeight + fontSize;

  const textElements = lines
    .map((line, i) => {
      const y = fontSize + i * lineHeight;
      const escaped = escapeXml(line);
      return `<text x="0" y="${y}" font-family="${font}" font-size="${fontSize}" fill="${fontColor}">${escaped}</text>`;
    })
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
    ${textElements}
</svg>`;
}

/**
 * Wrap text into lines that fit within maxWidth pixels.
 * Uses a rough character-width estimate (0.6 * fontSize per character).
 */
export function wrapText(
  text: string,
  fontSize: number,
  maxWidth?: number,
): string[] {
  if (!maxWidth) {
    return [text];
  }

  const charWidth = fontSize * 0.6;
  const maxChars = Math.max(1, Math.floor(maxWidth / charWidth));

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= maxChars) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Composite an image from a template config and context data.
 * Creates or loads a base image, then applies overlays in order.
 */
export async function compositeImage(
  template: ImageTemplateConfig,
  context: Record<string, unknown>,
  projectDir?: string,
): Promise<Buffer> {
  let image: sharp.Sharp;

  if (template.baseImage) {
    const basePath = projectDir
      ? resolve(projectDir, template.baseImage)
      : template.baseImage;
    const baseBuffer = await readFile(basePath);
    image = sharp(baseBuffer).resize(template.width, template.height);
  } else {
    // Create a blank canvas with a solid color
    image = sharp({
      create: {
        width: template.width,
        height: template.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    }).png();
  }

  const compositeInputs: sharp.OverlayOptions[] = [];

  for (const overlay of template.overlays) {
    if (overlay.type === 'text') {
      const svg = generateTextSVG(overlay, context);
      const svgBuffer = Buffer.from(svg);
      // Resize the SVG to fit within the remaining image bounds
      const maxW = Math.max(1, template.width - overlay.x);
      const maxH = Math.max(1, template.height - overlay.y);
      const resized = await sharp(svgBuffer)
        .resize({
          width: maxW,
          height: maxH,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer();
      compositeInputs.push({
        input: resized,
        left: overlay.x,
        top: overlay.y,
      });
    } else if (overlay.type === 'image') {
      if (!overlay.source) continue;
      const sourcePath = projectDir
        ? resolve(projectDir, overlay.source)
        : overlay.source;
      const sourceBuffer = await readFile(sourcePath);
      let overlayImage = sharp(sourceBuffer);
      if (overlay.width || overlay.height) {
        overlayImage = overlayImage.resize(
          overlay.width ?? undefined,
          overlay.height ?? undefined,
        );
      }
      const resizedBuffer = await overlayImage.toBuffer();
      compositeInputs.push({
        input: resizedBuffer,
        left: overlay.x,
        top: overlay.y,
      });
    }
  }

  if (compositeInputs.length > 0) {
    image = image.composite(compositeInputs);
  }

  return image.png().toBuffer();
}
