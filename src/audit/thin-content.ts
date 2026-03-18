export interface ThinContentResult {
  page: string;
  wordCount: number;
  threshold: number;
}

/**
 * Strip HTML tags from text.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ');
}

/**
 * Count words in text after stripping HTML.
 */
function countWords(text: string): number {
  return stripHtml(text).split(/\s+/).filter(Boolean).length;
}

/**
 * Check for thin content pages (below minimum word count).
 * Returns only flagged pages.
 */
export function checkThinContent(
  pages: { url: string; content: string }[],
  minWordCount: number = 300,
): ThinContentResult[] {
  const results: ThinContentResult[] = [];

  for (const page of pages) {
    const wc = countWords(page.content);
    if (wc < minWordCount) {
      results.push({
        page: page.url,
        wordCount: wc,
        threshold: minWordCount,
      });
    }
  }

  return results;
}
