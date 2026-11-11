"use client";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Row = [slug: string, title: string, path: string, extra: string];

let indexPromise: Promise<Row[]> | null = null;
const loadIndex = () =>
  (indexPromise ??= fetch("/blog/search.json")
    .then((r) => (r.ok ? (r.json() as Promise<Row[]>) : []))
    .catch(() => {
      indexPromise = null;
      return [] as Row[];
    }));

/** Every word must match; titles that match (especially at the start) rank first. Shared with the blog page filter. */
export function searchRows<T>(rows: T[], q: string, fields: (r: T) => { title: string; rest: string }, max = Infinity): T[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return rows.slice(0, max);
  const scored: { r: T; s: number }[] = [];
  for (const r of rows) {
    const { title, rest } = fields(r);
    const t = title.toLowerCase();
    const hay = `${t} ${rest.toLowerCase()}`;
    if (!words.every((w) => hay.includes(w))) continue;
    let s = 0;
    for (const w of words) s += t.startsWith(w) ? 6 : new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(t) ? 4 : t.includes(w) ? 2 : 0;
    scored.push({ r, s });
  }
  return scored.sort((a, b) => b.s - a.s).slice(0, max).map((x) => x.r);
}

/** Search box with instant results. Enter (with nothing highlighted) opens the full blog list filtered by the query. */
export function BlogSearch({ size = "sm", className, autoFocus }: { size?: "sm" | "lg"; className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  const warm = () => {
    if (!rows) loadIndex().then(setRows);
  };
  const results = useMemo(
    () => (rows && q.trim() ? searchRows(rows, q, (r) => ({ title: r[1], rest: `${r[2]} ${r[3]}` }), 8) : []),
    [rows, q],
  );

  useEffect(() => {
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const slash = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "/" && size === "sm" && !/INPUT|TEXTAREA|SELECT/.test(el.tagName) && !el.isContentEditable) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", slash);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", slash);
    };
  }, [size]);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    input.current?.blur();
    router.push(href);
  };
  const submit = () => {
    if (hi >= 0 && results[hi]) return go(`/blog/${results[hi][0]}/`);
    if (q.trim()) go(`/blog/?q=${encodeURIComponent(q.trim())}#all`);
  };

  const lg = size === "lg";
  return (
    <div ref={box} className={cn("relative", className)} role="search">
      <Search size={lg ? 20 : 16} className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-quiet", lg ? "left-5" : "left-3.5")} aria-hidden />
      <input
        ref={input}
        type="search"
        value={q}
        autoFocus={autoFocus}
        onFocus={() => {
          warm();
          setOpen(true);
        }}
        onPointerEnter={warm}
        onChange={(e) => {
          setQ(e.target.value);
          setHi(-1);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHi((h) => Math.min(h + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHi((h) => Math.max(h - 1, -1));
          } else if (e.key === "Enter") {
            e.preventDefault();
            submit();
          } else if (e.key === "Escape") {
            setOpen(false);
            input.current?.blur();
          }
        }}
        placeholder={lg ? "Search 600+ articles: try docker, subnetting, react hooks…" : "Search the blog"}
        aria-label="Search blog articles"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={hi >= 0 ? `${listId}-${hi}` : undefined}
        className={cn(
          "w-full rounded-full border border-fg/15 bg-card/80 text-fg outline-none placeholder:text-quiet focus:border-blue/70 [&::-webkit-search-cancel-button]:hidden",
          lg ? "min-h-14 pl-13 pr-12 text-[16px]" : "min-h-10 pl-10 pr-9 text-[14px]",
        )}
      />
      {q ? (
        <button type="button" onClick={() => { setQ(""); input.current?.focus(); }} aria-label="Clear search" className={cn("absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-full text-quiet hover:text-fg", lg ? "right-4 h-8 w-8" : "right-2 h-7 w-7")}>
          <X size={15} aria-hidden />
        </button>
      ) : !lg ? (
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-fg/15 px-1.5 text-[11px] text-quiet xl:block">/</kbd>
      ) : null}

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-fg/10 bg-ground shadow-2xl shadow-black/30">
          {!rows ? (
            <p className="px-4 py-3 text-sm text-quiet">Loading…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-quiet">No articles match “{q.trim()}”.</p>
          ) : (
            <ul id={listId} role="listbox" className="max-h-[60vh] overflow-y-auto py-1.5">
              {results.map((r, i) => (
                <li key={r[0]} id={`${listId}-${i}`} role="option" aria-selected={i === hi}>
                  <button
                    type="button"
                    onMouseEnter={() => setHi(i)}
                    onClick={() => go(`/blog/${r[0]}/`)}
                    className={cn("block w-full px-4 py-2.5 text-left", i === hi ? "bg-fg/[.07]" : "hover:bg-fg/5")}
                  >
                    <span className="block text-[14.5px] font-semibold leading-snug">{r[1]}</span>
                    <span className="block text-xs text-blue-light">{r[2]}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {rows && (
            <button type="button" onClick={() => go(`/blog/?q=${encodeURIComponent(q.trim())}#all`)} className="block w-full border-t border-fg/10 px-4 py-2.5 text-left text-sm font-semibold text-muted hover:bg-fg/5 hover:text-fg">
              See all results for “{q.trim()}” →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
