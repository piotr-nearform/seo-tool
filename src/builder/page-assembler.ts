import nunjucks from 'nunjucks';
import type { PageData } from './types.js';

/**
 * Assemble a complete HTML page by rendering a layout template with page data.
 */
export async function assemblePage(
  pageData: PageData,
  layoutTemplate: string,
  env: nunjucks.Environment,
): Promise<string> {
  const context = {
    page: {
      entry: pageData.entry,
      content: pageData.content,
      assets: pageData.assets,
      seo: pageData.seo,
      internalLinks: pageData.internalLinks,
    },
  };

  return new Promise<string>((resolve, reject) => {
    env.renderString(layoutTemplate, context, (err, result) => {
      if (err) return reject(err);
      resolve(result ?? '');
    });
  });
}
