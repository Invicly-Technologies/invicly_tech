import { ArrowDown, ArrowRight, RefreshCw } from "lucide-react";
import type { Visual } from "@/data/learn/explainers/types";
import { cn } from "@/lib/cn";

/** Decorative step accents (identity only; text always uses text tokens). */
const ACC = ["#0A84FF", "#BF5AF2", "#FF9F0A", "#30D158", "#FF375F", "#40C8E0", "#E5B800"];
const acc = (i: number) => ACC[i % ACC.length];
const rise = (i: number): React.CSSProperties => ({ animation: "rise .55s cubic-bezier(.2,.8,.2,1) both", animationDelay: `${i * 70}ms` });

/** Number of steppable parts in a diagram. */
export function stepCount(v: Visual) {
  switch (v.type) {
    case "flow":
    case "cycle":
      return v.steps.length;
    case "layers":
      return v.layers.length;
    case "compare":
      return v.columns.length;
    case "tree":
      return v.children.length;
    case "sequence":
      return v.messages.length;
  }
}

/** Text for one step, used as the caption in step-through mode. */
export function stepText(v: Visual, i: number): string {
  switch (v.type) {
    case "flow":
    case "cycle":
      return [v.steps[i]?.label, v.steps[i]?.detail].filter(Boolean).join(": ");
    case "layers":
      return [v.layers[i]?.label, v.layers[i]?.detail].filter(Boolean).join(": ");
    case "compare":
      return `${v.columns[i]?.title}: ${v.columns[i]?.points.join("; ")}`;
    case "tree":
      return `${v.children[i]?.label}${v.children[i]?.children?.length ? `: ${v.children[i]!.children!.join(", ")}` : ""}`;
    case "sequence": {
      const m = v.messages[i];
      return m ? `${v.actors[m.from]} → ${v.actors[m.to]}: ${m.label}` : "";
    }
  }
}

/** Dims everything except the active step (when stepping through). */
const dim = (active: number | undefined, i: number) =>
  active === undefined ? undefined : i === active ? "is-step-active" : "is-step-dim";

export function VisualBlock({ v, active, controls, caption }: { v: Visual; active?: number; controls?: React.ReactNode; caption?: React.ReactNode }) {
  return (
    <figure className="surface overflow-hidden rounded-3xl">
      <figcaption className="flex flex-wrap items-center gap-2 border-b border-fg/[.07] px-5 py-3 text-sm font-bold">
        <span className="rounded-md bg-blue/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-light">{LABEL[v.type]}</span>
        <span className="min-w-0 flex-1">{v.title}</span>
        {controls}
      </figcaption>
      <div className="p-5 md:p-7">
        {v.type === "flow" && <Flow steps={v.steps} active={active} />}
        {v.type === "layers" && <Layers layers={v.layers} active={active} />}
        {v.type === "cycle" && <Cycle steps={v.steps} active={active} />}
        {v.type === "compare" && <Compare columns={v.columns} active={active} />}
        {v.type === "tree" && <Tree root={v.root} nodes={v.children} active={active} />}
        {v.type === "sequence" && <Sequence actors={v.actors} messages={v.messages} active={active} />}
      </div>
      {caption}
    </figure>
  );
}

const LABEL: Record<Visual["type"], string> = { flow: "Flow", layers: "Layers", cycle: "Cycle", compare: "Compare", tree: "Map", sequence: "Sequence" };

