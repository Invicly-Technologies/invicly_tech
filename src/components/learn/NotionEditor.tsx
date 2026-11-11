"use client";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Highlight from "@tiptap/extension-highlight";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  Check,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Strikethrough,
  Type,
  Underline,
} from "lucide-react";
import type { FormState } from "@/app/learn/actions";
import { cn } from "@/lib/cn";

type Cmd = { key: string; label: string; hint: string; icon: typeof Type; run: (e: Editor) => void; alias: string };

const COMMANDS: Cmd[] = [
  { key: "text", label: "Text", hint: "Plain paragraph", icon: Type, alias: "paragraph p", run: (e) => e.chain().focus().setParagraph().run() },
  { key: "h1", label: "Heading 1", hint: "Big section heading", icon: Heading1, alias: "title h1 #", run: (e) => e.chain().focus().setHeading({ level: 1 }).run() },
  { key: "h2", label: "Heading 2", hint: "Medium heading", icon: Heading2, alias: "subtitle h2 ##", run: (e) => e.chain().focus().setHeading({ level: 2 }).run() },
  { key: "h3", label: "Heading 3", hint: "Small heading", icon: Heading3, alias: "h3 ###", run: (e) => e.chain().focus().setHeading({ level: 3 }).run() },
  { key: "todo", label: "To-do list", hint: "Track tasks with checkboxes", icon: ListChecks, alias: "task checkbox check [] todo", run: (e) => e.chain().focus().toggleTaskList().run() },
  { key: "bullet", label: "Bulleted list", hint: "Simple bulleted list", icon: List, alias: "ul unordered -", run: (e) => e.chain().focus().toggleBulletList().run() },
  { key: "number", label: "Numbered list", hint: "List with numbering", icon: ListOrdered, alias: "ol ordered 1.", run: (e) => e.chain().focus().toggleOrderedList().run() },
  { key: "quote", label: "Quote", hint: "Capture a quote", icon: Quote, alias: "blockquote >", run: (e) => e.chain().focus().toggleBlockquote().run() },
  { key: "code", label: "Code block", hint: "Commands or snippets", icon: Code2, alias: "pre snippet ```", run: (e) => e.chain().focus().toggleCodeBlock().run() },
  { key: "divider", label: "Divider", hint: "Separate sections", icon: Minus, alias: "hr line ---", run: (e) => e.chain().focus().setHorizontalRule().run() },
];

type Slash = { from: number; query: string; x: number; y: number } | null;

