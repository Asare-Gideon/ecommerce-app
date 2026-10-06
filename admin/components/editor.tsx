"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Italic, List, ListOrdered, Pilcrow, Redo2, Strikethrough, Undo2 } from "lucide-react";
import { useEffect } from "react";

type EditorProps = {
  editorState: string;
  setEditorState: (value: string) => void;
};

const toolbarGroups = [
  [
    {
      label: "Paragraph",
      icon: Pilcrow,
      action: "paragraph",
    },
    {
      label: "Heading",
      icon: Heading2,
      action: "heading",
    },
  ],
  [
    {
      label: "Bold",
      icon: Bold,
      action: "bold",
    },
    {
      label: "Italic",
      icon: Italic,
      action: "italic",
    },
    {
      label: "Strike",
      icon: Strikethrough,
      action: "strike",
    },
  ],
  [
    {
      label: "Bullet list",
      icon: List,
      action: "bulletList",
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      action: "orderedList",
    },
  ],
  [
    {
      label: "Undo",
      icon: Undo2,
      action: "undo",
    },
    {
      label: "Redo",
      icon: Redo2,
      action: "redo",
    },
  ],
] as const;

export default function Editor({ editorState, setEditorState }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: editorState || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[260px] rounded-b-md border border-t-0 border-input bg-background px-3 py-3 text-sm outline-none prose prose-sm max-w-none focus-visible:ring-2 focus-visible:ring-ring",
      },
    },
    onUpdate: ({ editor }) => {
      setEditorState(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();
    const nextHtml = editorState || "";
    if (currentHtml !== nextHtml) {
      editor.commands.setContent(nextHtml, false);
    }
  }, [editor, editorState]);

  const runCommand = (action: (typeof toolbarGroups)[number][number]["action"]) => {
    if (!editor) return;

    const chain = editor.chain().focus();

    if (action === "paragraph") chain.setParagraph().run();
    if (action === "heading") chain.toggleHeading({ level: 2 }).run();
    if (action === "bold") chain.toggleBold().run();
    if (action === "italic") chain.toggleItalic().run();
    if (action === "strike") chain.toggleStrike().run();
    if (action === "bulletList") chain.toggleBulletList().run();
    if (action === "orderedList") chain.toggleOrderedList().run();
    if (action === "undo") chain.undo().run();
    if (action === "redo") chain.redo().run();
  };

  const isActive = (action: (typeof toolbarGroups)[number][number]["action"]) => {
    if (!editor) return false;

    if (action === "paragraph") return editor.isActive("paragraph");
    if (action === "heading") return editor.isActive("heading", { level: 2 });
    if (action === "bold") return editor.isActive("bold");
    if (action === "italic") return editor.isActive("italic");
    if (action === "strike") return editor.isActive("strike");
    if (action === "bulletList") return editor.isActive("bulletList");
    if (action === "orderedList") return editor.isActive("orderedList");
    return false;
  };

  return (
    <div className="overflow-hidden rounded-md">
      <div className="flex flex-wrap gap-2 rounded-t-md border border-input bg-muted/30 p-2">
        {toolbarGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-1 border-r pr-2 last:border-r-0 last:pr-0">
            {group.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.action);

              return (
                <button
                  key={item.action}
                  type="button"
                  aria-label={item.label}
                  title={item.label}
                  onClick={() => runCommand(item.action)}
                  disabled={!editor}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-colors ${
                    active ? "border-primary bg-primary text-primary-foreground" : "border-transparent bg-background hover:bg-muted"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