function Flow({ steps, active }: { steps: { label: string; detail?: string }[]; active?: number }) {
  if (steps.length > 4)
    return (
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <li key={i} className={cn("relative rounded-2xl border border-fg/10 bg-ground/40 p-4 pl-14", dim(active, i))} style={rise(i)}>
            <span className="absolute left-4 top-4 grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-white" style={{ background: acc(i) }}>{i + 1}</span>
            <div className="font-bold leading-snug">{s.label}</div>
            {s.detail && <p className="mt-1 text-[13px] leading-snug text-soft">{s.detail}</p>}
            {i < steps.length - 1 && <ArrowRight size={14} className="absolute right-3 top-4 text-quiet" aria-hidden />}
          </li>
        ))}
      </ol>
    );
  return (
    <ol className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-stretch">
      {steps.map((s, i) => (
        <li key={i} className="contents">
          <div className={cn("relative flex-1 rounded-2xl border border-fg/10 bg-ground/40 p-4", dim(active, i))} style={rise(i)}>
            <span className="absolute inset-x-4 top-0 h-[3px] rounded-b" style={{ background: acc(i) }} aria-hidden />
            <span className="text-[11px] font-bold text-quiet">Step {i + 1}</span>
            <div className="mt-1 font-bold leading-snug">{s.label}</div>
            {s.detail && <p className="mt-1 text-[13px] leading-snug text-soft">{s.detail}</p>}
          </div>
          {i < steps.length - 1 && (
            <span className="grid place-items-center text-quiet" aria-hidden>
              <ArrowDown size={18} className="lg:hidden" />
              <ArrowRight size={18} className="hidden lg:block" />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function Layers({ layers, active }: { layers: { label: string; detail?: string }[]; active?: number }) {
  const n = layers.length;
  return (
    <ol className="mx-auto flex max-w-2xl flex-col gap-1.5">
      {layers.map((l, i) => (
        <li
          key={i}
          className={cn("flex items-center gap-4 rounded-xl border px-4 py-3", dim(active, i))}
          style={{
            ...rise(i),
            marginInline: `${(n - 1 - i) * 0}%`,
            borderColor: `color-mix(in oklab, ${acc(i)} 45%, transparent)`,
            background: `color-mix(in oklab, ${acc(i)} ${8 + i * 3}%, var(--color-card))`,
          }}
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-card text-xs font-bold text-muted">{i + 1}</span>
          <div className="min-w-0">
            <div className="font-bold leading-snug">{l.label}</div>
            {l.detail && <p className="text-[13px] leading-snug text-soft">{l.detail}</p>}
          </div>
        </li>
      ))}
      <li className="mt-1 flex justify-between px-1 text-[11px] font-semibold uppercase tracking-wide text-quiet" aria-hidden>
        <span>↑ Higher level</span>
        <span>Lower level ↓</span>
      </li>
    </ol>
  );
}

function Cycle({ steps, active }: { steps: { label: string; detail?: string }[]; active?: number }) {
  const n = steps.length;
  const R = 38; // % of the square
  const pos = (i: number) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) };
  };
  return (
    <>
      {/* Ring on wider screens */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[520px] sm:block">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <marker id="cyc-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--chart-axis)" />
            </marker>
          </defs>
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--chart-grid)" strokeWidth="0.6" strokeDasharray="1.2 1.6" />
          {steps.map((_, i) => {
            const a1 = ((i + 0.22) / n) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 0.78) / n) * Math.PI * 2 - Math.PI / 2;
            const p1 = { x: 50 + R * Math.cos(a1), y: 50 + R * Math.sin(a1) };
            const p2 = { x: 50 + R * Math.cos(a2), y: 50 + R * Math.sin(a2) };
            return <path key={i} d={`M${p1.x},${p1.y} A${R},${R} 0 0 1 ${p2.x},${p2.y}`} fill="none" stroke="var(--chart-axis)" strokeWidth="0.7" markerEnd="url(#cyc-arrow)" />;
          })}
        </svg>
        <div className="absolute inset-[30%] grid place-items-center rounded-full bg-blue/[.06] text-center text-blue-light">
          <RefreshCw size={28} aria-hidden />
        </div>
        {steps.map((s, i) => {
          const p = pos(i);
          return (
            // Outer element centres the card on the ring; the inner one animates (both use transform).
            <div key={i} className="absolute w-[34%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              <div className={cn("rounded-2xl border bg-card p-3 text-center shadow-sm", dim(active, i))} style={{ borderColor: `color-mix(in oklab, ${acc(i)} 55%, transparent)`, ...rise(i) }}>
                <div className="text-[13px] font-bold leading-snug">{i + 1}. {s.label}</div>
                {s.detail && <p className="mt-0.5 text-[11.5px] leading-snug text-soft">{s.detail}</p>}
              </div>
            </div>
          );
        })}
      </div>
      {/* List on phones */}
      <ol className="space-y-2 sm:hidden">
        {steps.map((s, i) => (
          <li key={i} className={cn("flex gap-3 rounded-xl border border-fg/10 p-3", dim(active, i))} style={rise(i)}>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: acc(i) }}>{i + 1}</span>
            <div>
              <div className="font-bold">{s.label}</div>
              {s.detail && <p className="text-[13px] text-soft">{s.detail}</p>}
            </div>
          </li>
        ))}
        <li className="flex items-center gap-2 pl-1 text-xs font-semibold text-quiet"><RefreshCw size={13} aria-hidden /> Back to step 1</li>
      </ol>
    </>
  );
}

