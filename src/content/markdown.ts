import MarkdownIt from 'markdown-it';
import { renderString } from './template-engine.js';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

/**
 * Render a markdown template: first process Nunjucks variables, then convert to HTML.
 */
export async function renderMarkdown(
  template: string,
  context: Record<string, unknown>,
): Promise<string> {
  // First pass: render Nunjucks variables/expressions
  const rendered = await renderString(template, context);

  // Second pass: convert markdown to HTML
  return md.render(rendered);
}
