"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Circle, Eye, Lightbulb, Link2, Pause, Play, RotateCcw, Shuffle, ThumbsUp, Undo2 } from "lucide-react";
import type { Visual } from "@/data/learn/explainers/types";
import { VisualBlock, stepCount, stepText } from "@/components/learn/visuals";
import { cn } from "@/lib/cn";

const store = {
  get<T>(k: string, fallback: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};

/* ---------------- Step-through diagram ---------------- */

export function StepVisual({ v }: { v: Visual }) {
  const n = stepCount(v);
  const [active, setActive] = useState<number | undefined>(undefined);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      setActive((a) => {
        const next = a === undefined ? 0 : a + 1;
        if (next >= n) {
          setPlaying(false);
          return a;
        }
        return next;
      });
    }, active === undefined ? 50 : 2200);
    return () => clearTimeout(t);
  }, [playing, active, n]);

  const btn = "grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-fg/10 hover:text-fg disabled:opacity-30";
  const controls =
    n > 1 ? (
      <span className="flex items-center gap-0.5" role="group" aria-label="Step through diagram">
        <button type="button" className={btn} disabled={!active} onClick={() => { setPlaying(false); setActive((a) => Math.max(0, (a ?? 0) - 1)); }} aria-label="Previous step">
          <ChevronLeft size={17} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => {
            if (playing) return setPlaying(false);
            if (active !== undefined && active >= n - 1) setActive(undefined);
            setPlaying(true);
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-fill px-3 text-[13px] font-bold text-white"
          aria-label={playing ? "Pause" : "Play steps"}
        >
          {playing ? <Pause size={14} aria-hidden /> : <Play size={14} fill="currentColor" aria-hidden />}
          <span className="hidden sm:inline">{playing ? "Pause" : active === undefined ? "Play" : "Resume"}</span>
        </button>
        <button type="button" className={btn} disabled={active !== undefined && active >= n - 1} onClick={() => { setPlaying(false); setActive((a) => (a === undefined ? 0 : Math.min(n - 1, a + 1))); }} aria-label="Next step">
          <ChevronRight size={17} aria-hidden />
        </button>
        {active !== undefined && (
          <button type="button" className={btn} onClick={() => { setPlaying(false); setActive(undefined); }} aria-label="Show whole diagram">
            <RotateCcw size={15} aria-hidden />
          </button>
        )}
      </span>
    ) : null;

  const caption =
    active !== undefined ? (
      <div className="flex items-start gap-3 border-t border-fg/[.07] bg-blue/[.05] px-5 py-3" aria-live="polite">
        <span className="mt-0.5 shrink-0 rounded-md bg-blue-fill px-2 py-0.5 text-[11px] font-bold text-white">
          {active + 1}/{n}
        </span>
        <p className="text-[15px] leading-snug">{stepText(v, active)}</p>
      </div>
    ) : null;

  return <VisualBlock v={v} active={active} controls={controls} caption={caption} />;
}

/* ---------------- Flashcards ---------------- */