export function NotionEditor({
  initial,
  onSave,
  placeholder = "Write something, or type '/' for commands…",
  className,
  autofocus = false,
  label,
}: {
  initial: string;
  onSave: (html: string) => Promise<FormState>;
  placeholder?: string;
  className?: string;
  autofocus?: boolean;
  label: string;
}) {
  const [status, setStatus] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
  const [slash, setSlash] = useState<Slash>(null);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef(initial);
  const slashRef = useRef<{ slash: Slash; items: Cmd[]; active: number }>({ slash: null, items: COMMANDS, active: 0 });

  const items = useMemo(() => {
    const q = (slash?.query ?? "").toLowerCase().trim();
    return q ? COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.alias.includes(q)) : COMMANDS;
  }, [slash]);
  slashRef.current = { slash, items, active };

  const save = useCallback(
    async (html: string) => {
      if (html === lastSaved.current) return setStatus("saved");
      setStatus("saving");
      const r = await onSave(html);
      if (r?.error) setStatus("error");
      else {
        lastSaved.current = html;
        setStatus("saved");
      }
    },
    [onSave],
  );

  const runCommand = (editor: Editor, cmd: Cmd) => {
    const s = slashRef.current.slash;
    if (s) editor.chain().focus().deleteRange({ from: s.from, to: editor.state.selection.from }).run();
    cmd.run(editor);
    setSlash(null);
  };

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: autofocus ? "end" : false,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true, defaultProtocol: "https" }, heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({
        placeholder: ({ node }) => (node.type.name === "heading" ? `Heading ${node.attrs.level}` : placeholder),
        showOnlyCurrent: true,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
    ],
    content: initial || "",
    editorProps: {
      attributes: { class: "nt-editor", "aria-label": label, role: "textbox", "aria-multiline": "true" },
      handleKeyDown: (_view, e) => {
        const { slash: s, items: list, active: a } = slashRef.current;
        if (!s || list.length === 0) return false;
        if (e.key === "ArrowDown") {
          setActive((a + 1) % list.length);
          return true;
        }
        if (e.key === "ArrowUp") {
          setActive((a - 1 + list.length) % list.length);
          return true;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          if (editorRef.current) runCommand(editorRef.current, list[a]);
          return true;
        }
        if (e.key === "Escape") {
          setSlash(null);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      setStatus("dirty");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => save(ed.getHTML()), 900);
      detectSlash(ed);
    },
    onSelectionUpdate: ({ editor: ed }) => detectSlash(ed),
    onBlur: ({ editor: ed }) => {
      if (timer.current) clearTimeout(timer.current);
      save(ed.getHTML());
      setTimeout(() => setSlash(null), 150);
    },
  });
  const editorRef = useRef<Editor | null>(null);
  editorRef.current = editor;

  function detectSlash(ed: Editor) {
    const { $from, empty } = ed.state.selection;
    if (!empty || $from.parent.type.name === "codeBlock") return setSlash(null);
    const before = $from.parent.textBetween(0, $from.parentOffset, undefined, "￼");
    const m = /(?:^|\s)\/([\w ]{0,24})$/.exec(before);
    if (!m) return setSlash(null);
    const from = $from.pos - m[1].length - 1;
    const c = ed.view.coordsAtPos(from);
    const box = wrap.current?.getBoundingClientRect();
    if (!box) return;
    setSlash((prev) => {
      if (!prev || prev.query !== m[1]) setActive(0);
      return { from, query: m[1], x: c.left - box.left, y: c.bottom - box.top + 6 };
    });
  }

  // Flush pending changes when the editor goes away (closing a drawer, navigating).
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      const ed = editorRef.current;
      if (ed && !ed.isDestroyed) {
        const html = ed.getHTML();
        if (html !== lastSaved.current) void onSave(html);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div ref={wrap} className={cn("relative", className)}>
      <div className="pointer-events-none absolute -top-7 right-0 flex items-center gap-1.5 text-xs text-quiet" aria-live="polite">
        {status === "saving" || status === "dirty" ? (
          <><Loader2 size={12} className="animate-spin" aria-hidden /> Saving…</>
        ) : status === "saved" ? (
          <><Check size={12} aria-hidden /> Saved</>
        ) : status === "error" ? (
          <span className="text-danger">Not saved, retrying on next edit</span>
        ) : null}
      </div>

      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor: ed, from, to }) => from !== to && !ed.isActive("codeBlock")}
          className="flex items-center gap-0.5 rounded-xl border border-fg/15 bg-card p-1 shadow-2xl"
        >
          {[
            { I: Bold, on: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run(), l: "Bold" },
            { I: Italic, on: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run(), l: "Italic" },
            { I: Underline, on: editor.isActive("underline"), run: () => editor.chain().focus().toggleUnderline().run(), l: "Underline" },
            { I: Strikethrough, on: editor.isActive("strike"), run: () => editor.chain().focus().toggleStrike().run(), l: "Strikethrough" },
            { I: Code, on: editor.isActive("code"), run: () => editor.chain().focus().toggleCode().run(), l: "Inline code" },
            { I: Highlighter, on: editor.isActive("highlight"), run: () => editor.chain().focus().toggleHighlight().run(), l: "Highlight" },
            { I: Link2, on: editor.isActive("link"), run: setLink, l: "Link" },
            { I: Heading2, on: editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), l: "Heading" },
          ].map(({ I, on, run, l }) => (
            <button
              key={l}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={run}
              aria-label={l}
              aria-pressed={on}
              title={l}
              className={cn("grid h-8 w-8 place-items-center rounded-lg transition-colors", on ? "bg-blue-fill text-white" : "text-muted hover:bg-fg/10 hover:text-fg")}
            >
              <I size={15} aria-hidden />
            </button>
          ))}
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />

      {editor && slash && items.length > 0 && (
        <div
          role="listbox"
          aria-label="Insert block"
          className="absolute z-30 max-h-72 w-64 overflow-y-auto rounded-xl border border-fg/15 bg-card p-1.5 shadow-2xl"
          style={{ left: Math.max(0, Math.min(slash.x, (wrap.current?.clientWidth ?? 300) - 260)), top: slash.y }}
        >
          <div className="px-2 pb-1 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-quiet">Blocks</div>
          {items.map((c, i) => (
            <button
              key={c.key}
              type="button"
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => runCommand(editor, c)}
              className={cn("flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left", i === active && "bg-fg/[.07]")}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-fg/10 bg-ground text-muted">
                <c.icon size={17} aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold">{c.label}</span>
                <span className="block text-xs text-quiet">{c.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** True when stored notes contain any visible text. */
export { hasNoteText } from "@/components/learn/noteText";
