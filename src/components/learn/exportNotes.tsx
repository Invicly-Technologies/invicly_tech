"use client";
import { useEffect, useRef, useState } from "react";
import { Download, FileDown, FileText } from "lucide-react";
import { noteCache } from "@/components/learn/noteCache";
import type { ScheduleItem } from "@/components/learn/tracking";
import { fmtHours } from "@/lib/learn/analytics";
import { cn } from "@/lib/cn";

/* ---------------- HTML (TipTap) → Markdown ---------------- */

function inline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").replace(/([*_`[\]])/g, "\\$1");
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as HTMLElement;
  const inner = [...el.childNodes].map(inline).join("");
  switch (el.tagName) {
    case "STRONG":
    case "B":
      return inner.trim() ? `**${inner}**` : inner;
    case "EM":
    case "I":
      return inner.trim() ? `*${inner}*` : inner;
    case "S":
    case "DEL":
      return inner.trim() ? `~~${inner}~~` : inner;
    case "U":
      return inner;
    case "MARK":
      return inner.trim() ? `==${inner}==` : inner;
    case "CODE":
      return `\`${el.textContent ?? ""}\``;
    case "A":
      return `[${inner}](${el.getAttribute("href") ?? ""})`;
    case "BR":
      return "  \n";
    default:
      return inner;
  }
}

function block(el: Element, depth = 0): string {
  const pad = "  ".repeat(depth);
  switch (el.tagName) {
    case "H1":
      return `# ${inline(el)}`;
    case "H2":
      return `## ${inline(el)}`;
    case "H3":
      return `### ${inline(el)}`;
    case "P":
      return inline(el);
    case "BLOCKQUOTE":
      return [...el.children].map((c) => block(c, depth)).join("\n\n").split("\n").map((l) => `> ${l}`).join("\n");
    case "PRE": {
      const code = el.querySelector("code");
      const lang = (code?.className.match(/language-(\S+)/) ?? [])[1] ?? "";
      return "```" + lang + "\n" + (code?.textContent ?? el.textContent ?? "").replace(/\n$/, "") + "\n```";
    }
    case "HR":
      return "---";
    case "UL":
    case "OL": {
      const task = el.getAttribute("data-type") === "taskList";
      return [...el.children]
        .map((li, i) => {
          const marker = task ? `- [${li.getAttribute("data-checked") === "true" ? "x" : " "}]` : el.tagName === "OL" ? `${i + 1}.` : "-";
          const content = task ? li.querySelector(":scope > div") ?? li : li;
          const parts = [...content.children];
          const first = parts.filter((c) => !["UL", "OL"].includes(c.tagName)).map((c) => block(c, 0)).join(" ") || inline(content);
          const nested = parts.filter((c) => ["UL", "OL"].includes(c.tagName)).map((c) => block(c, depth + 1)).join("\n");
          return `${pad}${marker} ${first}${nested ? `\n${nested}` : ""}`;
        })
        .join("\n");
    }
    default:
      return inline(el);
  }
}

export function htmlToMarkdown(html: string) {
  if (!html?.trim()) return "";
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  return [...doc.body.children].map((c) => block(c)).filter((b) => b.trim() !== "").join("\n\n").trim();
}

/* ---------------- Builders ---------------- */

export function topicMarkdown(item: ScheduleItem, level = 1) {
  const h = "#".repeat(level);
  const lines: string[] = [`${h} ${item.title}`, ""];
  const meta = [
    `**Module:** ${item.module_title}`,
    `**Status:** ${item.completed_on ? `Done (${item.completed_on})` : "Not done"}`,
    `**Time:** ${item.tracked_minutes ? `${fmtHours(item.tracked_minutes / 60)} tracked of ` : ""}${fmtHours(item.est_hours)}`,
    `**Scheduled:** ${item.scheduled_start === item.scheduled_end ? item.scheduled_start : `${item.scheduled_start} → ${item.scheduled_end}`}`,
  ];
  lines.push(meta.join("  \n"), "");
  if (item.goal) lines.push(`> **Goal:** ${item.goal}`, "");
  if (item.subtopics?.length) {
    lines.push(`${h}# Subtopics`, "");
    for (const s of item.subtopics) {
      const t = [s.tracked ? `${fmtHours(s.tracked / 60)} tracked` : "", s.est_minutes ? `est. ${fmtHours(s.est_minutes / 60)}` : ""].filter(Boolean).join(", ");
      lines.push(`- [${s.done_on ? "x" : " "}] ${s.title}${t ? ` _(${t})_` : ""}`);
    }
    lines.push("");
  }
  const links = [...(item.links ?? []).map((l) => ({ ...l, rec: true })), ...(item.myLinks ?? []).map((l) => ({ ...l, rec: false }))];
  if (links.length) {
    lines.push(`${h}# References`, "");
    for (const l of links) lines.push(`- [${l.label}](${l.url})${l.rec ? " _(recommended)_" : ""}`);
    lines.push("");
  }
  const notes = htmlToMarkdown(noteCache.get(item.id) ?? item.notes ?? "");
  lines.push(`${h}# Notes`, "", notes || "_No notes yet._", "");
  return lines.join("\n");
}

export function planMarkdown(planTitle: string, items: ScheduleItem[]) {
  const out: string[] = [`# ${planTitle}`, "", `_Exported from Invicly Learn on ${new Date().toISOString().slice(0, 10)}_`, ""];
  let mod = "";
  for (const i of items) {
    if (i.module_title !== mod) {
      mod = i.module_title;
      out.push(`## ${mod}`, "");
    }
    out.push(topicMarkdown(i, 3));
  }
  return out.join("\n");
}

export function downloadText(filename: string, text: string, type = "text/markdown;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "notes";

/* ---------------- Menu ---------------- */

export function ExportMenu({ planId, planTitle, items, single = false }: { planId: string; planTitle: string; items: ScheduleItem[]; single?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const one = single ? items[0] : null;
  const name = one ? slugify(one.title) : slugify(planTitle);
  const pdfHref = `/learn-export/${planId}/${one ? `?item=${one.id}&` : "?"}print=1`;

  return (
    <div ref={ref} className={cn("relative", !single && "w-full sm:w-auto")} data-tour={single ? undefined : "plan-export"}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(single ? "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-fg/15 px-3 text-[13px] font-bold text-muted hover:text-fg" : "btn btn-ghost btn-sm !min-h-10 !px-4")}
      >
        <Download size={15} aria-hidden /> {single ? "Export" : "Export notes"}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-11 z-[78] w-60 rounded-2xl border border-fg/12 bg-card p-1.5 shadow-2xl max-sm:left-0 max-sm:right-auto">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              downloadText(`${name}.md`, one ? topicMarkdown(one) : planMarkdown(planTitle, items));
              setOpen(false);
            }}
            className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-fg/[.06]"
          >
            <FileText size={18} className="mt-0.5 shrink-0 text-blue-light" aria-hidden />
            <span>
              <span className="block text-sm font-bold">Markdown (.md)</span>
              <span className="block text-xs text-quiet">For Notion, Obsidian, GitHub</span>
            </span>
          </button>
          <a
            role="menuitem"
            href={pdfHref}
            target="_blank"
            rel="noopener"
            onClick={() => setOpen(false)}
            className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-fg/[.06]"
          >
            <FileDown size={18} className="mt-0.5 shrink-0 text-blue-light" aria-hidden />
            <span>
              <span className="block text-sm font-bold">PDF</span>
              <span className="block text-xs text-quiet">Opens a print view: choose “Save as PDF”</span>
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
