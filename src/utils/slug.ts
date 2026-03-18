const MAX_SLUG_LENGTH = 75;

export function slugify(input: string): string {
  const slug = input
    .normalize('NFKD')
    // Strip combining diacritical marks (unicode accents)
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    // Replace any non-alphanumeric character (except hyphen) with hyphen
    .replace(/[^a-z0-9-]/g, '-')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');

  if (slug.length <= MAX_SLUG_LENGTH) {
    return slug;
  }

  // Truncate at word boundary (hyphen) if possible
  const truncated = slug.slice(0, MAX_SLUG_LENGTH);
  const lastHyphen = truncated.lastIndexOf('-');
  if (lastHyphen > 0) {
    return truncated.slice(0, lastHyphen);
  }
  return truncated;
}
