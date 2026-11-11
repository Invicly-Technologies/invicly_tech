"use client";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Minus, Plus, Trash2 } from "lucide-react";
import type { PlanTree, TreeModule } from "@/lib/learn/tree";
import { uid } from "@/lib/learn/tree";
import { DAY_LABELS, addDays, diffDays, fmtDate, fmtLong, type ISODate } from "@/lib/learn/dates";
import { fmtHours } from "@/lib/learn/analytics";
import type { WeekHours } from "@/lib/learn/schedule";
import { BRANCH } from "./MindMap";
import { cn } from "@/lib/cn";

/* ---------------- Outline editor ---------------- */

export function OutlineEditor({ tree, onChange }: { tree: PlanTree; onChange: (t: PlanTree) => void }) {
  const set = (fn: (mods: TreeModule[]) => TreeModule[]) => onChange({ modules: fn(tree.modules.map((m) => ({ ...m, topics: [...m.topics] }))) });
  const swap = <T,>(arr: T[], i: number, j: number) => {
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  };
  const iconBtn = "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-quiet hover:bg-fg/10 hover:text-fg disabled:opacity-30";

  return (
    <div className="space-y-4">
      {tree.modules.map((m, mi) => {
        const color = BRANCH[mi % BRANCH.length];
        const hours = m.topics.reduce((s, t) => s + (t.hours || 0), 0);
        return (
          <section key={m.id} className="overflow-hidden rounded-2xl border border-fg/10 bg-card">
            <div className="flex items-center gap-2 border-b border-fg/[.07] py-2 pl-3 pr-2" style={{ boxShadow: `inset 3px 0 0 ${color}` }}>
              <input
                value={m.title}
                onChange={(e) => set((mods) => ((mods[mi] = { ...mods[mi], title: e.target.value }), mods))}
                placeholder="Module name"
                aria-label={`Module ${mi + 1} name`}
                className="min-w-0 flex-1 bg-transparent py-1.5 font-bold outline-none placeholder:text-quiet"
              />
              <span className="hidden shrink-0 text-xs text-quiet sm:inline">{m.topics.length} · {fmtHours(hours)}</span>
              <button type="button" className={iconBtn} disabled={mi === 0} onClick={() => set((mods) => (swap(mods, mi, mi - 1), mods))} aria-label="Move module up"><ArrowUp size={15} aria-hidden /></button>
              <button type="button" className={iconBtn} disabled={mi === tree.modules.length - 1} onClick={() => set((mods) => (swap(mods, mi, mi + 1), mods))} aria-label="Move module down"><ArrowDown size={15} aria-hidden /></button>
              <button type="button" className={cn(iconBtn, "hover:text-danger")} onClick={() => set((mods) => mods.filter((x) => x.id !== m.id))} aria-label={`Delete module ${m.title}`}><Trash2 size={15} aria-hidden /></button>
            </div>
            <ul>
              {m.topics.map((t, ti) => (
                <li key={t.id} className="flex items-center gap-2 border-b border-fg/[.05] py-1 pl-4 pr-2 last:border-b-0">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
                  <input
                    value={t.title}
                    onChange={(e) => set((mods) => ((mods[mi].topics[ti] = { ...t, title: e.target.value }), mods))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const id = uid("t");
                        set((mods) => (mods[mi].topics.splice(ti + 1, 0, { id, title: "", hours: 1 }), mods));
                        setTimeout(() => document.getElementById(`ot-${id}`)?.focus(), 0);
                      }
                    }}
                    id={`ot-${t.id}`}
                    placeholder="Topic"
                    aria-label={`Topic ${ti + 1} in ${m.title || "module"}`}
                    className="min-w-0 flex-1 bg-transparent py-2 text-[14.5px] outline-none placeholder:text-quiet"
                  />
                  {(t.subtopics?.length ?? 0) > 0 && (
                    <span className="hidden shrink-0 text-xs text-quiet sm:inline" title={t.subtopics!.join(" · ")}>{t.subtopics!.length} steps</span>
                  )}
                  <div className="flex shrink-0 items-center rounded-lg border border-fg/10">
                    <button type="button" className="grid h-8 w-7 place-items-center text-quiet hover:text-fg" onClick={() => set((mods) => ((mods[mi].topics[ti] = { ...t, hours: Math.max(0.25, (t.hours || 0) - 0.5) }), mods))} aria-label="Less time"><Minus size={13} aria-hidden /></button>
                    <span className="w-12 text-center text-xs font-bold tabular-nums">{fmtHours(t.hours)}</span>
                    <button type="button" className="grid h-8 w-7 place-items-center text-quiet hover:text-fg" onClick={() => set((mods) => ((mods[mi].topics[ti] = { ...t, hours: Math.min(200, (t.hours || 0) + 0.5) }), mods))} aria-label="More time"><Plus size={13} aria-hidden /></button>
                  </div>
                  <button type="button" className={iconBtn} disabled={ti === 0} onClick={() => set((mods) => (swap(mods[mi].topics, ti, ti - 1), mods))} aria-label="Move topic up"><ArrowUp size={14} aria-hidden /></button>
                  <button type="button" className={cn(iconBtn, "hover:text-danger")} onClick={() => set((mods) => ((mods[mi].topics = mods[mi].topics.filter((x) => x.id !== t.id)), mods))} aria-label={`Delete topic ${t.title}`}><Trash2 size={14} aria-hidden /></button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                const id = uid("t");
                set((mods) => (mods[mi].topics.push({ id, title: "", hours: 1 }), mods));
                setTimeout(() => document.getElementById(`ot-${id}`)?.focus(), 0);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-quiet hover:bg-fg/[.03] hover:text-fg"
            >
              <Plus size={15} aria-hidden /> Add topic
            </button>
          </section>
        );
      })}
      <button
        type="button"
        onClick={() => onChange({ modules: [...tree.modules, { id: uid("m"), title: `Module ${tree.modules.length + 1}`, topics: [{ id: uid("t"), title: "", hours: 1 }] }] })}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-fg/20 py-4 text-sm font-bold text-muted hover:border-blue hover:text-fg"
      >
        <Plus size={16} aria-hidden /> Add module
      </button>
    </div>
  );
}

/* ---------------- Weekly hours ---------------- */

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const PACE_PRESETS: { key: string; label: string; hint: string; week: WeekHours }[] = [
  { key: "light", label: "Light", hint: "1h on weekdays", week: [0, 1, 1, 1, 1, 1, 0] },
  { key: "steady", label: "Steady", hint: "2h weekdays + 3h Saturday", week: [0, 2, 2, 2, 2, 2, 3] },
  { key: "weekend", label: "Weekends", hint: "4h Saturday & Sunday", week: [4, 0, 0, 0, 0, 0, 4] },
  { key: "intense", label: "Intensive", hint: "4h every day", week: [4, 4, 4, 4, 4, 4, 4] },
];

export function WeekHoursEditor({ week, onChange, compact = false }: { week: WeekHours; onChange: (w: WeekHours) => void; compact?: boolean }) {
  const max = Math.max(4, ...week);
  const setDay = (d: number, h: number) => onChange(week.map((x, i) => (i === d ? Math.min(16, Math.max(0, Math.round(h * 4) / 4)) : x)));
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="group" aria-label="Study hours per weekday">
      {WEEK_ORDER.map((d) => {
        const h = week[d];
        const on = h > 0;
        return (
          <div key={d} className={cn("flex flex-col items-center rounded-2xl border p-1.5 transition-colors sm:p-2", on ? "border-blue/50 bg-blue/[.07]" : "border-fg/10")}>
            <button
              type="button"
              onClick={() => setDay(d, on ? 0 : 1)}
              aria-pressed={on}
              aria-label={`${DAY_LABELS[d]}: ${on ? "study day" : "rest day"}`}
              className={cn("w-full rounded-lg py-1 text-xs font-bold", on ? "bg-blue-fill text-white" : "text-quiet hover:text-fg")}
            >
              {DAY_LABELS[d]}
            </button>
            {!compact && (
              <div className="relative mt-2 h-16 w-3 overflow-hidden rounded-full bg-fg/[.07]" aria-hidden>
                <div className="absolute inset-x-0 bottom-0 rounded-full bg-blue transition-[height] duration-300" style={{ height: `${(h / max) * 100}%` }} />
              </div>
            )}
            <span className={cn("mt-1.5 text-[12px] font-bold tabular-nums", on ? "text-fg" : "text-quiet")}>{on ? fmtHours(h) : "Off"}</span>
            <div className="mt-1 flex w-full justify-center gap-0.5">
              <button type="button" onClick={() => setDay(d, h - 0.5)} disabled={!on} className="grid h-7 w-full max-w-7 place-items-center rounded-md text-quiet hover:bg-fg/10 hover:text-fg disabled:opacity-30" aria-label={`Less time on ${DAY_LABELS[d]}`}><Minus size={12} aria-hidden /></button>
              <button type="button" onClick={() => setDay(d, h + 0.5)} className="grid h-7 w-full max-w-7 place-items-center rounded-md text-quiet hover:bg-fg/10 hover:text-fg" aria-label={`More time on ${DAY_LABELS[d]}`}><Plus size={12} aria-hidden /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Module timeline (review step) ---------------- */

export function ModuleTimeline({ rows, start }: { rows: { module: string; start: ISODate; end: ISODate; hours: number }[]; start: ISODate }) {
  const [hover, setHover] = useState<number | null>(null);
  const mods = useMemo(() => {
    const m = new Map<string, { module: string; start: ISODate; end: ISODate; hours: number; topics: number }>();
    for (const r of rows) {
      const x = m.get(r.module);
      if (!x) m.set(r.module, { module: r.module, start: r.start, end: r.end, hours: r.hours, topics: 1 });
      else {
        if (r.start < x.start) x.start = r.start;
        if (r.end > x.end) x.end = r.end;
        x.hours += r.hours;
        x.topics++;
      }
    }
    return [...m.values()];
  }, [rows]);
  if (!mods.length) return null;
  const end = mods.reduce((a, m) => (m.end > a ? m.end : a), start);
  const span = Math.max(1, diffDays(start, end) + 1);
  const weeks = Math.ceil(span / 7);
  const step = Math.max(1, Math.ceil(weeks / 8));

  return (
    <div>
      <div className="relative ml-[38%] h-5 text-[11px] text-quiet sm:ml-[30%]" aria-hidden>
        {Array.from({ length: Math.ceil(weeks / step) }, (_, i) => i * step).map((w) => (
          <span key={w} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${((w * 7) / span) * 100}%` }}>
            {w === 0 ? "Start" : `Wk ${w + 1}`}
          </span>
        ))}
      </div>
      <ul className="space-y-1.5">
        {mods.map((m, i) => {
          const left = (diffDays(start, m.start) / span) * 100;
          const width = Math.max(1.5, ((diffDays(m.start, m.end) + 1) / span) * 100);
          return (
            <li key={m.module} className="relative flex items-center gap-3" onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <span className="w-[38%] shrink-0 truncate text-[13px] font-semibold sm:w-[30%]" title={m.module}>{m.module}</span>
              <div className="relative h-6 flex-1 rounded-md bg-fg/[.04]">
                <div
                  className={cn("absolute inset-y-1 rounded-[4px] bg-blue transition-opacity", hover !== null && hover !== i && "opacity-50")}
                  style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
                />
              </div>
              {hover === i && (
                <div role="status" className="pointer-events-none absolute right-0 top-7 z-10 rounded-lg border border-fg/15 bg-card px-3 py-2 text-xs shadow-xl">
                  <b className="text-fg">{m.module}</b>
                  <div className="text-muted">{fmtDate(m.start)} – {fmtDate(m.end)} · {m.topics} topics · {fmtHours(m.hours)}</div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-quiet">Finishes {fmtLong(end)}</p>
    </div>
  );
}

/* ---------------- First two weeks (review step) ---------------- */

export function FirstDays({ rows, start, week, days = 14 }: { rows: { title: string; start: ISODate; end: ISODate }[]; start: ISODate; week: WeekHours; days?: number }) {
  const list = Array.from({ length: days }, (_, i) => addDays(start, i));
  return (
    <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {list.map((d) => {
        const wd = new Date(`${d}T00:00:00Z`).getUTCDay();
        const items = rows.filter((r) => r.start <= d && r.end >= d);
        const off = !(week[wd] > 0);
        return (
          <li key={d} className={cn("rounded-xl border px-3 py-2", off ? "border-dashed border-fg/10 opacity-60" : "border-fg/10 bg-card")}>
            <div className="flex items-baseline justify-between text-xs">
              <b className="text-fg">{fmtDate(d, { weekday: "short", day: "numeric", month: "short" })}</b>
              <span className="text-quiet">{off ? "Rest" : fmtHours(week[wd])}</span>
            </div>
            {!off && (
              <ul className="mt-1 space-y-0.5 text-[13px] text-soft">
                {items.slice(0, 3).map((it) => (
                  <li key={it.title} className="truncate">• {it.title}</li>
                ))}
                {items.length > 3 && <li className="text-xs text-quiet">+{items.length - 3} more</li>}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
