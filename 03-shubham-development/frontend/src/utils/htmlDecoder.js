/**
 * Decode HTML entities
 * Converts &lt; to <, &gt; to >, &quot; to ", etc.
 */
export function decodeHtml(html) {
  if (!html) return '';
  
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.documentElement.textContent || html;
}

/**
 * Alternative method using textarea (simpler)
 */
export function decodeHtmlSimple(html) {
  if (!html) return '';
  
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
}
