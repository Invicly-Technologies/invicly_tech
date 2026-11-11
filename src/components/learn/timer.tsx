"use client";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, Pause, Play, Square, Timer, X } from "lucide-react";
import { startTimer, stopTimer } from "@/app/learn/actions";
import { useFlash } from "@/components/learn/useFlash";
import { useLearnSession } from "@/components/learn/session";
import type { ActiveTimer } from "@/lib/learn/data";
import { cn } from "@/lib/cn";

type Ctx = {
  timer: ActiveTimer | null;
  pending: boolean;
  start: (t: Omit<ActiveTimer, "started_ms">) => void;
  stop: (discard?: boolean) => void;
  /** null until mounted, so server and client render the same text. */
  now: number | null;
};

const TimerCtx = createContext<Ctx | null>(null);
export const useTimer = () => useContext(TimerCtx);

export function fmtClock(ms: number | null) {
  if (ms === null || Number.isNaN(ms)) return "--:--";
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { timer: initial, refresh } = useLearnSession();
  const [timer, setTimer] = useState<ActiveTimer | null>(initial);
  const [pending, startT] = useTransition();
  const [now, setNow] = useState<number | null>(null);
  const [flash, toast] = useFlash();

  // Server data wins whenever it changes (another tab, a reload, a revalidation).
  const initialKey = initial ? `${initial.item_id}:${initial.subtopic_id}:${initial.started_ms}` : "none";
  useEffect(() => {
    setTimer(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey]);

  useEffect(() => {
    if (!timer) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Show the running clock in the tab title.
  useEffect(() => {
    if (!timer || now === null) return;
    const base = document.title.replace(/^⏱ [\d:]+ · /, "");
    document.title = `⏱ ${fmtClock(now - timer.started_ms)} · ${base}`;
    return () => {
      document.title = document.title.replace(/^⏱ [\d:]+ · /, "");
    };
  }, [now, timer]);

  const start = useCallback(
    (t: Omit<ActiveTimer, "started_ms">) =>
      startT(async () => {
        setTimer({ ...t, started_ms: Date.now() });
        const r = await startTimer(t.item_id, t.subtopic_id);
        flash(r);
        refresh();
      }),
    [flash, refresh],
  );
  const stop = useCallback(
    (discard = false) =>
      startT(async () => {
        setTimer(null);
        const r = await stopTimer(discard);
        flash(r);
        refresh();
      }),
    [flash, refresh],
  );

  const value = useMemo(() => ({ timer, pending, start, stop, now }), [timer, pending, start, stop, now]);
  return (
    <TimerCtx.Provider value={value}>
      {children}
      {timer && <TimerBar />}
      {/* Reserve room so the fixed bar never hides the end of the page on phones. */}
      {timer && <div aria-hidden className="h-20 sm:hidden" />}
      {toast}
    </TimerCtx.Provider>
  );
}

function TimerBar() {
  const ctx = useTimer()!;
  const t = ctx.timer!;
  return (
    <div
      role="region"
      aria-label="Running timer"
      data-tour="timer-bar"
      className="fixed inset-x-3 bottom-3 z-[80] flex items-center gap-3 rounded-2xl border border-blue/40 bg-card/95 p-2 pl-3 shadow-[0_18px_50px_-18px_rgba(10,132,255,.7)] backdrop-blur sm:inset-x-auto sm:right-5 sm:bottom-5 sm:max-w-md"
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff453a] opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ff453a]" />
      </span>
      <span className="font-mono text-lg font-bold tabular-nums" aria-live="off">{fmtClock(ctx.now === null ? null : ctx.now - t.started_ms)}</span>
      <Link href={`/learn/plans/${t.plan_id}/?tab=schedule`} className="min-w-0 flex-1 text-xs leading-tight hover:text-blue-light">
        <span className="block truncate font-bold text-fg">{t.subtopic_title ?? t.item_title}</span>
        <span className="block truncate text-quiet">{t.subtopic_title ? t.item_title : t.plan_title}</span>
      </Link>
      <button type="button" onClick={() => ctx.stop(true)} disabled={ctx.pending} aria-label="Discard timer" title="Discard (don't log)" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-quiet hover:bg-fg/10 hover:text-danger">
        <X size={16} aria-hidden />
      </button>
      <button type="button" onClick={() => ctx.stop(false)} disabled={ctx.pending} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-blue-fill px-3 text-sm font-bold text-white disabled:opacity-60">
        {ctx.pending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Square size={13} fill="currentColor" aria-hidden />} Stop
      </button>
    </div>
  );
}

/** Start/stop toggle for a topic or one of its subtopics. */
export function TimerButton({
  planId,
  planTitle,
  itemId,
  itemTitle,
  subtopicId = null,
  subtopicTitle = null,
  size = "sm",
  className,
}: {
  planId: string;
  planTitle: string;
  itemId: string;
  itemTitle: string;
  subtopicId?: string | null;
  subtopicTitle?: string | null;
  size?: "sm" | "md";
  className?: string;
}) {
  const ctx = useTimer();
  if (!ctx) return null;
  const running = ctx.timer?.item_id === itemId && (ctx.timer?.subtopic_id ?? null) === subtopicId;
  const what = subtopicTitle ?? itemTitle;
  if (size === "md")
    return (
      <button
        type="button"
        onClick={() => (running ? ctx.stop(false) : ctx.start({ plan_id: planId, plan_title: planTitle, item_id: itemId, item_title: itemTitle, subtopic_id: subtopicId, subtopic_title: subtopicTitle }))}
        aria-pressed={running}
        aria-label={running ? `Stop timer for ${what}` : `Start timer for ${what}`}
        className={cn(
          "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-bold transition-colors",
          running ? "border-[#ff453a]/50 bg-[#ff453a]/10 text-fg" : "border-fg/15 text-muted hover:border-blue hover:text-fg",
          className,
        )}
      >
        {running ? <Pause size={14} aria-hidden /> : <Timer size={14} aria-hidden />}
        {running ? <span className="font-mono tabular-nums">{fmtClock(ctx.now === null ? null : ctx.now - ctx.timer!.started_ms)}</span> : "Start timer"}
      </button>
    );
  return (
    <button
      type="button"
      onClick={() => (running ? ctx.stop(false) : ctx.start({ plan_id: planId, plan_title: planTitle, item_id: itemId, item_title: itemTitle, subtopic_id: subtopicId, subtopic_title: subtopicTitle }))}
      aria-pressed={running}
      aria-label={running ? `Stop timer for ${what}` : `Start timer for ${what}`}
      title={running ? "Stop timer" : "Start timer"}
      className={cn(
        "hit hit-sm inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-full transition-colors",
        running ? "bg-[#ff453a]/15 px-2 text-fg" : "w-7 text-quiet hover:bg-blue/15 hover:text-blue-light",
        className,
      )}
    >
      {running ? (
        <>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff453a]" aria-hidden />
          <span className="font-mono text-[11px] font-bold tabular-nums">{fmtClock(ctx.now === null ? null : ctx.now - ctx.timer!.started_ms)}</span>
        </>
      ) : (
        <Play size={13} fill="currentColor" aria-hidden />
      )}
    </button>
  );
}
