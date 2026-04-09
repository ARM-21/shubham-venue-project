# Markdown/Rich Text as HTML Rendering Analysis - Events Page

## Overview
The events page uses **Tiptap** (a headless Vue/React rich text editor) for markdown-like rich text editing and rendering. Here's the complete flow:

---

## 1. **Rich Text Editor (Editor Side)**

### Component: [RichTextEditor.jsx](frontend/src/components/shared/RichTextEditor.jsx)

**Key Properties:**
- **Library**: Tiptap v3.22.3
- **Editor Type**: Headless editor (ProseMirror-based)
- **Output Format**: HTML strings

**Extensions Used:**
```jsx
extensions: [
  StarterKit.configure({
    heading: { levels: [2, 3] }  // H2 and H3 only
  }),
  Link.configure({ openOnClick: false })
]
```

**Supported Formatting:**
- **Text**: Bold (`<strong>`), Italic (`<em>`), Code (`<code>`)
- **Headings**: H2, H3
- **Lists**: Bullet lists (`<ul>`), Ordered lists (`<ol>`)
- **Links**: With `href` attribute

**Output Example:**
```html
<!-- Input: "Hello **world**" -->
<p>Hello <strong>world</strong></p>

<!-- Input: "# Title" (H2) -->
<h2>Title</h2>

<!-- Input: "Visit [Google](https://google.com)" -->
<p>Visit <a href="https://google.com">Google</a></p>
```

**Editor HTML Callback:**
```jsx
onUpdate: ({ editor }) => {
  onChange(editor.getHTML());  // Converts to HTML string
}
```

---

## 2. **HTML Sanitization & Display (Display Side)**

### Component: [RichTextDisplay.jsx](frontend/src/components/shared/RichTextDisplay.jsx)

**Purpose**: Safely render HTML content without XSS attacks

**Sanitization Process:**

#### Allowed Tags:
```jsx
const allowedTags = [
  "p", "br",           // Paragraphs & line breaks
  "strong", "b",       // Bold
  "em", "i",          // Italic
  "u",                // Underline
  "h1", "h2", "h3", "h4", "h5", "h6",  // Headings
  "ul", "ol", "li",   // Lists
  "a",                // Links
  "span", "code", "pre"  // Inline code & preformatted
];
```

#### Sanitization Rules:

1. **Remove Disallowed Tags** (but keep content):
   ```jsx
   // Input:  <script>alert('xss')</script><p>Hello</p>
   // Output: alert('xss')<p>Hello</p>
   if (!allowedTags.includes(tagName)) {
     while (child.firstChild) {
       node.insertBefore(child.firstChild, child);
     }
     node.removeChild(child);
   }
   ```

2. **Link Processing**:
   ```jsx
   if (tagName === "a") {
     const href = child.getAttribute("href");
     const newLink = document.createElement("a");
     newLink.href = href?.startsWith("http") ? href : `https://${href}`;
     newLink.target = "_blank";           // Open in new tab
     newLink.rel = "noopener noreferrer";  // Security
     newLink.className = "text-[#C0A04C] hover:underline";
     newLink.textContent = child.textContent;
     child.replaceWith(newLink);
   }
   ```

3. **Remove All Other Attributes**:
   ```jsx
   Array.from(child.attributes).forEach((attr) => {
     child.removeAttribute(attr.name);
   });
   ```

#### Rendering with `dangerouslySetInnerHTML`:
```jsx
<div
  className={`text-[#3a1224] space-y-2 leading-relaxed ${className}`}
  dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
/>
```

---

## 3. **CSS Styling for Tiptap Content**

### File: [global.css](frontend/src/app/global.css)

**Editor Styles (`.ProseMirror`):**

```css
/* TipTap Editor Styles */
.ProseMirror {
  outline: none;
}

