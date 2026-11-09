"use client";
import { useActionState, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  Check,
  ClipboardPaste,
  ListTree,
  Loader2,
  Network,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { createPlan, type FormState } from "@/app/learn/actions";
import { PathIcon } from "@/components/learn/bits";
import { MindMap } from "@/components/learn/MindMap";
import { FirstDays, ModuleTimeline, OutlineEditor, PACE_PRESETS, WeekHoursEditor } from "@/components/learn/PlanBuilder";
import { addDays, diffDays, fmtDate, fmtLong, weekday, type ISODate } from "@/lib/learn/dates";
import { buildSchedule, estimateEnd, hoursForDeadline, studyDaysOf, weekHoursFrom, weeklyHours, type WeekHours } from "@/lib/learn/schedule";
import { outlineToTree, treeHours, treeTopics, uid, type PlanTree } from "@/lib/learn/tree";
import { fmtHours } from "@/lib/learn/analytics";
import type { PathCategory, PathIconName } from "@/data/learn/types";
import { cn } from "@/lib/cn";

export type PathOption = {
  slug: string;
  title: string;
  tagline: string;
  icon: PathIconName;
  category: PathCategory;
  level: string;
  hours: number;
  topics: number;
  tree: PlanTree;
};

const STEPS = ["Choose", "Customize", "Schedule", "Review"] as const;
const EXAMPLE = `# Basics
Read the official getting-started guide | 2
  Install the tools
  Follow the quickstart
  Note three things that surprised you
Build a hello-world project | 1.5

# Practice
Solve 10 exercises | 3
  Exercises 1-5
  Exercises 6-10
Write a short blog post about it | 1`;

const clone = (t: PlanTree): PlanTree => ({ modules: t.modules.map((m) => ({ ...m, topics: m.topics.map((x) => ({ ...x })) })) });

export function NewPlanForm({ options, categories, initial, today }: { options: PathOption[]; categories: readonly string[]; initial?: string; today: ISODate }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createPlan, undefined);
  const init = options.find((o) => o.slug === initial);
  const [step, setStep] = useState(init ? 1 : 0);
  const [source, setSource] = useState<string>(init?.slug ?? "");
  const [tree, setTree] = useState<PlanTree>(init ? clone(init.tree) : { modules: [] });
  const [title, setTitle] = useState(init?.title ?? "");
  const [goal, setGoal] = useState(init?.tagline ?? "");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState("");
  const [editorView, setEditorView] = useState<"map" | "outline">("map");
  const [start, setStart] = useState<ISODate>(today);
  const [week, setWeek] = useState<WeekHours>(PACE_PRESETS[1].week);
  const [mode, setMode] = useState<"hours" | "deadline">("hours");
  const [deadline, setDeadline] = useState("");

  const path = options.find((o) => o.slug === source);
  const totalHours = treeHours(tree);
  const topicCount = treeTopics(tree);
  const studyDays = studyDaysOf(week);

  const effectiveWeek = useMemo<WeekHours | null>(() => {
    if (!studyDays.length) return null;
    if (mode === "deadline") {
      if (!deadline || deadline < start) return null;
      const h = hoursForDeadline(totalHours, start, deadline, studyDays);
      return h === null ? null : weekHoursFrom(h, studyDays);
    }
    return week;
  }, [mode, deadline, start, totalHours, studyDays, week]);

  const end = effectiveWeek && totalHours > 0 ? estimateEnd(totalHours, start, effectiveWeek) : null;
  const rows = useMemo(() => tree.modules.flatMap((m) => m.topics.filter((t) => t.title.trim()).map((t) => ({ module: m.title || "Untitled module", title: t.title, hours: t.hours }))), [tree]);
  const scheduled = useMemo(() => {
    if (!effectiveWeek || step !== 3 || rows.length === 0) return [];
    const s = buildSchedule(rows.map((r) => r.hours), start, effectiveWeek);
    return rows.map((r, i) => ({ ...r, ...s[i] }));
  }, [effectiveWeek, rows, start, step]);

  const filtered = options.filter(
    (o) => (cat === "All" || o.category === cat) && (!query || `${o.title} ${o.tagline} ${o.category}`.toLowerCase().includes(query.toLowerCase())),
  );

  const choose = (o: PathOption) => {
    setSource(o.slug);
    setTree(clone(o.tree));
    setTitle(o.title);
    setGoal(o.tagline);
    setStep(1);
  };
  const scratch = () => {
    setSource("");
    setTree({ modules: [{ id: uid("m"), title: "Module 1", topics: [{ id: uid("t"), title: "", hours: 1 }] }] });
    setTitle("");
    setGoal("");
    setEditorView("outline");
    setStep(1);
  };

  const canNext = [true, topicCount > 0 && rows.length > 0 && title.trim().length > 0, !!end, true][step];
  const nextStart = (n: number) => {
    let d = addDays(today, 1);
    while (weekday(d) !== n) d = addDays(d, 1);
    return d;
  };

  return (
    <form action={action}>
      <input type="hidden" name="path" value={source} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="description" value={goal} />
      <input type="hidden" name="tree" value={JSON.stringify(tree)} />
      <input type="hidden" name="week" value={JSON.stringify(week)} />
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="deadline" value={deadline} />
      <input type="hidden" name="start" value={start} />

      {/* Stepper */}
      <ol className="mb-8 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s} className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors",
                i === step ? "border-blue bg-blue text-white" : i < step ? "border-blue/40 text-fg hover:bg-blue/10" : "border-fg/10 text-quiet",
              )}
            >
              <span className={cn("grid h-5 w-5 place-items-center rounded-full text-[11px]", i === step ? "bg-white/25" : i < step ? "bg-blue text-white" : "bg-fg/10")}>
                {i < step ? <Check size={12} strokeWidth={3} aria-hidden /> : i + 1}
              </span>
              {s}
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-fg/15" aria-hidden />}
          </li>
        ))}
      </ol>

      {/* ---------- Step 1: choose ---------- */}
      {step === 0 && (
        <div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-80">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-quiet" aria-hidden />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search paths" className="fld !pl-10" aria-label="Search paths" />
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
              {["All", ...categories].map((c) => (
                <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c} className={cn("min-h-9 rounded-full border px-3 text-[13px] font-bold", cat === c ? "border-fg bg-fg text-ground" : "border-fg/15 text-muted hover:text-fg")}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button type="button" onClick={scratch} className="group flex min-h-[132px] flex-col justify-between rounded-2xl border border-dashed border-fg/25 p-5 text-left transition-colors hover:border-blue hover:bg-blue/[.04]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue/10 text-blue-light"><Sparkles size={19} aria-hidden /></span>
              <span>
                <span className="block font-bold">Start from scratch</span>
                <span className="block text-sm text-quiet">Build your own plan as a mind map or outline.</span>
              </span>
            </button>
            <button type="button" onClick={() => setImporting((v) => !v)} aria-expanded={importing} className={cn("group flex min-h-[132px] flex-col justify-between rounded-2xl border border-dashed p-5 text-left transition-colors hover:border-blue hover:bg-blue/[.04]", importing ? "border-blue" : "border-fg/25")}>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue/10 text-blue-light"><ClipboardPaste size={19} aria-hidden /></span>
              <span>
                <span className="block font-bold">Paste a syllabus</span>
                <span className="block text-sm text-quiet">Turn a course outline or list into a plan.</span>
              </span>
            </button>
            {importing && (
              <div className="surface rounded-2xl p-4 sm:col-span-2 lg:col-span-1 lg:row-span-2">
                <label htmlFor="import" className="lbl">One topic per line, <code className="text-muted"># Module</code> for headings, <code className="text-muted">| hours</code> optional, indent a line for a subtopic</label>
                <textarea id="import" rows={7} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={EXAMPLE} className="fld font-mono text-[13px]" />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={!importText.trim()}
                    onClick={() => {
                      const t = outlineToTree(importText);
                      if (!t.modules.length) return;
                      setSource("");
                      setTree(t);
                      setTitle("");
                      setGoal("");
                      setStep(1);
                    }}
                    className="btn btn-primary btn-sm disabled:opacity-50"
                  >
                    Use this list
                  </button>
                  <button type="button" onClick={() => setImportText(EXAMPLE)} className="btn btn-ghost btn-sm">Example</button>
                </div>
              </div>
            )}
            {filtered.map((o) => (
              <button key={o.slug} type="button" onClick={() => choose(o)} className="card3d group surface flex flex-col rounded-2xl p-5 text-left">
                <div className="flex items-start justify-between gap-3">
                  <PathIcon icon={o.icon} className="h-10 w-10 rounded-xl" size={18} />
                  <span className="rounded-full border border-fg/12 px-2 py-0.5 text-[11px] font-semibold text-quiet">{o.category}</span>
                </div>
                <span className="mt-3 block font-bold leading-snug">{o.title}</span>
                <span className="mt-1 block text-sm text-quiet">{o.tagline}</span>
                <span className="mt-auto pt-3 text-xs text-muted">{o.topics} topics · {fmtHours(o.hours)} · {o.level}</span>
              </button>
            ))}
          </div>
          {filtered.length === 0 && <p className="mt-8 text-center text-muted">No paths match. Try another search, or start from scratch.</p>}
        </div>
      )}

      {step > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            {/* ---------- Step 2: customize ---------- */}
            {step === 1 && (
              <section className="surface rounded-3xl p-5 md:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="lbl">Plan name</label>
                    <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="e.g. Learn Go in 6 weeks" className="fld" />
                  </div>
                  <div>
                    <label htmlFor="goal" className="lbl">Goal <span className="font-normal text-quiet">(optional)</span></label>
                    <input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={500} placeholder="Why are you learning this?" className="fld" />
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Shape your plan</h2>
                    <p className="text-sm text-quiet">Rename, add, remove or reorder anything. Adjust hours to match what you already know.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {path && (
                      <button type="button" onClick={() => setTree(clone(path.tree))} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold text-muted hover:text-fg">
                        <RotateCcw size={14} aria-hidden /> Reset
                      </button>
                    )}
                    <div className="inline-flex rounded-full border border-fg/15 p-0.5" role="tablist" aria-label="Editor view">
                      {(
                        [
                          ["map", "Mind map", Network],
                          ["outline", "Outline", ListTree],
                        ] as const
                      ).map(([k, l, I]) => (
                        <button key={k} type="button" role="tab" aria-selected={editorView === k} onClick={() => setEditorView(k)} className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold", editorView === k ? "bg-fg text-ground" : "text-muted hover:text-fg")}>
                          <I size={14} aria-hidden /> {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  {editorView === "map" ? (
                    <MindMap tree={tree} rootTitle={title || "Your plan"} rootMeta={`${topicCount} topics · ${fmtHours(totalHours)}`} mode="edit" onChange={setTree} onRootTitle={setTitle} height={560} />
                  ) : (
                    <OutlineEditor tree={tree} onChange={setTree} />
                  )}
                </div>
              </section>
            )}

            {/* ---------- Step 3: schedule ---------- */}
            {step === 2 && (
              <section className="surface space-y-7 rounded-3xl p-5 md:p-6">
                <div>
                  <h2 className="text-lg font-bold">When do you start?</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {[
                      ["Today", today],
                      ["Tomorrow", addDays(today, 1)],
                      ["Next Monday", nextStart(1)],
                    ].map(([l, d]) => (
                      <button key={l} type="button" onClick={() => setStart(d)} aria-pressed={start === d} className={cn("h-10 rounded-xl border px-3.5 text-sm font-bold", start === d ? "border-blue bg-blue/10 text-fg" : "border-fg/15 text-muted hover:text-fg")}>
                        {l}
                      </button>
                    ))}
                    <input type="date" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} className="fld !min-h-10 !w-auto !py-1.5 text-sm" aria-label="Start date" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold">How much time each day?</h2>
                      <p className="text-sm text-quiet">Pick a preset or set each weekday. Days set to Off are rest days.</p>
                    </div>
                    <div className="inline-flex rounded-full border border-fg/15 p-0.5" role="tablist" aria-label="Pace mode">
                      {(
                        [
                          ["hours", "Set my hours"],
                          ["deadline", "Finish by a date"],
                        ] as const
                      ).map(([k, l]) => (
                        <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={cn("min-h-9 rounded-full px-3.5 text-[13px] font-bold", mode === k ? "bg-fg text-ground" : "text-muted hover:text-fg")}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  {mode === "hours" && (
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {PACE_PRESETS.map((p) => {
                        const on = p.week.join() === week.join();
                        return (
                          <button key={p.key} type="button" onClick={() => setWeek(p.week)} aria-pressed={on} className={cn("rounded-2xl border p-3 text-left transition-colors", on ? "border-blue bg-blue/10" : "border-fg/10 hover:border-fg/25")}>
                            <span className="block text-sm font-bold">{p.label}</span>
                            <span className="block text-xs text-quiet">{p.hint}</span>
                            <span className="mt-1 block text-xs font-semibold text-muted">{fmtHours(weeklyHours(p.week))}/week</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-4">
                    {mode === "deadline" ? (
                      <>
                        <p className="mb-3 text-sm text-muted">Choose your study days, then a finish date. We work out the hours per day.</p>
                        <WeekHoursEditor week={week} onChange={setWeek} compact />
                        <div className="mt-4 max-w-xs">
                          <label htmlFor="deadline" className="lbl">Finish by</label>
                          <input id="deadline" type="date" min={start} value={deadline} onChange={(e) => setDeadline(e.target.value)} className="fld" />
                        </div>
                        {effectiveWeek && <p className="mt-3 text-sm">You need <b>{fmtHours(effectiveWeek[studyDays[0]])}</b> on each study day.</p>}
                      </>
                    ) : (
                      <WeekHoursEditor week={week} onChange={setWeek} />
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ---------- Step 4: review ---------- */}
            {step === 3 && effectiveWeek && (
              <>
                <section className="surface rounded-3xl p-5 md:p-6">
                  <h2 className="text-lg font-bold">Timeline</h2>
                  <p className="mb-4 text-sm text-quiet">When each module happens with this pace.</p>
                  <ModuleTimeline rows={scheduled} start={start} />
                </section>
                <section className="surface rounded-3xl p-5 md:p-6">
                  <h2 className="text-lg font-bold">Your first two weeks</h2>
                  <p className="mb-4 text-sm text-quiet">What you will study each day.</p>
                  <FirstDays rows={scheduled} start={start} week={effectiveWeek} />
                </section>
              </>
            )}

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => setStep((s) => s - 1)} className="btn btn-ghost btn-sm">
                <ArrowLeft size={16} aria-hidden /> Back
              </button>
              {step < 3 ? (
                <button key="next" type="button" disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="btn btn-primary btn-sm disabled:opacity-50">
                  Continue <ArrowRight size={16} aria-hidden />
                </button>
              ) : (
                // Separate key: React must not reuse the Continue button, or its click would submit the form.
                <button key="create" type="submit" disabled={pending || !end} className="btn btn-primary btn-sm disabled:opacity-50">
                  {pending && <Loader2 size={16} className="animate-spin" aria-hidden />} Create plan
                </button>
              )}
            </div>
            {step === 1 && !canNext && <p className="text-right text-sm text-quiet">{!title.trim() ? "Give your plan a name to continue." : "Add at least one topic to continue."}</p>}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="surface rounded-3xl p-5">
              <div className="flex items-center gap-3">
                {path ? <PathIcon icon={path.icon} className="h-10 w-10 rounded-xl" size={18} /> : <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue/10 text-blue-light"><Sparkles size={18} aria-hidden /></span>}
                <div className="min-w-0">
                  <div className="truncate font-bold">{title || "Untitled plan"}</div>
                  <div className="text-xs text-quiet">{path ? `Based on ${path.title}` : "Custom plan"}</div>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-2 text-center">
                {[
                  [tree.modules.length, "modules"],
                  [topicCount, "topics"],
                  [fmtHours(totalHours), "total"],
                  [effectiveWeek ? fmtHours(weeklyHours(effectiveWeek)) : "-", "per week"],
                ].map(([v, l]) => (
                  <div key={l as string} className="rounded-xl bg-panel py-2.5">
                    <dd className="font-display text-lg font-bold">{v}</dd>
                    <dt className="text-[11px] text-quiet">{l}</dt>
                  </div>
                ))}
              </dl>
              <div className="mt-3 rounded-2xl border border-blue/30 bg-blue/[.06] p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-quiet"><CalendarCheck2 size={14} aria-hidden /> Estimated finish</div>
                <div className="mt-1 font-display text-xl font-bold">{end ? fmtLong(end) : step < 2 ? "Set a pace next" : "-"}</div>
                {end && <div className="mt-0.5 text-sm text-soft">from {fmtDate(start)} · about {Math.max(1, Math.ceil((diffDays(start, end) + 1) / 7))} weeks</div>}
              </div>
              {effectiveWeek && Math.max(...effectiveWeek) > 6 && (
                <p className="mt-3 flex gap-2 text-sm text-warn">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
                  More than 6 hours on a day is hard to sustain. Consider more days or a later finish.
                </p>
              )}
              {state?.error && <p role="alert" className="mt-3 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>}
            </div>
          </aside>
        </div>
      )}
    </form>
  );
}
