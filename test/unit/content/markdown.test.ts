import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../../../src/content/markdown.js';

describe('markdown', () => {
  // --- Story 4.3: Markdown template support ---

  it('should render basic markdown to HTML', async () => {
    const result = await renderMarkdown('# Hello\n\nWorld', {});
    expect(result).toContain('<h1>Hello</h1>');
    expect(result).toContain('<p>World</p>');
  });

  it('should render variables before markdown conversion', async () => {
    const result = await renderMarkdown('# {{ title }}', { title: 'My Page' });
    expect(result).toContain('<h1>My Page</h1>');
  });

  it('should handle bold and italic', async () => {
    const result = await renderMarkdown('**bold** and *italic*', {});
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em>italic</em>');
  });

  it('should handle lists with variables', async () => {
    const template = '- {{ item1 }}\n- {{ item2 }}\n- {{ item3 }}';
    const result = await renderMarkdown(template, {
      item1: 'First',
      item2: 'Second',
      item3: 'Third',
    });
    expect(result).toContain('<li>First</li>');
    expect(result).toContain('<li>Second</li>');
    expect(result).toContain('<li>Third</li>');
  });

  it('should handle links', async () => {
    const result = await renderMarkdown('[{{ text }}]({{ url }})', {
      text: 'Click here',
      url: 'https://example.com',
    });
    expect(result).toContain('<a href="https://example.com">Click here</a>');
  });

  it('should handle nested page variables', async () => {
    const template = '# {{ page.title }}\n\n{{ page.description }}';
    const result = await renderMarkdown(template, {
      page: { title: 'Test', description: 'A test page' },
    });
    expect(result).toContain('<h1>Test</h1>');
    expect(result).toContain('<p>A test page</p>');
  });

  it('should handle Nunjucks conditionals in markdown', async () => {
    const template = '{% if show %}**visible**{% else %}*hidden*{% endif %}';
    const resultShow = await renderMarkdown(template, { show: true });
    expect(resultShow).toContain('<strong>visible</strong>');

    const resultHide = await renderMarkdown(template, { show: false });
    expect(resultHide).toContain('<em>hidden</em>');
  });

  it('should handle Nunjucks loops in markdown', async () => {
    const template = '{% for item in items %}- {{ item }}\n{% endfor %}';
    const result = await renderMarkdown(template, {
      items: ['Alpha', 'Beta', 'Gamma'],
    });
    expect(result).toContain('<li>Alpha</li>');
    expect(result).toContain('<li>Beta</li>');
    expect(result).toContain('<li>Gamma</li>');
  });
});