.ProseMirror p {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.ProseMirror h2 {
  font-size: 1.5rem;        /* 24px */
  font-weight: 700;
  margin: 1rem 0 0.5rem 0;
  color: #3a1224;           /* Dark brown */
}

.ProseMirror h3 {
  font-size: 1.25rem;       /* 20px */
  font-weight: 600;
  margin: 0.75rem 0 0.5rem 0;
  color: #3a1224;
}

.ProseMirror strong {
  font-weight: 700;
}

.ProseMirror em {
  font-style: italic;
}

.ProseMirror code {
  background: #f3f4f6;      /* Light gray */
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875em;
  color: #374151;           /* Medium gray */
}
```

---

## 4. **HTML Output Examples**

### Example 1: Event Description
```html
<!-- Input Text -->
Welcome to our **premium wedding** reception!

We offer:
- Catering services
- Decoration
- Entertainment

Visit our [website](https://example.com) for more info.

<!-- Output HTML -->
<div dangerouslySetInnerHTML={{
  __html: `
    <p>Welcome to our <strong>premium wedding</strong> reception!</p>
    <p>We offer:</p>
    <ul>
      <li>Catering services</li>
      <li>Decoration</li>
      <li>Entertainment</li>
    </ul>
    <p>Visit our <a href="https://example.com" target="_blank" class="text-[#C0A04C] hover:underline">website</a> for more info.</p>
  `
}} />
```

### Example 2: Complex Formatting
```html
<!-- Input -->
## Event Details
We're excited to host you!

Important: *Please arrive early*

<!-- Output -->
<h2>Event Details</h2>
<p>We're excited to host you!</p>
<p>Important: <em>Please arrive early</em></p>
```

---

## 5. **Flow Diagram: Markdown → HTML**

```
User Input (Event Description)
    ↓
[RichTextEditor Component]
  - Uses Tiptap with StarterKit
  - Converts formatting to HTML
  - Stores as HTML string in state/database
    ↓
HTML String Stored
  (e.g., "<p>Hello <strong>world</strong></p>")
    ↓
[RichTextDisplay Component]
  - Receives HTML string
  - Runs sanitizeHtml() function
    - Removes dangerous tags/attributes
    - Processes links safely
    - Validates all remaining tags
  - Renders with dangerouslySetInnerHTML
    ↓
Browser Renders HTML
  <div>
    <p>Hello <strong>world</strong></p>
  </div>
    ↓
Visual Output: "Hello world" (with bold styling)
```

---

## 6. **Integration in Events Page**

### Where It's Used:
- **[page.jsx](frontend/src/app/(site)/events/[eventId]/page.jsx)** - Main event detail page
- **[EventDetails.jsx](frontend/src/app/(site)/events/[eventId]/components/EventDetails.jsx)** - Event details section
- Event descriptions, terms, and other rich content fields

### Data Flow:
```jsx
// In page.jsx
const { data: eventData } = useQueryEventDetailPublic(eventId);
const event = eventData?.event || null;
// event.description contains HTML from Tiptap

// In EventDetails.jsx
<p className="text-[#3a1224]/60 mt-2 text-sm">
  {event.description?.substring(0, 100)}...
</p>
// Displays plain text preview (first 100 chars)

// For full HTML rendering, use RichTextDisplay:
// <RichTextDisplay content={event.description} />
```

---

## 7. **Security Considerations**

### XSS Protection:
1. ✅ **Whitelist Approach**: Only allows specific HTML tags
2. ✅ **Attribute Stripping**: Removes all attributes except `href` on links
3. ✅ **URL Validation**: Ensures links start with `http://` or `https://`
4. ✅ **Sandboxing**: Links open in new tabs with `rel="noopener noreferrer"`

### Potential Issues:
- ⚠️ `dangerouslySetInnerHTML` is used, but content is pre-sanitized
- ⚠️ Code blocks (`<code>`) don't escape inner HTML - be careful with code samples

---

## 8. **Key Files Summary**

| File | Purpose | Tech |
|------|---------|------|
| [RichTextEditor.jsx](frontend/src/components/shared/RichTextEditor.jsx) | Creates/edits rich text | Tiptap, StarterKit |
| [RichTextDisplay.jsx](frontend/src/components/shared/RichTextDisplay.jsx) | Displays HTML safely | Sanitization + dangerouslySetInnerHTML |
| [global.css](frontend/src/app/global.css) | Styles editor content | CSS for `.ProseMirror` |
| [page.jsx](frontend/src/app/(site)/events/[eventId]/page.jsx) | Main event page | React, queries |
| [EventDetails.jsx](frontend/src/app/(site)/events/[eventId]/components/EventDetails.jsx) | Event info display | Component composition |

---

## 9. **How to Use in Events Page**

### Display Rich HTML:
```jsx
import { RichTextDisplay } from "components/shared/RichTextDisplay";

// In EventDetails or any component
<RichTextDisplay 
  content={event.description}  // HTML string from Tiptap
  className="text-base mt-4"
/>
```

### Edit Rich Text:
```jsx
import { RichTextEditor } from "components/shared/RichTextEditor";

// In event creation/edit form
const [description, setDescription] = useState("");

<RichTextEditor 
  value={description}
  onChange={setDescription}
  placeholder="Enter event description..."
/>
```

---

## 10. **Supported Markdown → HTML Conversions**

| Input | HTML Output |
|-------|-------------|
| `**bold**` | `<strong>bold</strong>` |
| `*italic*` | `<em>italic</em>` |
| `` `code` `` | `<code>code</code>` |
| `## Heading` | `<h2>Heading</h2>` |
| `- List item` | `<li>List item</li>` |
| `[Link](url)` | `<a href="url">Link</a>` |
| `> Quote` | ❌ Not supported (not in StarterKit) |
| `![Image](url)` | ❌ Not supported (no image extension) |

---

## Summary

The events page uses **Tiptap** for rich text editing that outputs HTML. Content is safely rendered using:
1. **Sanitization** - Whitelist-based HTML validation
2. **Security** - Removes dangerous attributes/scripts
3. **Styling** - ProseMirror CSS classes + Tailwind
4. **Display** - `dangerouslySetInnerHTML` after sanitization

This provides a balance between rich formatting and security. 🔒
