/**
 * Test helper utilities
 */

import { renderToString } from 'react-dom/server';

/**
 * Decodes HTML entities in a string
 * Converts &quot; -> ", &apos; -> ', &lt; -> <, &gt; -> >, &amp; -> &
 */
export function decodeHtmlEntities(html: string): string {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = html;
  return textArea.value;
}

/**
 * Renders a React component to string and decodes HTML entities
 */
export function renderToDecodedString(jsx: React.ReactNode): string {
  const html = renderToString(jsx);
  return decodeHtmlEntities(html);
}

/**
 * Removes React's comment nodes from rendered HTML
 * React inserts <!-- --> between fragments which can interfere with string matching
 */
export function stripReactComments(html: string): string {
  return html.replace(/<!--\s*-->/g, '');
}
