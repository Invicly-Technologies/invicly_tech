"use client";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ArrowLeft, CircleHelp, X } from "lucide-react";
import { completeTour } from "@/app/learn/actions";
import { useLearnSession } from "@/components/learn/session";
import { cn } from "@/lib/cn";

type Step = { target?: string; title: string; body: string };
type TourDef = { id: string; match: (path: string) => boolean; steps: Step[] };

const TOURS: TourDef[] = [
  {
    id: "welcome",
    match: (p) => p.startsWith("/learn/dashboard"),
    steps: [
      { title: "Welcome to Invicly Learn", body: "A quick tour of how to plan, study and track. It takes about a minute, and you can replay it any time from the ? button." },
      { target: "nav-paths", title: "Learning paths", body: "17 free paths with modules, short subtopics, docs and a visual guide for every topic." },
      { target: "new-plan", title: "Make a plan", body: "Pick a path or paste a syllabus, edit it as a mind map, set hours for each weekday, then preview the timeline." },
      { target: "today", title: "Today's focus", body: "What's due today, with the next short subtopic. Press ▶ to start a timer and ✓ to tick it off." },
      { target: "log", title: "Log time by hand", body: "Studied away from the timer? Log it here. Every session counts toward your streak." },
      { target: "activity", title: "See your progress", body: "The heatmap and weekly hours show every day you showed up." },
      { target: "theme", title: "Light or dark", body: "Switch theme here. System follows your device." },
      { target: "tour", title: "That's it!", body: "Open any plan for its schedule, mind map, resources and notebook. Replay this tour from here whenever you like." },
    ],
  },
  {
    id: "plan",
    match: (p) => /^\/learn\/plans\/[0-9a-f-]{36}/.test(p),
    steps: [
      { target: "plan-tabs", title: "Your plan, five ways", body: "Overview for charts, Schedule to tick things off, Mind map to see the shape, Resources for every link, Notebook for your notes." },
      { target: "plan-actions", title: "Stay on track", body: "Missed days? Rebalance from today. Change weekday hours in Settings. Pause when life gets busy." },
      { target: "plan-export", title: "Export your notes", body: "Download every topic's notes, subtopics and links as Markdown or a PDF." },
      { title: "Topics, subtopics and timers", body: "Open any topic for its short subtopics, each with a time estimate and a ▶ timer, plus references, notes and a visual explainer page." },
    ],
  },
];

export function LearnTours() {
  const { loaded, user, tours: done } = useLearnSession();
  const path = usePathname();
  const router = useRouter();
  const tour = useMemo(() => TOURS.find((t) => t.match(path)) ?? null, [path]);
  const [active, setActive] = useState<TourDef | null>(null);
  const [finished, setFinished] = useState<string[]>([]);

  useEffect(() => {
    if (!loaded || !user || !tour || finished.includes(tour.id) || done.includes(tour.id)) return;
    // Give the page a moment to render its targets.
    const t = setTimeout(() => setActive(tour), 900);
    return () => clearTimeout(t);
  }, [tour, finished, done, loaded, user]);

  // The "?" button is on every page, but tours exist only for the dashboard and plan pages.
  // Elsewhere it opens the dashboard and starts the welcome tour there (?tour=1).
  useEffect(() => {
    const replay = () => {
      if (tour) setActive(tour);
      else router.push("/learn/dashboard/?tour=1");
    };
    window.addEventListener("il-tour", replay);
    return () => window.removeEventListener("il-tour", replay);
  }, [tour, router]);

  useEffect(() => {
    if (!tour || !new URLSearchParams(window.location.search).has("tour")) return;
    const t = setTimeout(() => {
      setActive(tour);
      window.history.replaceState(null, "", window.location.pathname);
    }, 900);
    return () => clearTimeout(t);
  }, [tour, path]);

  const close = useCallback(() => {
    if (!active) return;
    setFinished((f) => [...f, active.id]);
    void completeTour(active.id);
    setActive(null);
  }, [active]);

  return active ? <TourRunner key={active.id} tour={active} onClose={close} /> : null;
}

function TourRunner({ tour, onClose }: { tour: TourDef; onClose: () => void }) {
  const steps = tour.steps;
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = steps[i];

  const findTarget = useCallback(() => {
    if (!step.target) return null;
    const els = [...document.querySelectorAll<HTMLElement>(`[data-tour="${step.target}"]`)];
    return els.find((e) => e.offsetParent !== null || getComputedStyle(e).position === "fixed") ?? null;
  }, [step]);

  // Skip steps whose target isn't on this page (e.g. no plans yet).
  useEffect(() => {
    if (step.target && !findTarget()) {
      if (i < steps.length - 1) setI(i + 1);
      else setRect(null);
    }
  }, [i, step, steps.length, findTarget]);

  useLayoutEffect(() => {
    const el = findTarget();
    if (!el) return setRect(null);
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    const update = () => setRect(el.getBoundingClientRect());
    update();
    const t = setTimeout(update, 350);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [findTarget]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((x) => (x < steps.length - 1 ? x + 1 : x));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose, steps.length]);

  const pad = 8;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const cardW = Math.min(360, vw - 24);
  let cardStyle: React.CSSProperties;
  if (rect) {
    const below = rect.bottom + pad + 12;
    const spaceBelow = vh - below;
    const top = spaceBelow > 220 ? below : Math.max(12, rect.top - pad - 12 - 210);
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - cardW / 2), vw - cardW - 12);
    cardStyle = { top, left, width: cardW };
  } else {
    cardStyle = { top: "50%", left: "50%", width: cardW, transform: "translate(-50%, -50%)" };
  }
  const last = i === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[95]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {rect ? (
        <div
          className="pointer-events-none absolute rounded-2xl ring-2 ring-blue transition-[top,left,width,height] duration-300"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: "0 0 0 9999px rgba(2,6,16,.62), 0 0 40px 6px rgba(10,132,255,.45)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(2,6,16,.62)]" />
      )}
      <div className="absolute rounded-2xl border border-fg/12 bg-card p-5 shadow-2xl transition-[top,left] duration-300" style={cardStyle}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue/15 text-blue-light"><CircleHelp size={15} aria-hidden /></span>
            <span className="text-xs font-semibold text-quiet">{i + 1} of {steps.length}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Skip tour" className="grid h-8 w-8 place-items-center rounded-lg text-quiet hover:bg-fg/10 hover:text-fg"><X size={16} aria-hidden /></button>
        </div>
        <h2 id="tour-title" className="mt-3 text-lg font-bold">{step.title}</h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-soft">{step.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1" aria-hidden>
            {steps.map((_, k) => (
              <span key={k} className={cn("h-1.5 rounded-full transition-[width,background-color]", k === i ? "w-5 bg-blue" : "w-1.5 bg-fg/20")} />
            ))}
          </div>
          <div className="flex gap-2">
            {i > 0 && (
              <button type="button" onClick={() => setI(i - 1)} className="inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-sm font-bold text-muted hover:text-fg">
                <ArrowLeft size={15} aria-hidden /> Back
              </button>
            )}
            <button type="button" autoFocus onClick={() => (last ? onClose() : setI(i + 1))} className="inline-flex min-h-9 items-center gap-1 rounded-full bg-blue-fill px-4 text-sm font-bold text-white">
              {last ? "Got it" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
