"use client";
import { useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, BookOpen, Check, CirclePlay, ExternalLink, FileText, FolderGit2, GraduationCap, Link2, Plus, Trash2, X } from "lucide-react";
import { addLink, addSubtopic, deleteLink, deleteSubtopic, moveSubtopic, renameSubtopic, setSubtopicEstimate, splitTopicTime, toggleSubtopic } from "@/app/learn/actions";
import { TimerButton, useTimer } from "@/components/learn/timer";
import { fmtHours } from "@/lib/learn/analytics";
import { useFlash } from "@/components/learn/useFlash";
import { KIND_LABEL, LINK_KINDS, defaultLabel, detectKind, hostOf, normalizeUrl, type LinkKind } from "@/lib/learn/links";
import type { Resource } from "@/data/learn/types";
import { cn } from "@/lib/cn";

export type SubtopicRow = { id: string; title: string; done_on: string | null; est_minutes?: number | null; tracked?: number };
export type LinkRow = { id: string; label: string; url: string; kind: string };

const KIND_ICON: Record<LinkKind, typeof BookOpen> = {
  doc: BookOpen,
  video: CirclePlay,
  article: FileText,
  course: GraduationCap,
  repo: FolderGit2,
  other: Link2,
};

export function KindIcon({ kind, size = 15, className }: { kind: string; size?: number; className?: string }) {
  const I = KIND_ICON[(kind as LinkKind) in KIND_ICON ? (kind as LinkKind) : "other"];
  return <I size={size} className={className} aria-hidden />;
}

let tmp = 0;
const tmpId = () => `tmp-${++tmp}`;

/* ---------------- Subtopics ---------------- */

type SubAct =
  | { t: "add"; row: SubtopicRow }
  | { t: "toggle"; id: string; done: boolean }
  | { t: "rename"; id: string; title: string }
  | { t: "delete"; id: string }
  | { t: "move"; id: string; dir: -1 | 1 }
  | { t: "est"; id: string; minutes: number };

