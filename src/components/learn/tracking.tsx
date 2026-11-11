"use client";
import { useActionState, useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsRight,
  CircleDot,
  Layers,
  Lightbulb,
  Link2,
  ListChecks,
  PanelRightOpen,
  Presentation,
  Clock,
  ExternalLink,
  Loader2,
  Pause,
  Play,
  RefreshCcw,
  Settings2,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import {
  deleteLog,
  deletePlan,
  logStudy,
  rebalancePlan,
  saveNote,
  setPlanStatus,
  toggleItem,
  updatePlanSettings,
  type FormState,
} from "@/app/learn/actions";
import { DAY_LABELS, fmtDate, relDay, weekStart, type ISODate } from "@/lib/learn/dates";
import { fmtHours } from "@/lib/learn/analytics";
import type { Resource } from "@/data/learn/types";
import { cn } from "@/lib/cn";
import { NotionEditor } from "@/components/learn/LazyNotionEditor";
import { hasNoteText } from "@/components/learn/noteText";
import { useFlash } from "@/components/learn/useFlash";
import { noteCache } from "@/components/learn/noteCache";
import { TimerButton } from "@/components/learn/timer";
import { ExportMenu } from "@/components/learn/exportNotes";
import { ReferenceList, SubtopicList, type LinkRow, type SubtopicRow } from "@/components/learn/TopicExtras";
import { WeekHoursEditor } from "@/components/learn/PlanBuilder";

/* ---------------- Checkbox ---------------- */

export function TopicCheck({ id, done, title }: { id: string; done: boolean; title: string }) {
  const [optimistic, setOptimistic] = useOptimistic(done);
  const [pending, start] = useTransition();
  const [flash, toast] = useFlash();
  return (
    <>
      <button
        type="button"
        role="checkbox"
        aria-checked={optimistic}
        aria-label={`${optimistic ? "Mark not done" : "Mark done"}: ${title}`}
        disabled={pending}
        onClick={() =>
          start(async () => {
            setOptimistic(!optimistic);
            const r = await toggleItem(id, !optimistic);
            if (r?.error) flash(r);
          })
        }
        className={cn(
          "hit grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-[background-color,border-color,scale] hover:scale-110",
          optimistic ? "border-blue bg-blue-fill text-white" : "border-fg/30 hover:border-blue-light",
        )}
      >
        {optimistic && <Check size={14} strokeWidth={3.5} aria-hidden />}
      </button>
      {toast}
    </>
  );
}

/* ---------------- Schedule list ---------------- */

export type ScheduleItem = {
  id: string;
  module_title: string;
  title: string;
  est_hours: number;
  scheduled_start: ISODate;
  scheduled_end: ISODate;
  completed_on: ISODate | null;
  notes: string | null;
  goal?: string;
  links?: Resource[];
  subtopics?: SubtopicRow[];
  myLinks?: LinkRow[];
  tracked_minutes?: number;
  /** Link to the visual explainer page, when one exists. */
  visual_href?: string;
};

type Filter = "all" | "upcoming" | "overdue" | "done";

export function ScheduleList({ items, today, planTitle, planId }: { items: ScheduleItem[]; today: ISODate; planTitle: string; planId: string }) {
  const overdue = items.filter((i) => !i.completed_on && i.scheduled_end < today).length;
  const [filter, setFilter] = useState<Filter>(overdue ? "overdue" : "upcoming");
  const [view, setView] = useState<"week" | "module">("week");
  const [openId, setOpenId] = useState<string | null>(null);
  const shown = items.filter((i) =>
    filter === "all" ? true : filter === "done" ? !!i.completed_on : filter === "overdue" ? !i.completed_on && i.scheduled_end < today : !i.completed_on,
  );
  const groups = useMemo(() => {
    const g = new Map<string, ScheduleItem[]>();
    for (const i of shown) {
      const k = view === "week" ? weekStart(i.scheduled_start) : i.module_title;
      g.set(k, [...(g.get(k) ?? []), i]);
    }
    return [...g.entries()];
  }, [shown, view]);
  const thisWeek = weekStart(today);
  const counts: Record<Filter, number> = {
    upcoming: items.filter((i) => !i.completed_on).length,
    overdue,
    done: items.filter((i) => i.completed_on).length,
    all: items.length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter topics">
          {(["upcoming", "overdue", "done", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "min-h-9 rounded-full border px-3.5 text-[13px] font-bold capitalize transition-colors",
                filter === f ? "border-fg bg-fg text-ground" : "border-fg/15 text-muted hover:text-fg",
                f === "overdue" && counts.overdue > 0 && filter !== f && "border-warn/50 text-warn",
              )}
            >
              {f === "upcoming" ? "To do" : f} <span className="opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-full border border-fg/15 p-0.5 text-[13px]">
          {(["week", "module"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={cn("min-h-8 rounded-full px-3 font-bold capitalize", view === v ? "bg-fg/15 text-fg" : "text-quiet hover:text-fg")}>
              By {v}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed border-fg/15 p-8 text-center text-muted">
          {filter === "overdue" ? "Nothing overdue. Nice work." : filter === "done" ? "Nothing done yet. Tick off your first topic." : "Nothing here."}
        </p>
      )}

      <div className="mt-5 space-y-6">
        {groups.map(([k, list]) => (
          <section key={k}>
            <h3 className="mb-2 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-bold">
                {view === "week" ? (k === thisWeek ? "This week" : `Week of ${fmtDate(k, { day: "numeric", month: "short", year: "numeric" })}`) : k}
              </span>
              <span className="text-xs text-quiet">{fmtHours(list.reduce((s, i) => s + i.est_hours, 0))}</span>
            </h3>
            <ul className="overflow-hidden rounded-2xl border border-fg/10">
              {list.map((i) => (
                <TopicRow key={i.id} item={i} today={today} showModule={view === "week"} onOpen={() => setOpenId(i.id)} plan={{ id: planId, title: planTitle }} />
              ))}
            </ul>
          </section>
        ))}
      </div>
      <TopicDrawer items={items} openId={openId} onOpen={setOpenId} today={today} planTitle={planTitle} planId={planId} />
    </div>
  );
}

const statusOf = (i: ScheduleItem, today: ISODate) =>
  i.completed_on ? "done" : i.scheduled_end < today ? "overdue" : i.scheduled_start <= today ? "now" : "upcoming";

function TopicRow({ item, today, showModule, onOpen, plan }: { item: ScheduleItem; today: ISODate; showModule: boolean; onOpen: () => void; plan: { id: string; title: string } }) {
  const st = statusOf(item, today);
  const when = item.scheduled_start === item.scheduled_end ? relDay(item.scheduled_start, today) : `${fmtDate(item.scheduled_start)} – ${fmtDate(item.scheduled_end)}`;
  const note = noteCache.get(item.id) ?? item.notes;
  return (
    <li className={cn("group border-b border-fg/[.06] bg-card last:border-b-0", st === "now" && "bg-blue/[.05]")}>
      <div className="flex items-center gap-3 px-4 py-3">
        <TopicCheck id={item.id} done={st === "done"} title={item.title} />
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left" aria-haspopup="dialog">
          <span className={cn("block font-semibold leading-snug group-hover:text-blue-light", st === "done" && "text-quiet line-through")}>{item.title}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-quiet">
            {showModule && <span className="truncate">{item.module_title}</span>}
            <span className="inline-flex items-center gap-1"><Clock size={11} aria-hidden />{item.tracked_minutes ? `${fmtHours(item.tracked_minutes / 60)} / ` : ""}{fmtHours(item.est_hours)}</span>
            {(item.subtopics?.length ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1" title="Subtopics done">
                <ListChecks size={11} aria-hidden />
                {item.subtopics!.filter((x) => x.done_on).length}/{item.subtopics!.length}
              </span>
            )}
            {(item.myLinks?.length ?? 0) + (item.links?.length ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1" title="References">
                <Link2 size={11} aria-hidden />
                {(item.myLinks?.length ?? 0) + (item.links?.length ?? 0)}
              </span>
            )}
            {hasNoteText(note) && <span className="inline-flex items-center gap-1 text-blue-light"><StickyNote size={11} aria-hidden />Notes</span>}
            <span className="sm:hidden">{st === "done" ? "Done" : st === "overdue" ? "Overdue" : st === "now" ? "Now" : when}</span>
          </span>
        </button>
        <span className={cn("hidden shrink-0 text-right text-xs sm:block", st === "overdue" ? "font-bold text-warn" : st === "now" ? "font-bold text-blue-light" : "text-quiet")}>
          {st === "done" ? `Done ${relDay(item.completed_on!, today).toLowerCase()}` : st === "overdue" ? (
            <span className="inline-flex items-center gap-1"><AlertCircle size={12} aria-hidden />Overdue · {fmtDate(item.scheduled_end)}</span>
          ) : st === "now" ? "Now" : when}
        </span>
        {st !== "done" && <TimerButton planId={plan.id} planTitle={plan.title} itemId={item.id} itemTitle={item.title} />}
        <button type="button" onClick={onOpen} aria-label={`Open ${item.title}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-quiet hover:bg-fg/5 hover:text-fg">
          <PanelRightOpen size={16} aria-hidden />
        </button>
      </div>
    </li>
  );
}



export function TopicDrawer({
  items,
  openId,
  onOpen,
  today,
  planTitle,
  planId,
}: {
  items: ScheduleItem[];
  openId: string | null;
  onOpen: (id: string | null) => void;
  today: ISODate;
  planTitle: string;
  planId: string;
}) {
  const idx = items.findIndex((i) => i.id === openId);
  const item = idx >= 0 ? items[idx] : null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const openItemId = item?.id ?? null;
  const isOpen = openItemId !== null;
  // Focus the drawer only when a different topic opens, not when fresh server data re-renders the same one.
  useEffect(() => {
    if (openItemId) closeRef.current?.focus();
  }, [openItemId]);
  useEffect(() => {
    if (!isOpen) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onOpen(null);
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [isOpen, onOpen]);
  if (!item) return null;
  const st = statusOf(item, today);
  const stLabel = { done: "Done", overdue: "Overdue", now: "In progress", upcoming: "Not started" }[st];
  const stCls = { done: "bg-ok/15 text-ok", overdue: "bg-warn/15 text-warn", now: "bg-blue/15 text-blue-light", upcoming: "bg-fg/10 text-muted" }[st];
  const prev = items[idx - 1];
  const next = items[idx + 1];
  const navBtn = "grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-fg/10 hover:text-fg disabled:opacity-30";

  return (
    <div className="fixed inset-0 z-[75] flex justify-end" role="presentation">
      <div className="absolute inset-0 bg-ground/60 backdrop-blur-[2px]" onClick={() => onOpen(null)} aria-hidden />
      <div role="dialog" aria-modal="true" aria-labelledby="topic-title" className="relative flex h-full w-full max-w-[720px] flex-col border-l border-fg/10 bg-card shadow-2xl" style={{ animation: "drawer-in .28s cubic-bezier(.2,.8,.2,1)" }}>
        <div className="flex items-center gap-2 border-b border-fg/[.07] px-4 py-2.5">
          <button ref={closeRef} type="button" onClick={() => onOpen(null)} className={navBtn} aria-label="Close topic"><ChevronsRight size={18} aria-hidden /></button>
          <span className="min-w-0 flex-1 truncate text-sm text-quiet">{planTitle} <span className="mx-1">/</span> {item.module_title}</span>
          <button type="button" className={navBtn} disabled={!prev} onClick={() => prev && onOpen(prev.id)} aria-label="Previous topic"><ChevronUp size={18} aria-hidden /></button>
          <button type="button" className={navBtn} disabled={!next} onClick={() => next && onOpen(next.id)} aria-label="Next topic"><ChevronDown size={18} aria-hidden /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-16 pt-8 md:px-14">
          <h2 id="topic-title" className="text-[30px] font-bold leading-tight tracking-tight md:text-[36px]">{item.title}</h2>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {st !== "done" && <TimerButton size="md" planId={planId} planTitle={planTitle} itemId={item.id} itemTitle={item.title} />}
            {item.visual_href && (
              <Link href={item.visual_href} target="_blank" className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-blue/40 bg-blue/[.07] px-3 text-[13px] font-bold text-blue-light hover:bg-blue/15">
                <Presentation size={14} aria-hidden /> Learn visually
              </Link>
            )}
            <ExportMenu planId={planId} planTitle={planTitle} items={[item]} single />
          </div>
          <dl className="mt-6 grid grid-cols-[130px_1fr] gap-x-4 gap-y-2.5 text-sm">
            <dt className="flex items-center gap-2 text-quiet"><CircleDot size={15} aria-hidden /> Status</dt>
            <dd className="flex items-center gap-2.5">
              <TopicCheck id={item.id} done={st === "done"} title={item.title} />
              <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", stCls)}>{stLabel}</span>
            </dd>
            <dt className="flex items-center gap-2 text-quiet"><CalendarDays size={15} aria-hidden /> Scheduled</dt>
            <dd>{item.scheduled_start === item.scheduled_end ? fmtDate(item.scheduled_start, { weekday: "short", day: "numeric", month: "short" }) : `${fmtDate(item.scheduled_start)} → ${fmtDate(item.scheduled_end)}`}</dd>
            <dt className="flex items-center gap-2 text-quiet"><Clock size={15} aria-hidden /> Time</dt>
            <dd>
              {item.tracked_minutes ? <><b>{fmtHours(item.tracked_minutes / 60)}</b> tracked of </> : "Estimate "}
              {fmtHours(item.est_hours)}
            </dd>
            <dt className="flex items-center gap-2 text-quiet"><Layers size={15} aria-hidden /> Module</dt>
            <dd>{item.module_title}</dd>
            {item.completed_on && (
              <>
                <dt className="flex items-center gap-2 text-quiet"><CheckCircle2 size={15} aria-hidden /> Completed</dt>
                <dd>{fmtDate(item.completed_on, { day: "numeric", month: "short", year: "numeric" })}</dd>
              </>
            )}
          </dl>
          {item.goal && (
            <div className="mt-6 flex gap-3 rounded-xl bg-fg/[.04] p-4 text-[15px] leading-relaxed">
              <Lightbulb size={18} className="mt-0.5 shrink-0 text-warn" aria-hidden />
              <p><b>Goal:</b> {item.goal}</p>
            </div>
          )}
          <div className="mt-8">
            <SubtopicList key={`s-${item.id}`} itemId={item.id} subtopics={item.subtopics ?? []} plan={{ id: planId, title: planTitle }} itemTitle={item.title} topicHours={item.est_hours} />
          </div>
          <div className="mt-8">
            <ReferenceList key={`r-${item.id}`} itemId={item.id} recommended={item.links ?? []} mine={item.myLinks ?? []} />
          </div>
          <div className="mt-8 border-t border-fg/[.07] pt-6">
            <h3 className="mb-8 text-sm font-bold">Notes</h3>
            <NotionEditor
              key={item.id}
              label={`Notes for ${item.title}`}
              initial={noteCache.get(item.id) ?? item.notes ?? ""}
              placeholder="Take notes… type '/' for headings, to-dos, code and more"
              onSave={async (html) => {
                noteCache.set(item.id, html);
                return saveNote(item.id, html);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Study log ---------------- */

export function LogStudyForm({
  today,
  plans,
  planId,
  topics,
}: {
  today: ISODate;
  plans?: { id: string; title: string }[];
  planId?: string;
  topics?: { id: string; title: string }[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(logStudy, undefined);
  const [minutes, setMinutes] = useState(60);
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (state?.ok) setKey((k) => k + 1);
  }, [state]);
  return (
    <form action={action} key={key} className="space-y-4">
      {planId ? (
        <input type="hidden" name="plan" value={planId} />
      ) : (
        plans &&
        plans.length > 0 && (
          <div>
            <label htmlFor="log-plan" className="lbl">Plan</label>
            <select id="log-plan" name="plan" className="fld" defaultValue={plans[0]?.id}>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
              <option value="">Not tied to a plan</option>
            </select>
          </div>
        )
      )}
      {topics && topics.length > 0 && (
        <div>
          <label htmlFor="log-item" className="lbl">Topic <span className="font-normal text-quiet">(optional)</span></label>
          <select id="log-item" name="item" className="fld" defaultValue="">
            <option value="">General study</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <span className="lbl">Time</span>
        <div className="flex flex-wrap gap-2">
          {[15, 30, 45, 60, 90, 120].map((m) => (
            <button key={m} type="button" onClick={() => setMinutes(m)} className={cn("h-10 rounded-xl border px-3 text-sm font-bold", minutes === m ? "border-blue bg-blue/15 text-fg" : "border-fg/15 text-muted hover:border-fg/30")}>
              {fmtHours(m / 60)}
            </button>
          ))}
          <input name="minutes" type="number" min={1} max={1440} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="fld !min-h-10 !w-24 !py-2 text-sm" aria-label="Minutes" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[150px_1fr]">
        <div>
          <label htmlFor="log-date" className="lbl">Date</label>
          <input id="log-date" name="date" type="date" max={today} defaultValue={today} className="fld !min-h-11 !py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="log-note" className="lbl">Note <span className="font-normal text-quiet">(optional)</span></label>
          <input id="log-note" name="note" maxLength={500} placeholder="What did you work on?" className="fld !min-h-11 !py-2 text-sm" />
        </div>
      </div>
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm text-ok">{state.ok}. Keep going!</p>}
      <button type="submit" disabled={pending} className="btn btn-primary btn-sm w-full disabled:opacity-60">
        {pending && <Loader2 size={16} className="animate-spin" aria-hidden />} Log study time
      </button>
    </form>
  );
}

export function RecentLogs({ logs, today }: { logs: { id: string; log_date: ISODate; minutes: number; note: string | null; item_title: string | null; plan_title: string | null }[]; today: ISODate }) {
  const [pending, start] = useTransition();
  if (!logs.length) return <p className="text-sm text-quiet">No study time logged yet.</p>;
  return (
    <ul className="divide-y divide-fg/[.06]">
      {logs.map((l) => (
        <li key={l.id} className="flex items-start gap-3 py-2.5 text-sm">
          <span className="w-14 shrink-0 font-bold">{fmtHours(l.minutes / 60)}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-soft">{l.item_title ?? l.note ?? l.plan_title ?? "Study session"}</span>
            <span className="text-xs text-quiet">{relDay(l.log_date, today)}{l.item_title && l.note ? ` · ${l.note}` : ""}</span>
          </span>
          <button type="button" disabled={pending} onClick={() => start(async () => void (await deleteLog(l.id)))} aria-label="Delete log entry" className="grid h-7 w-7 place-items-center rounded-md text-quiet hover:bg-fg/5 hover:text-danger">
            <X size={14} aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- Plan controls ---------------- */

export function PlanControls({
  plan,
  extra,
}: {
  plan: { id: string; title: string; status: string; week: number[] };
  /** Extra toolbar items (e.g. Export) laid out with the others. */
  extra?: React.ReactNode;
}) {
  const [pending, start] = useTransition();
  const [flash, toast] = useFlash();
  const [settings, setSettings] = useState(false);
  const run = (fn: () => Promise<FormState>) => start(async () => flash(await fn()));
  return (
    <>
      {/* One toolbar: 2-column grid on phones, a single wrapping row from sm up. */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap [&>*]:min-w-0 [&_.btn]:w-full sm:[&_.btn]:w-auto" data-tour="plan-actions" role="toolbar" aria-label="Plan actions">
        <button type="button" disabled={pending} onClick={() => run(() => rebalancePlan(plan.id))} className="btn btn-ghost btn-sm !min-h-10 !px-4" title="Reschedule every unfinished topic starting today">
          <RefreshCcw size={15} className={cn(pending && "animate-spin")} aria-hidden /> Rebalance from today
        </button>
        {plan.status !== "completed" && (
          <button type="button" disabled={pending} onClick={() => run(() => setPlanStatus(plan.id, plan.status === "paused" ? "active" : "paused"))} className="btn btn-ghost btn-sm !min-h-10 !px-4">
            {plan.status === "paused" ? <Play size={15} aria-hidden /> : <Pause size={15} aria-hidden />}
            {plan.status === "paused" ? "Resume" : "Pause"}
          </button>
        )}
        <button type="button" onClick={() => setSettings(true)} className="btn btn-ghost btn-sm !min-h-10 !px-4">
          <Settings2 size={15} aria-hidden /> Settings
        </button>
        {extra}
      </div>
      {settings && <SettingsDialog plan={plan} onClose={() => setSettings(false)} />}
      {toast}
    </>
  );
}

function SettingsDialog({ plan, onClose }: { plan: { id: string; title: string; week: number[] }; onClose: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updatePlanSettings.bind(null, plan.id), undefined);
  const [week, setWeek] = useState(plan.week);
  const [title, setTitle] = useState(plan.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-ground/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="settings-title" className="surface max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 id="settings-title" className="text-xl font-bold">Plan settings</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-fg/10"><X size={18} aria-hidden /></button>
        </div>
        <form action={action} className="mt-5 space-y-5">
          <div>
            <label htmlFor="s-title" className="lbl">Name</label>
            <input id="s-title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className="fld" />
          </div>
          <div>
            <span className="lbl">Hours for each weekday</span>
            <input type="hidden" name="week" value={JSON.stringify(week)} />
            <WeekHoursEditor week={week} onChange={setWeek} compact />
            <p className="mt-2 text-xs text-quiet">{fmtHours(week.reduce((a, b) => a + b, 0))} per week</p>
          </div>
          <p className="text-xs text-quiet">Saving reschedules every unfinished topic from today. Finished topics keep their dates.</p>
          {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn btn-primary btn-sm w-full disabled:opacity-60">
            {pending && <Loader2 size={16} className="animate-spin" aria-hidden />} Save & reschedule
          </button>
        </form>
        <div className="mt-6 border-t border-fg/10 pt-5">
          {confirmDelete ? (
            <div className="rounded-2xl border border-[#ff7a7a]/40 bg-[#ff7a7a]/5 p-4">
              <p className="text-sm text-danger">Delete this plan, its progress, notes and logged time? This cannot be undone.</p>
              <div className="mt-3 flex gap-2">
                <button type="button" disabled={deleting} onClick={() => startDelete(() => deletePlan(plan.id))} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#ff5c5c] px-4 text-sm font-bold text-fg">
                  {deleting && <Loader2 size={14} className="animate-spin" aria-hidden />} Yes, delete
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="min-h-10 rounded-full px-4 text-sm font-bold text-muted hover:text-fg">Cancel</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-danger hover:text-danger">
              <Trash2 size={15} aria-hidden /> Delete plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyPlans() {
  return (
    <div className="rounded-3xl border border-dashed border-fg/20 p-10 text-center">
      <h3 className="text-xl font-bold">No plans yet</h3>
      <p className="mx-auto mt-2 max-w-md text-muted">Pick a learning path or write your own. You will get a day-by-day schedule to follow.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/learn/plans/new/" className="btn btn-primary btn-sm">Create a plan</Link>
        <Link href="/learn/#paths" className="btn btn-ghost btn-sm">Browse paths</Link>
      </div>
    </div>
  );
}