export function Flashcards({ terms, storageKey }: { terms: { term: string; meaning: string }[]; storageKey: string }) {
  const [order, setOrder] = useState(() => terms.map((_, i) => i));
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [known, setKnown] = useState<number[]>([]);
  useEffect(() => setKnown(store.get<number[]>(storageKey, [])), [storageKey]);
  const toggleKnown = (i: number) =>
    setKnown((k) => {
      const next = k.includes(i) ? k.filter((x) => x !== i) : [...k, i];
      store.set(storageKey, next);
      return next;
    });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-quiet">Tap a card to flip it. {known.length}/{terms.length} known</p>
        <div className="flex gap-1">
          <button type="button" onClick={() => { setOrder((o) => [...o].sort(() => Math.random() - 0.5)); setFlipped(new Set()); }} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold text-muted hover:bg-fg/10 hover:text-fg">
            <Shuffle size={14} aria-hidden /> Shuffle
          </button>
          <button type="button" onClick={() => setFlipped(flipped.size === terms.length ? new Set() : new Set(terms.map((_, i) => i)))} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold text-muted hover:bg-fg/10 hover:text-fg">
            <Undo2 size={14} aria-hidden /> {flipped.size === terms.length ? "Hide all" : "Show all"}
          </button>
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {order.map((i) => {
          const t = terms[i];
          const isFlipped = flipped.has(i);
          const isKnown = known.includes(i);
          return (
            <li key={t.term} className="relative" style={{ perspective: 900 }}>
              <button
                type="button"
                onClick={() => setFlipped((f) => { const n = new Set(f); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                aria-pressed={isFlipped}
                className="relative block h-32 w-full text-left [transform-style:preserve-3d] transition-transform duration-500"
                style={{ transform: isFlipped ? "rotateY(180deg)" : "none" }}
              >
                <span aria-hidden={isFlipped} className={cn("absolute inset-0 flex flex-col justify-between rounded-2xl border p-4 [backface-visibility:hidden]", isKnown ? "border-ok/40 bg-ok/[.06]" : "border-fg/10 bg-card")}>
                  <span className="font-mono text-[15px] font-bold text-blue-light">{t.term}</span>
                  <span className="text-xs text-quiet">Tap to see the meaning</span>
                </span>
                <span aria-hidden={!isFlipped} className="absolute inset-0 flex items-center rounded-2xl border border-blue/40 bg-blue/[.08] p-4 text-[15px] leading-snug [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  {t.meaning}
                </span>
              </button>
              <button
                type="button"
                onClick={() => toggleKnown(i)}
                aria-pressed={isKnown}
                aria-label={isKnown ? `Unmark ${t.term} as known` : `Mark ${t.term} as known`}
                className={cn("hit absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full", isKnown ? "bg-ok text-white" : "bg-fg/[.06] text-quiet hover:text-fg")}
              >
                <Check size={15} strokeWidth={3} aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------- Self-check quiz ---------------- */

type Mark = "got" | "review";

export function SelfCheck({ check, storageKey }: { check: { q: string; a: string }[]; storageKey: string }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [marks, setMarks] = useState<Record<number, Mark>>({});
  useEffect(() => setMarks(store.get<Record<number, Mark>>(storageKey, {})), [storageKey]);
  const mark = (i: number, m: Mark) =>
    setMarks((x) => {
      const next = { ...x, [i]: m };
      store.set(storageKey, next);
      return next;
    });
  const answered = Object.keys(marks).length;
  const got = Object.values(marks).filter((m) => m === "got").length;

  return (
    <div>
      <div className="space-y-3">
        {check.map((c, i) => {
          const isOpen = open.has(i);
          const m = marks[i];
          return (
            <div key={i} className={cn("surface rounded-2xl", m === "got" && "!border-ok/40", m === "review" && "!border-warn/40")}>
              <button
                type="button"
                onClick={() => setOpen((o) => { const n = new Set(o); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-3 p-4 text-left font-semibold"
              >
                <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold", m === "got" ? "bg-ok text-white" : m === "review" ? "bg-warn text-white" : "bg-blue/15 text-blue-light")}>
                  {m === "got" ? <Check size={13} strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                <span className="flex-1">{c.q}</span>
                <span className="shrink-0 text-xs font-bold text-blue-light">{isOpen ? "Hide" : "Reveal"}</span>
              </button>
              {isOpen && (
                <div className="border-t border-fg/[.07] px-4 pb-4 pt-3 sm:pl-13">
                  <p className="text-[15px] leading-relaxed text-soft">{c.a}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => mark(i, "got")} aria-pressed={m === "got"} className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-bold", m === "got" ? "border-ok bg-ok text-white" : "border-fg/15 text-muted hover:text-fg")}>
                      <ThumbsUp size={14} aria-hidden /> I got it
                    </button>
                    <button type="button" onClick={() => mark(i, "review")} aria-pressed={m === "review"} className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-bold", m === "review" ? "border-warn bg-warn text-white" : "border-fg/15 text-muted hover:text-fg")}>
                      <RotateCcw size={14} aria-hidden /> Review again
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {answered > 0 && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm text-soft">
          <ThumbsUp size={16} className="text-blue-light" aria-hidden />
          {got === check.length ? "All correct. You can mark this topic as learned." : `${got} of ${check.length} right so far${answered < check.length ? `, ${check.length - answered} to go` : ". Review the diagrams and try again."}`}
        </p>
      )}
    </div>
  );
}

/* ---------------- Learned state (per browser) ---------------- */

const learnedKey = (path: string) => `il-learned:${path}`;

export function useLearned(pathSlug: string) {
  const [learned, setLearned] = useState<string[]>([]);
  useEffect(() => {
    setLearned(store.get<string[]>(learnedKey(pathSlug), []));
    const on = () => setLearned(store.get<string[]>(learnedKey(pathSlug), []));
    window.addEventListener("il-learned", on);
    return () => window.removeEventListener("il-learned", on);
  }, [pathSlug]);
  const toggle = (k: string) => {
    const cur = store.get<string[]>(learnedKey(pathSlug), []);
    const next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k];
    store.set(learnedKey(pathSlug), next);
    window.dispatchEvent(new Event("il-learned"));
  };
  return { learned, toggle };
}

export function LearnedButton({ pathSlug, topicKey }: { pathSlug: string; topicKey: string }) {
  const { learned, toggle } = useLearned(pathSlug);
  const on = learned.includes(topicKey);
  return (
    <button
      type="button"
      onClick={() => toggle(topicKey)}
      aria-pressed={on}
      className={cn("inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors", on ? "border-ok bg-ok text-white" : "border-fg/15 text-fg hover:border-ok/60")}
    >
      {on ? <CheckCircle2 size={17} aria-hidden /> : <Circle size={17} aria-hidden />}
      {on ? "Learned" : "Mark as learned"}
    </button>
  );
}

export function SidebarTopics({
  pathSlug,
  current,
  topics,
  total,
  moduleTitle,
}: {
  pathSlug: string;
  current: string;
  topics: { key: string; title: string; href: string }[];
  total: string[];
  moduleTitle: string;
}) {
  const { learned } = useLearned(pathSlug);
  const doneInPath = total.filter((k) => learned.includes(k)).length;
  return (
    <>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-quiet">
          <span>Path progress</span>
          <span className="font-bold text-fg">{doneInPath}/{total.length} learned</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fg/[.07]">
          <div className="h-full rounded-full bg-ok transition-[width] duration-500" style={{ width: `${(doneInPath / Math.max(1, total.length)) * 100}%` }} />
        </div>
      </div>
      <h2 className="mt-5 px-2.5 text-xs font-bold text-quiet">{moduleTitle}</h2>
      <ul className="mt-2 space-y-0.5">
        {topics.map((x) => {
          const cur = x.key === current;
          const done = learned.includes(x.key);
          return (
            <li key={x.key}>
              <Link
                href={x.href}
                aria-current={cur ? "page" : undefined}
                className={cn("flex items-start gap-2 rounded-lg px-2.5 py-2.5 text-[13px] leading-snug", cur ? "bg-blue/10 font-bold text-fg" : "text-soft hover:bg-fg/[.05] hover:text-fg")}
              >
                {done ? <CheckCircle2 size={15} className="mt-px shrink-0 text-ok" aria-label="Learned" /> : <Circle size={15} className="mt-px shrink-0 text-fg/25" aria-hidden />}
                {x.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/* ---------------- Reading aids ---------------- */

export function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return <div aria-hidden className="pointer-events-none fixed inset-x-0 top-16 z-40 h-[3px] origin-left bg-blue" style={{ transform: `scaleX(${p})` }} />;
}

export function PageToc({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="On this page" className="hidden lg:block">
      <h2 className="text-xs font-bold text-quiet">On this page</h2>
      <ul className="mt-2 space-y-0.5 border-l border-fg/10">
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className={cn("-ml-px block border-l-2 py-1.5 pl-3 text-[13px]", active === i.id ? "border-blue font-bold text-fg" : "border-transparent text-quiet hover:text-fg")}>
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MobileJump({ items }: { items: { id: string; label: string }[] }) {
  return (
    <label className="block lg:hidden">
      <span className="sr-only">Jump to section</span>
      <select
        defaultValue=""
        onChange={(e) => {
          document.getElementById(e.target.value)?.scrollIntoView({ behavior: "smooth", block: "start" });
          e.target.value = "";
        }}
        className="fld !min-h-11 !py-2 text-sm"
      >
        <option value="" disabled>
          Jump to a section…
        </option>
        {items.map((i) => (
          <option key={i.id} value={i.id}>{i.label}</option>
        ))}
      </select>
    </label>
  );
}

/** ← / → go to the previous / next topic (ignored while typing). */
export function TopicKeys({ prev, next }: { prev?: string; next?: string }) {
  const router = useRouter();
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.altKey || e.ctrlKey || e.metaKey || /input|textarea|select/i.test(t.tagName) || t.isContentEditable) return;
      if (e.key === "ArrowLeft" && prev) router.push(prev);
      if (e.key === "ArrowRight" && next) router.push(next);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [prev, next, router]);
  return null;
}

export function CopyLink() {
  const [done, setDone] = useState(false);
  const url = useMemo(() => (typeof window === "undefined" ? "" : window.location.href.split("#")[0]), []);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url || window.location.href);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {}
      }}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-fg/15 px-4 text-sm font-bold text-muted hover:text-fg"
    >
      {done ? <Check size={16} aria-hidden /> : <Link2 size={16} aria-hidden />} {done ? "Copied" : "Copy link"}
    </button>
  );
}

/* ---------------- Path page helpers ---------------- */

export function LearnedTick({ pathSlug, topicKey }: { pathSlug: string; topicKey: string }) {
  const { learned } = useLearned(pathSlug);
  return learned.includes(topicKey) ? <CheckCircle2 size={16} className="shrink-0 text-ok" aria-label="Learned" /> : null;
}

export function ContinueLearning({ pathSlug, topics }: { pathSlug: string; topics: { key: string; title: string; href: string }[] }) {
  const { learned } = useLearned(pathSlug);
  const done = topics.filter((t) => learned.includes(t.key)).length;
  const next = topics.find((t) => !learned.includes(t.key));
  return (
    <div className="mt-5 rounded-2xl border border-ok/30 bg-ok/[.05] p-4">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-quiet">Your progress</span>
        <span className="font-bold">{done}/{topics.length} learned</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fg/[.07]">
        <div className="h-full rounded-full bg-ok transition-[width] duration-500" style={{ width: `${(done / Math.max(1, topics.length)) * 100}%` }} />
      </div>
      {next ? (
        <Link href={next.href} className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2.5 text-sm font-bold hover:text-blue-light">
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold text-quiet">{done ? "Continue with" : "Start with"}</span>
            <span className="block truncate">{next.title}</span>
          </span>
          <ChevronRight size={18} className="shrink-0" aria-hidden />
        </Link>
      ) : (
        <p className="mt-3 text-sm font-bold text-ok">Every topic learned. Brilliant work!</p>
      )}
    </div>
  );
}

/* ---------------- Multiple-choice quiz ---------------- */

export function Quiz({ items, storageKey }: { items: { q: string; options: string[]; answer: number; why: string }[]; storageKey: string }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  useEffect(() => setPicked(store.get<Record<number, number>>(storageKey, {})), [storageKey]);
  const pick = (qi: number, oi: number) =>
    setPicked((p) => {
      if (p[qi] !== undefined) return p;
      const next = { ...p, [qi]: oi };
      store.set(storageKey, next);
      return next;
    });
  const answered = Object.keys(picked).length;
  const correct = items.filter((q, i) => picked[i] === q.answer).length;
  return (
    <div className="space-y-4">
      {items.map((q, qi) => {
        const chosen = picked[qi];
        const done = chosen !== undefined;
        return (
          <fieldset key={qi} className="surface rounded-2xl p-4 md:p-5">
            <legend className="sr-only">Question {qi + 1}</legend>
            <p className="flex gap-3 font-semibold">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue/15 text-xs font-bold text-blue-light">{qi + 1}</span>
              {q.q}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {q.options.map((o, oi) => {
                const isRight = oi === q.answer;
                const isPicked = oi === chosen;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={done}
                    onClick={() => pick(qi, oi)}
                    aria-pressed={isPicked}
                    className={cn(
                      "flex min-h-11 items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[14.5px] leading-snug transition-colors",
                      !done && "border-fg/12 hover:border-blue/60 hover:bg-blue/[.05]",
                      done && isRight && "border-ok bg-ok/10",
                      done && isPicked && !isRight && "border-danger bg-danger/10",
                      done && !isRight && !isPicked && "border-fg/10 opacity-60",
                    )}
                  >
                    <span className="mt-px font-mono text-xs font-bold text-quiet">{String.fromCharCode(65 + oi)}</span>
                    <span className="flex-1">{o}</span>
                    {done && isRight && <Check size={16} className="shrink-0 text-ok" aria-label="Correct answer" />}
                  </button>
                );
              })}
            </div>
            {done && (
              <p role="status" className={cn("mt-3 text-sm leading-relaxed", chosen === q.answer ? "text-ok" : "text-danger")}>
                <b>{chosen === q.answer ? "Correct." : "Not quite."}</b> <span className="text-soft">{q.why}</span>
              </p>
            )}
          </fieldset>
        );
      })}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-soft">{answered === items.length ? `Score: ${correct}/${items.length}` : `${answered}/${items.length} answered`}</span>
        {answered > 0 && (
          <button type="button" onClick={() => { setPicked({}); store.set(storageKey, {}); }} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 font-bold text-muted hover:bg-fg/10 hover:text-fg">
            <RotateCcw size={14} aria-hidden /> Try again
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Practice exercises ---------------- */

const LEVEL_CLS = { easy: "bg-ok/15 text-ok", medium: "bg-warn/15 text-warn", hard: "bg-danger/15 text-danger" } as const;

export function Practice({ items, storageKey }: { items: { level: "easy" | "medium" | "hard"; task: string; hint: string; solution: string }[]; storageKey: string }) {
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<number[]>([]);
  useEffect(() => setDone(store.get<number[]>(storageKey, [])), [storageKey]);
  const toggle = (k: string) => setShown((s) => ({ ...s, [k]: !s[k] }));
  const toggleDone = (i: number) =>
    setDone((d) => {
      const next = d.includes(i) ? d.filter((x) => x !== i) : [...d, i];
      store.set(storageKey, next);
      return next;
    });
  return (
    <ol className="space-y-4">
      {items.map((p, i) => (
        <li key={i} className={cn("surface rounded-2xl p-4 md:p-5", done.includes(i) && "!border-ok/40")}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-bold">Exercise {i + 1}</span>
            <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold", LEVEL_CLS[p.level])}>{p.level}</span>
            <button type="button" onClick={() => toggleDone(i)} aria-pressed={done.includes(i)} className={cn("ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-bold", done.includes(i) ? "border-ok bg-ok text-white" : "border-fg/15 text-muted hover:text-fg")}>
              {done.includes(i) ? <CheckCircle2 size={14} aria-hidden /> : <Circle size={14} aria-hidden />} {done.includes(i) ? "Done" : "Mark done"}
            </button>
          </div>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed">{p.task}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => toggle(`h${i}`)} aria-expanded={!!shown[`h${i}`]} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-fg/15 px-3 text-[13px] font-bold text-muted hover:text-fg">
              <Lightbulb size={14} aria-hidden /> {shown[`h${i}`] ? "Hide hint" : "Hint"}
            </button>
            <button type="button" onClick={() => toggle(`s${i}`)} aria-expanded={!!shown[`s${i}`]} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-fg/15 px-3 text-[13px] font-bold text-muted hover:text-fg">
              <Eye size={14} aria-hidden /> {shown[`s${i}`] ? "Hide solution" : "Show solution"}
            </button>
          </div>
          {shown[`h${i}`] && <p className="mt-3 rounded-xl bg-warn/[.07] px-3 py-2 text-sm text-soft"><b className="text-fg">Hint:</b> {p.hint}</p>}
          {shown[`s${i}`] && (
            <pre className="force-dark mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-[#0a0f1c] p-4 font-mono text-[13px] leading-relaxed text-[#dce6fa]"><code>{p.solution}</code></pre>
          )}
        </li>
      ))}
    </ol>
  );
}

/* ---------------- Share ---------------- */

export function ShareButtons({ title, path }: { title: string; path: string }) {
  const url = `https://www.invicly.com${path}`;
  const enc = encodeURIComponent;
  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-quiet">Share</span>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center rounded-full border border-fg/15 px-3 text-[13px] font-bold text-muted hover:border-blue/50 hover:text-fg">
          {l.label}
        </a>
      ))}
      <CopyLink />
    </div>
  );
}
