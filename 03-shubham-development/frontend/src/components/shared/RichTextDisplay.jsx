/**
 * RichTextDisplay - Renders rich text content safely
 * Sanitizes HTML to prevent XSS attacks
 */
export function RichTextDisplay({ content, className = "" }) {
  if (!content) return null;

  // Sanitize HTML - only allow safe tags and attributes
  const sanitizeHtml = (html) => {
    const allowedTags = ["p", "br", "strong", "b", "em", "i", "u", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "a", "span", "code", "pre"];
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    const sanitize = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          return;
        }

        if (child.nodeType === Node.ELEMENT_NODE) {
          const tagName = child.tagName.toLowerCase();

          // Remove disallowed tags but keep content
          if (!allowedTags.includes(tagName)) {
            while (child.firstChild) {
              node.insertBefore(child.firstChild, child);
            }
            node.removeChild(child);
            return;
          }

          // Only allow href for links, remove other attributes
          if (tagName === "a") {
            const href = child.getAttribute("href");
            const newLink = document.createElement("a");
            newLink.href = href?.startsWith("http") ? href : `https://${href}`;
            newLink.target = "_blank";
            newLink.rel = "noopener noreferrer";
            newLink.className = "text-[#C0A04C] hover:underline";
            newLink.textContent = child.textContent;
            child.replaceWith(newLink);
          } else {
            // Remove all attributes
            Array.from(child.attributes).forEach((attr) => {
              child.removeAttribute(attr.name);
            });
          }

          sanitize(child);
        }
      });
    };

    sanitize(tempDiv);
    return tempDiv.innerHTML;
  };

  return (
    <div
      className={`text-[#3a1224] space-y-2 leading-relaxed ${className}`}
      style={{
        fontSize: "14px",
        lineHeight: "1.6",
      }}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
    />
  );
}