function subReducer(list: SubtopicRow[], a: SubAct): SubtopicRow[] {
  switch (a.t) {
    case "add":
      return [...list, a.row];
    case "toggle":
      return list.map((s) => (s.id === a.id ? { ...s, done_on: a.done ? "today" : null } : s));
    case "rename":
      return list.map((s) => (s.id === a.id ? { ...s, title: a.title } : s));
    case "delete":
      return list.filter((s) => s.id !== a.id);
    case "est":
      return list.map((s) => (s.id === a.id ? { ...s, est_minutes: a.minutes } : s));
    case "move": {
      const i = list.findIndex((s) => s.id === a.id);
      const j = i + a.dir;
      if (i < 0 || j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    }
  }
}

export function SubtopicList({
  itemId,
  subtopics,
  plan,
  itemTitle,
  topicHours,
}: {
  itemId: string;
  subtopics: SubtopicRow[];
  plan?: { id: string; title: string };
  itemTitle?: string;
  topicHours?: number;
}) {
  const [list, apply] = useOptimistic(subtopics, subReducer);
  const [, start] = useTransition();
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [flash, toast] = useFlash();
  const addRef = useRef<HTMLInputElement>(null);
  const done = list.filter((s) => s.done_on).length;
  const estTotal = list.reduce((a, s) => a + (s.est_minutes ?? 0), 0);
  const trackedTotal = list.reduce((a, s) => a + (s.tracked ?? 0), 0);

  const run = (act: SubAct, call: () => Promise<{ error?: string; ok?: string; topicDone?: boolean } | undefined>) =>
    start(async () => {
      apply(act);
      const r = await call();
      if (r?.error) flash(r);
      else if (r && "topicDone" in r && r.ok && r.ok !== "Saved") flash(r);
    });

  const addMany = (titles: string[]) => {
    const clean = titles.map((t) => t.trim()).filter(Boolean).slice(0, 30);
    if (!clean.length) return;
    start(async () => {
      for (const t of clean) {
        apply({ t: "add", row: { id: tmpId(), title: t, done_on: null, est_minutes: 15, tracked: 0 } });
        const r = await addSubtopic(itemId, t, 15);
        if (r?.error) {
          flash(r);
          break;
        }
      }
    });
  };

  const commitEdit = (id: string) => {
    const t = editText.trim();
    setEditing(null);
    const original = list.find((s) => s.id === id)?.title;
    if (t === original) return;
    run(t ? { t: "rename", id, title: t } : { t: "delete", id }, () => renameSubtopic(id, t));
  };

  return (
    <section aria-labelledby={`subs-${itemId}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={`subs-${itemId}`} className="text-sm font-bold">Subtopics</h3>
        {list.length > 0 && (
          <span className="text-xs font-semibold text-quiet">
            {done}/{list.length} done
            {estTotal > 0 && ` · ${fmtHours(trackedTotal / 60)} of ${fmtHours(estTotal / 60)}`}
          </span>
        )}
      </div>
      {list.length > 0 && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fg/[.07]" aria-hidden>
          <div className="h-full rounded-full bg-blue transition-[width] duration-500" style={{ width: `${(done / list.length) * 100}%` }} />
        </div>
      )}
      <ul className="mt-3 space-y-0.5">
        {list.map((s, i) => {
          const isDone = !!s.done_on;
          const pending = s.id.startsWith("tmp-");
          return (
            <li key={s.id} className="group flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-fg/[.04] focus-within:bg-fg/[.04]">
              <button
                type="button"
                role="checkbox"
                aria-checked={isDone}
                aria-label={`${isDone ? "Mark not done" : "Mark done"}: ${s.title}`}
                disabled={pending}
                onClick={() => run({ t: "toggle", id: s.id, done: !isDone }, () => toggleSubtopic(s.id, !isDone))}
                className={cn(
                  "hit grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border-[1.5px] transition-colors",
                  isDone ? "border-blue bg-blue-fill text-white" : "border-fg/30 hover:border-blue-light",
                )}
              >
                {isDone && <Check size={12} strokeWidth={3.5} aria-hidden />}
              </button>
              {editing === s.id ? (
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => commitEdit(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit(s.id);
                    if (e.key === "Escape") setEditing(null);
                  }}
                  maxLength={300}
                  aria-label="Edit subtopic"
                  className="min-w-0 flex-1 rounded-md bg-fg/[.06] px-1.5 py-0.5 text-[15px] outline-none ring-1 ring-blue/50"
                />
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setEditing(s.id);
                    setEditText(s.title);
                  }}
                  title="Click to edit"
                  className={cn("min-w-0 flex-1 cursor-text text-left text-[15px] leading-snug", isDone && "text-quiet line-through", pending && "opacity-60")}
                >
                  {s.title}
                </button>
              )}
              {!pending && (
                <EstimateChip
                  minutes={s.est_minutes ?? null}
                  tracked={s.tracked ?? 0}
                  onSave={(m) => run({ t: "est", id: s.id, minutes: m }, () => setSubtopicEstimate(s.id, m))}
                />
              )}
              {plan && itemTitle && !pending && !isDone && (
                <TimerButton planId={plan.id} planTitle={plan.title} itemId={itemId} itemTitle={itemTitle} subtopicId={s.id} subtopicTitle={s.title} />
              )}
              <span className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100">
                <button type="button" disabled={i === 0 || pending} onClick={() => run({ t: "move", id: s.id, dir: -1 }, () => moveSubtopic(s.id, -1))} aria-label={`Move up: ${s.title}`} className="grid h-7 w-7 max-md:hidden place-items-center rounded-md text-quiet hover:bg-fg/10 hover:text-fg disabled:opacity-30">
                  <ArrowUp size={13} aria-hidden />
                </button>
                <button type="button" disabled={i === list.length - 1 || pending} onClick={() => run({ t: "move", id: s.id, dir: 1 }, () => moveSubtopic(s.id, 1))} aria-label={`Move down: ${s.title}`} className="grid h-7 w-7 max-md:hidden place-items-center rounded-md text-quiet hover:bg-fg/10 hover:text-fg disabled:opacity-30">
                  <ArrowDown size={13} aria-hidden />
                </button>
                <button type="button" disabled={pending} onClick={() => run({ t: "delete", id: s.id }, () => deleteSubtopic(s.id))} aria-label={`Delete: ${s.title}`} className="hit hit-sm grid h-7 w-7 place-items-center rounded-md text-quiet hover:bg-fg/10 hover:text-danger">
                  <Trash2 size={13} aria-hidden />
                </button>
              </span>
            </li>
          );
        })}
      </ul>
      <form
        className="mt-1 flex items-center gap-2.5 rounded-lg px-1.5 py-1"
        onSubmit={(e) => {
          e.preventDefault();
          addMany([draft]);
          setDraft("");
          addRef.current?.focus();
        }}
      >
        <Plus size={18} className="shrink-0 text-quiet" aria-hidden />
        <input
          ref={addRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (text.includes("\n")) {
              e.preventDefault();
              addMany(text.split(/\r?\n/).map((l) => l.replace(/^\s*([-*•]|\d+[.)]|\[[ x]\])\s*/i, "")));
            }
          }}
          maxLength={300}
          placeholder={list.length ? "Add a subtopic" : "Break this topic into steps. Paste a list to add many."}
          aria-label="New subtopic"
          className="min-w-0 flex-1 bg-transparent py-0.5 text-[15px] outline-none placeholder:text-quiet"
        />
      </form>
      {list.length > 1 && topicHours && Math.abs(estTotal - topicHours * 60) >= 10 && (
        <button
          type="button"
          onClick={() => start(async () => flash(await splitTopicTime(itemId)))}
          className="ml-1.5 mt-1 text-xs font-semibold text-quiet underline-offset-2 hover:text-fg hover:underline"
        >
          Steps add up to {fmtHours(estTotal / 60)}, topic is {fmtHours(topicHours)}. Split {fmtHours(topicHours)} evenly?
        </button>
      )}
      {toast}
    </section>
  );
}

const PRESETS = [5, 10, 15, 25, 45, 60, 90];

/** Shows "tracked / estimate" and lets you pick a new estimate. */
function EstimateChip({ minutes, tracked, onSave }: { minutes: number | null; tracked: number; onSave: (m: number) => void }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(String(minutes ?? 15));
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);
  const over = minutes && tracked > minutes;
  return (
    <span ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Time: ${tracked ? `${fmtHours(tracked / 60)} tracked of ` : ""}${minutes ? fmtHours(minutes / 60) : "no estimate"}. Change estimate`}
        className={cn("hit hit-sm inline-flex h-7 items-center rounded-full px-2 text-[11px] font-semibold tabular-nums hover:bg-fg/10", over ? "text-warn" : "text-quiet")}
      >
        {tracked > 0 && <>{fmtHours(tracked / 60)}<span className="mx-0.5 opacity-60">/</span></>}
        {minutes ? fmtHours(minutes / 60) : "—"}
      </button>
      {open && (
        <span role="dialog" aria-label="Estimate" className="absolute right-0 top-8 z-20 block w-52 rounded-xl border border-fg/12 bg-card p-2 shadow-2xl">
          <span className="mb-1.5 block px-1 text-[11px] font-bold uppercase tracking-wide text-quiet">Estimate</span>
          <span className="grid grid-cols-4 gap-1">
            {PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  onSave(m);
                  setOpen(false);
                }}
                className={cn("h-8 rounded-lg text-xs font-bold", m === minutes ? "bg-blue-fill text-white" : "bg-fg/[.05] hover:bg-fg/10")}
              >
                {fmtHours(m / 60)}
              </button>
            ))}
          </span>
          <form
            className="mt-1.5 flex gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Math.round(Number(custom));
              if (n >= 5 && n <= 600) {
                onSave(n);
                setOpen(false);
              }
            }}
          >
            <input value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))} inputMode="numeric" aria-label="Minutes" className="h-8 min-w-0 flex-1 rounded-lg border border-fg/15 bg-transparent px-2 text-xs outline-none focus:border-blue" />
            <button type="submit" className="h-8 rounded-lg bg-fg/10 px-2 text-xs font-bold">min</button>
          </form>
        </span>
      )}
    </span>
  );
}