function Compare({ columns, active }: { columns: { title: string; points: string[] }[]; active?: number }) {
  return (
    <div className={cn("grid gap-3", columns.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
      {columns.map((c, i) => (
        <div key={i} className={cn("rounded-2xl border border-fg/10 bg-ground/40", dim(active, i))} style={rise(i)}>
          <div className="flex items-center gap-2 rounded-t-2xl px-4 py-3 font-bold" style={{ background: `color-mix(in oklab, ${acc(i)} 14%, transparent)` }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: acc(i) }} aria-hidden />
            {c.title}
          </div>
          <ul className="space-y-2 p-4">
            {c.points.map((p, k) => (
              <li key={k} className="flex gap-2 text-[14px] leading-snug text-soft">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-fg/30" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Tree({ root, nodes, active }: { root: string; nodes: { label: string; children?: string[] }[]; active?: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-2xl bg-blue-fill px-5 py-2.5 text-center font-bold text-white shadow-[0_10px_30px_-12px_rgba(10,132,255,.8)]" style={rise(0)}>{root}</div>
      <span className="h-5 w-px bg-fg/20" aria-hidden />
      <div className="relative w-full">
        <span className="absolute left-[8%] right-[8%] top-0 hidden h-px bg-fg/20 md:block" aria-hidden />
        <ul className="grid gap-3 md:pt-5" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))` }}>
          {nodes.map((n, i) => (
            <li key={i} className={cn("relative flex flex-col items-center", dim(active, i))} style={rise(i + 1)}>
              <span className="absolute -top-5 hidden h-5 w-px bg-fg/20 md:block" aria-hidden />
              <div className="w-full rounded-xl border-2 px-3 py-2 text-center text-[14px] font-bold" style={{ borderColor: acc(i), background: `color-mix(in oklab, ${acc(i)} 10%, var(--color-card))` }}>
                {n.label}
              </div>
              {n.children && n.children.length > 0 && (
                <ul className="mt-2 w-full space-y-1 border-l-2 pl-3" style={{ borderColor: `color-mix(in oklab, ${acc(i)} 50%, transparent)` }}>
                  {n.children.map((c, k) => (
                    <li key={k} className="text-[13px] leading-snug text-soft">{c}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Sequence({ actors, messages, active }: { actors: string[]; messages: { from: number; to: number; label: string }[]; active?: number }) {
  const n = actors.length;
  const center = (i: number) => ((i + 0.5) / n) * 100;
  return (
    <div className="overflow-x-auto">
      <div className="relative min-w-[460px]">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {actors.map((a, i) => (
            <div key={i} className="mx-auto rounded-xl border-2 bg-card px-3 py-2 text-center text-[13px] font-bold" style={{ borderColor: acc(i) }}>
              {a}
            </div>
          ))}
        </div>
        <div className="relative mt-2 pb-2">
          {actors.map((_, i) => (
            <span key={i} className="absolute bottom-0 top-0 w-0 border-l-2 border-dashed border-fg/15" style={{ left: `${center(i)}%` }} aria-hidden />
          ))}
          <ol className="relative">
            {messages.map((m, i) => {
              const self = m.from === m.to;
              const left = Math.min(center(m.from), center(m.to));
              const width = Math.abs(center(m.to) - center(m.from));
              const rtl = m.to < m.from;
              return (
                <li key={i} className={cn("relative h-14", dim(active, i))} style={rise(i)}>
                  {self ? (
                    <div className="absolute top-3 flex items-center gap-2" style={{ left: `${center(m.from)}%` }}>
                      <span className="h-6 w-6 rounded-r-full border-2 border-l-0" style={{ borderColor: acc(m.from) }} aria-hidden />
                      <span className="whitespace-nowrap rounded-md bg-card px-1.5 text-[12px] font-semibold">
                        <b className="mr-1 text-quiet">{i + 1}</b>{m.label}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-2" style={{ left: `${left}%`, width: `${width}%` }}>
                      <div className="mx-2 truncate text-center text-[12px] font-semibold leading-tight" title={m.label}>
                        <b className="mr-1 text-quiet">{i + 1}</b>
                        {m.label}
                      </div>
                      <div className="relative mt-1 h-0.5" style={{ background: acc(m.from) }}>
                        <span
                          className={cn("absolute top-1/2 h-0 w-0 -translate-y-1/2 border-y-[5px] border-y-transparent", rtl ? "-left-0.5 border-r-[8px]" : "-right-0.5 border-l-[8px]")}
                          style={rtl ? { borderRightColor: acc(m.from) } : { borderLeftColor: acc(m.from) }}
                          aria-hidden
                        />
                      </div>
                    </div>
                  )}
                  <span className="sr-only">{`${actors[m.from]} to ${actors[m.to]}: ${m.label}`}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
