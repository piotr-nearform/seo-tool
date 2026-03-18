import nunjucks from 'nunjucks';
import path from 'node:path';

/**
 * Create and configure a Nunjucks environment with custom filters.
 */
export function createEnvironment(templateDir?: string): nunjucks.Environment {
  const loader = templateDir
    ? new nunjucks.FileSystemLoader(templateDir, { noCache: true })
    : undefined;

  const env = new nunjucks.Environment(loader as any, {
    autoescape: false,
    throwOnUndefined: false,
    trimBlocks: true,
    lstripBlocks: true,
  });

  // Custom filters
  env.addFilter('slugify', slugifyFilter);
  env.addFilter('truncate', truncateFilter);
  env.addFilter('uppercase', (str: string) => String(str).toUpperCase());
  env.addFilter('lowercase', (str: string) => String(str).toLowerCase());
  env.addFilter('titlecase', titlecaseFilter);

  return env;
}

function slugifyFilter(input: string): string {
  return String(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function truncateFilter(input: string, length: number): string {
  const str = String(input);
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

function titlecaseFilter(input: string): string {
  return String(input).replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase(),
  );
}

/**
 * Render a template file with the given context.
 */
export async function renderTemplate(
  templatePath: string,
  context: Record<string, unknown>,
): Promise<string> {
  const dir = path.dirname(templatePath);
  const file = path.basename(templatePath);
  const env = createEnvironment(dir);

  return new Promise<string>((resolve, reject) => {
    env.render(file, context, (err, result) => {
      if (err) return reject(err);
      resolve(result ?? '');
    });
  });
}

/**
 * Render a template string with the given context.
 */
export async function renderString(
  template: string,
  context: Record<string, unknown>,
): Promise<string> {
  const env = createEnvironment();

  return new Promise<string>((resolve, reject) => {
    env.renderString(template, context, (err, result) => {
      if (err) return reject(err);
      resolve(result ?? '');
    });
  });
}
