export interface StructuredDataResult {
  page: string;
  errors: string[];
}

// Required fields per schema type
const REQUIRED_FIELDS: Record<string, string[]> = {
  WebPage: ['name', 'url'],
  Product: ['name'],
  FAQPage: ['mainEntity'],
  BreadcrumbList: ['itemListElement'],
  Article: ['headline', 'author'],
  Organization: ['name', 'url'],
  LocalBusiness: ['name', 'address'],
  Event: ['name', 'startDate'],
  Person: ['name'],
  Review: ['reviewBody', 'author'],
};

/**
 * Validate JSON-LD structured data objects on pages.
 * Checks for @context, @type, and required fields per type.
 */
export function validateStructuredData(
  pages: { url: string; jsonLd: object[] }[],
): StructuredDataResult[] {
  const results: StructuredDataResult[] = [];

  for (const page of pages) {
    const errors: string[] = [];

    for (let i = 0; i < page.jsonLd.length; i++) {
      const obj = page.jsonLd[i] as Record<string, unknown>;
      const prefix = page.jsonLd.length > 1 ? `JSON-LD[${i}]: ` : '';

      // Check @context
      if (!obj['@context']) {
        errors.push(`${prefix}Missing @context`);
      } else if (obj['@context'] !== 'https://schema.org') {
        errors.push(`${prefix}Invalid @context: expected "https://schema.org"`);
      }

      // Check @type
      if (!obj['@type']) {
        errors.push(`${prefix}Missing @type`);
      } else {
        const type = obj['@type'] as string;
        const requiredFields = REQUIRED_FIELDS[type];

        if (!requiredFields) {
          errors.push(`${prefix}Unknown schema type: ${type}`);
        } else {
          for (const field of requiredFields) {
            if (obj[field] === undefined || obj[field] === null) {
              errors.push(`${prefix}${type} missing required field: ${field}`);
            }
          }
        }
      }
    }

    if (errors.length > 0) {
      results.push({ page: page.url, errors });
    }
  }

  return results;
}
