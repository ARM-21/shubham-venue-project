"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Underline, List, ListOrdered, Heading2, Link2, Code } from "lucide-react";

const FORMATTING_BUTTONS = [
  { command: "toggleBold", active: "bold", icon: Bold, label: "Bold" },
  { command: "toggleItalic", active: "italic", icon: Italic, label: "Italic" },
  { command: "toggleCode", active: "code", icon: Code, label: "Code" },
  { command: "divider" },
  { command: "toggleHeading", level: 2, active: "heading", icon: Heading2, label: "Heading 2" },
  { command: "divider" },
  { command: "toggleBulletList", active: "bulletList", icon: List, label: "Bullet List" },
  { command: "toggleOrderedList", active: "orderedList", icon: ListOrdered, label: "Ordered List" },
  { command: "divider" },
  { command: "toggleLink", active: "link", icon: Link2, label: "Link" },
];

export function RichTextEditor({ value, onChange, placeholder = "Enter text...", error }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-48 p-4",
        style: "font-size: 14px; line-height: 1.6;",
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData("text/plain");
        if (text && !event.clipboardData?.types.includes("text/html")) {
          event.preventDefault();
          const { selection } = view.state;
          view.dispatch(view.state.tr.insertText(text, selection.from, selection.to));
          return true;
        }
        return false;
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleFormat = (cmd, options = {}) => {
    if (cmd === "toggleLink") {
      const url = prompt("Enter URL:", "https://");
      if (url) {
        editor.chain().focus().toggleLink({ href: url }).run();
      }
      return;
    }

    if (cmd === "toggleHeading") {
      editor.chain().focus().toggleHeading({ level: options.level }).run();
      return;
    }

    editor.chain().focus()[cmd]().run();
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 bg-[#fdfaf6] border border-[#3a1224]/10 rounded-t-xl">
        {FORMATTING_BUTTONS.map((btn, idx) => {
          if (btn.command === "divider") {
            return <div key={idx} className="w-px bg-[#3a1224]/20" />;
          }

          const Icon = btn.icon;
          const isActive = btn.active ? editor.isActive(btn.active, { level: btn.level }) : false;

          return (
            <button
              key={btn.command}
              onClick={() => handleFormat(btn.command, btn)}
              title={btn.label}
              className={`p-2 rounded transition-colors ${
                isActive
                  ? "bg-[#C0A04C]/20 text-[#C0A04C]"
                  : "hover:bg-[#3a1224]/10 text-[#3a1224]/60 hover:text-[#3a1224]"
              }`}
              type="button"
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        className={`border rounded-b-xl overflow-hidden focus-within:ring-2 ring-[#C0A04C]/20 ${
          error ? "border-red-500" : "border-[#3a1224]/10"
        }`}
      >
        <EditorContent 
          editor={editor}
          className="bg-white text-[#3a1224]"
          style={{
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        />
      </div>

      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

      {/* Character count */}
      {editor.getText() && (
        <p className="text-xs text-[#3a1224]/50 font-bold">
          {editor.getText().length} characters
        </p>
      )}
    </div>
  );
}
