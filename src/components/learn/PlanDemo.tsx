"use client";
import { useState } from "react";
import { Bar, ProgressRing } from "@/components/learn/bits";
import { cn } from "@/lib/cn";

/** Example plan in the Learn hero. Ticking today's topics updates the module bar, the overall ring and the status. */
const TOTAL_TOPICS = 34;
const DONE_BEFORE_TODAY = 11; // Linux module (6) + most of Python (5)
const CONTAINER_TOPICS = 5;
const TODAY = ["Dockerfiles & multi-stage builds", "Docker Compose for local stacks", "Pushing images to a registry"];

export function PlanDemo() {
  const [done, setDone] = useState<boolean[]>([true, false, false]);
  const doneToday = done.filter(Boolean).length;
  const overall = Math.round(((DONE_BEFORE_TODAY + doneToday) / TOTAL_TOPICS) * 100);
  const containers = Math.round((doneToday / CONTAINER_TOPICS) * 100);
  const status = doneToday === TODAY.length ? { label: "Ahead", cls: "border-ok/40 bg-ok/10 text-ok" } : { label: "On track", cls: "border-blue/40 bg-blue/10 text-blue-light" };

  const toggle = (i: number, el: HTMLElement) => {
    setDone((d) => d.map((v, k) => (k === i ? !v : v)));
    // Ripple the page background from the box that was ticked.
    const r = el.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent("field:pulse", { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2, strength: 1 } }));
  };

  return (
    <div className="hero-in surface relative rounded-3xl p-6 [animation-delay:.15s]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-quiet">Example plan: Full DevOps with Python</div>
          <div className="mt-1 font-display text-lg font-bold">Week 6 of 18</div>
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-bold transition-colors", status.cls)} aria-live="polite">{status.label}</span>
      </div>
      <div className="mt-6 flex items-center gap-6">
        <ProgressRing pct={overall} size={104} label="done" />
        <div className="flex-1 space-y-3 text-sm">
          {([
            ["Linux & networking", 100],
            ["Python for automation", 72],
            ["Containers with Docker", containers],
          ] as const).map(([t, p]) => (
            <div key={t}>
              <div className="mb-1 flex justify-between text-[13px]">
                <span className="text-muted">{t}</span>
                <span className="text-quiet tabular-nums">{p}%</span>
              </div>
              <Bar pct={p} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-fg/10 bg-panel p-4">
        <div className="text-xs font-semibold text-quiet">Today. Try ticking one.</div>
        <ul className="mt-1">
          {TODAY.map((t, i) => (
            <li key={t}>
              <button
                type="button"
                aria-pressed={done[i]}
                onClick={(e) => toggle(i, e.currentTarget.querySelector("span") ?? e.currentTarget)}
                className="group mt-2 flex w-full items-center gap-3 rounded-lg py-1 text-left text-sm"
              >
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-[background-color,border-color,scale] group-active:scale-90",
                    done[i] ? "border-blue-fill bg-blue-fill" : "border-fg/25 group-hover:border-blue-light",
                  )}
                >
                  {done[i] && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" aria-hidden>
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </span>
                <span className={cn("transition-colors", done[i] ? "text-quiet line-through" : "group-hover:text-fg")}>{t}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
