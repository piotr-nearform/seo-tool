/**
 * Generate a robots.txt file with sitemap reference.
 */
export function generateRobots(baseUrl: string, sitemapPath: string): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${baseUrl}${sitemapPath}`,
    '',
  ].join('\n');
}
