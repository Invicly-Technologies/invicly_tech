"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link2, RemoveFormatting } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS = [
  { command: "bold", icon: Bold, label: "Bold" },
  { command: "italic", icon: Italic, label: "Italic" },
  { command: "underline", icon: Underline, label: "Underline" },
  { command: "insertUnorderedList", icon: List, label: "Bulleted list" },
  { command: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
];

export function RichTextEditor({ value, onChange, placeholder, className }) {
  const editorRef = useRef(null);
  const initializedFor = useRef(null);

  // Sync innerHTML only when the editor is (re)mounted for a new message, not on every keystroke —
  // that would clobber the caret position since contentEditable is intentionally uncontrolled.
  useEffect(() => {
    if (editorRef.current && initializedFor.current !== editorRef.current) {
      editorRef.current.innerHTML = value || "";
      initializedFor.current = editorRef.current;
    }
  }, [value]);

  function emitChange() {
    onChange?.(editorRef.current?.innerHTML || "");
  }

  function exec(command) {
    editorRef.current?.focus();
    document.execCommand(command);
    emitChange();
  }

  function insertLink() {
    const url = window.prompt("Link URL (https://...)");
    if (!url) return;
    editorRef.current?.focus();
    document.execCommand("createLink", false, url);
    emitChange();
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-1.5">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.command}
              type="button"
              title={tool.label}
              onClick={() => exec(tool.command)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Icon size={15} />
            </button>
          );
        })}
        <button
          type="button"
          title="Insert link"
          onClick={insertLink}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Link2 size={15} />
        </button>
        <button
          type="button"
          title="Clear formatting"
          onClick={() => exec("removeFormat")}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <RemoveFormatting size={15} />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={emitChange}
        onBlur={emitChange}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        className="max-h-80 min-h-36 overflow-y-auto px-3.5 py-3 text-sm text-foreground outline-none [&_a]:text-primary [&_a]:underline [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc"
      />
    </div>
  );
}