/* ---------------- References ---------------- */

type LinkAct = { t: "add"; row: LinkRow } | { t: "delete"; id: string };
const linkReducer = (list: LinkRow[], a: LinkAct) => (a.t === "add" ? [...list, a.row] : list.filter((l) => l.id !== a.id));

export function ReferenceList({ itemId, recommended, mine }: { itemId: string; recommended: Resource[]; mine: LinkRow[] }) {
  const [list, apply] = useOptimistic(mine, linkReducer);
  const [, start] = useTransition();
  const [flash, toast] = useFlash();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<LinkKind | "">("");
  const normalized = normalizeUrl(url);
  const detected = normalized ? detectKind(normalized) : null;
  const effKind: LinkKind = kind || detected || "other";
  const total = recommended.length + list.length;

  const submit = () => {
    if (!normalized) return flash({ error: "Enter a valid web address (https://…)" });
    const row = { id: tmpId(), url: normalized, label: label.trim() || defaultLabel(normalized), kind: effKind };
    setUrl("");
    setLabel("");
    setKind("");
    start(async () => {
      apply({ t: "add", row });
      const r = await addLink(itemId, { url: normalized, label: row.label, kind: effKind });
      flash(r);
    });
  };

  return (
    <section aria-labelledby={`refs-${itemId}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={`refs-${itemId}`} className="text-sm font-bold">References &amp; docs</h3>
        <span className="text-xs font-semibold text-quiet">{total} link{total === 1 ? "" : "s"}</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {recommended.map((l) => (
          <LinkItem key={`r-${l.url}`} label={l.label} url={l.url} kind={detectKind(l.url)} badge="Recommended" />
        ))}
        {list.map((l) => (
          <LinkItem
            key={l.id}
            label={l.label}
            url={l.url}
            kind={l.kind}
            pending={l.id.startsWith("tmp-")}
            onDelete={() =>
              start(async () => {
                apply({ t: "delete", id: l.id });
                const r = await deleteLink(l.id);
                if (r?.error) flash(r);
              })
            }
          />
        ))}
      </ul>
      {total === 0 && !open && <p className="mt-2 text-sm text-quiet">No links yet. Save the docs, videos and articles you use for this topic.</p>}
      {open ? (
        <form
          className="mt-3 space-y-2.5 rounded-xl border border-fg/10 bg-fg/[.02] p-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label htmlFor={`url-${itemId}`} className="sr-only">Link URL</label>
            <input
              id={`url-${itemId}`}
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a link, e.g. docs.docker.com/get-started"
              inputMode="url"
              className="fld !min-h-11 !py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor={`label-${itemId}`} className="sr-only">Title</label>
            <input
              id={`label-${itemId}`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={200}
              placeholder={normalized ? defaultLabel(normalized) : "Title (optional)"}
              className="fld !min-h-11 flex-1 !py-2 text-sm"
            />
            <label htmlFor={`kind-${itemId}`} className="sr-only">Type</label>
            <select id={`kind-${itemId}`} value={effKind} onChange={(e) => setKind(e.target.value as LinkKind)} className="fld !min-h-11 !py-2 text-sm sm:!w-36">
              {LINK_KINDS.map((k) => (
                <option key={k} value={k}>{KIND_LABEL[k]}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-quiet">{normalized ? `${hostOf(normalized)} · detected ${KIND_LABEL[detected ?? "other"]}` : url ? "That doesn't look like a web address yet" : "Docs, videos, articles, courses or repos"}</span>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => setOpen(false)} className="min-h-9 rounded-full px-3 text-[13px] font-bold text-muted hover:text-fg">Cancel</button>
              <button type="submit" disabled={!normalized} className="min-h-9 rounded-full bg-blue-fill px-4 text-[13px] font-bold text-white disabled:opacity-40">Add link</button>
            </div>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-1.5 text-sm font-semibold text-quiet hover:text-fg">
          <Plus size={16} aria-hidden /> Add a link
        </button>
      )}
      {toast}
    </section>
  );
}

function LinkItem({ label, url, kind, badge, pending, onDelete }: { label: string; url: string; kind: string; badge?: string; pending?: boolean; onDelete?: () => void }) {
  return (
    <li className={cn("group flex items-center gap-3 rounded-xl border border-fg/[.08] bg-card px-3 py-2 transition-colors hover:border-blue/40", pending && "opacity-60")}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue/10 text-blue-light">
        <KindIcon kind={kind} />
      </span>
      <a href={url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 py-1">
        <span className="block truncate text-sm font-semibold group-hover:text-blue-light">{label}</span>
        <span className="block truncate text-xs text-quiet">
          {KIND_LABEL[(kind as LinkKind) in KIND_LABEL ? (kind as LinkKind) : "other"]} · {hostOf(url)}
          {badge && <span className="ml-1.5 rounded bg-fg/[.07] px-1.5 py-px text-[11px] font-bold uppercase tracking-wide">{badge}</span>}
        </span>
      </a>
      <ExternalLink size={14} className="shrink-0 text-quiet" aria-hidden />
      {onDelete && (
        <button type="button" onClick={onDelete} disabled={pending} aria-label={`Remove link ${label}`} className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-quiet opacity-0 hover:bg-fg/10 hover:text-danger group-hover:opacity-100 focus:opacity-100 max-md:opacity-100">
          <X size={14} aria-hidden />
        </button>
      )}
    </li>
  );
}

/** Flattened view of every link in a plan, used by the Resources tab. */
export function useAllLinks(items: { id: string; title: string; module_title: string; links?: Resource[]; myLinks?: LinkRow[] }[]) {
  return useMemo(
    () =>
      items.flatMap((i) => [
        ...(i.links ?? []).map((l) => ({ key: `r-${i.id}-${l.url}`, itemId: i.id, topic: i.title, module: i.module_title, label: l.label, url: l.url, kind: detectKind(l.url) as string, mine: false })),
        ...(i.myLinks ?? []).map((l) => ({ key: l.id, itemId: i.id, topic: i.title, module: i.module_title, label: l.label, url: l.url, kind: l.kind, mine: true })),
      ]),
    [items],
  );
}
