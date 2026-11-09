"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, diffDays, fmtDate, fmtLong, weekStart, weekday, type ISODate } from "@/lib/learn/dates";
import { fmtHours } from "@/lib/learn/analytics";

/* Validated palette (dark surface #080E1C): actual = brand blue, planned = amber. */
const C_ACTUAL = "#0A84FF";
const C_PLANNED = "#C97A10";
const GRID = "var(--chart-grid)";
const AXIS_TEXT = "var(--chart-axis)";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

function Tooltip({ x, y, w, children }: { x: number; y: number; w: number; children: React.ReactNode }) {
  const left = Math.min(Math.max(x + 12, 0), w - 190);
  return (
    <div
      className="pointer-events-none absolute z-10 w-[178px] rounded-xl border border-fg/15 bg-card/95 px-3 py-2.5 text-xs shadow-xl backdrop-blur"
      style={{ left: x + 200 > w ? x - 190 : left, top: y }}
      role="status"
    >
      {children}
    </div>
  );
}

/* ---------------- Burn-up: planned vs actual cumulative hours ---------------- */

export function BurnUpChart({ series, today, total }: { series: { date: ISODate; planned: number; actual: number | null }[]; today: ISODate; total: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = 260;
  const m = { l: 40, r: 56, t: 16, b: 28 };
  const iw = Math.max(0, width - m.l - m.r);
  const ih = H - m.t - m.b;
  const n = series.length;
  const yMax = niceMax(Math.max(total, ...series.map((s) => s.planned)));
  const x = (i: number) => m.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => m.t + ih - (v / yMax) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);

  const plannedPath = series.map((s, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(s.planned).toFixed(1)}`).join("");
  const actualPts = series.map((s, i) => [i, s.actual] as const).filter(([, a]) => a !== null) as [number, number][];
  const actualPath = actualPts.map(([i, a], k) => `${k ? "L" : "M"}${x(i).toFixed(1)},${y(a).toFixed(1)}`).join("");
  const actualArea = actualPts.length ? `${actualPath}L${x(actualPts[actualPts.length - 1][0])},${y(0)}L${x(actualPts[0][0])},${y(0)}Z` : "";
  const todayIdx = series.findIndex((s) => s.date === today);
  const xTickIdx = n <= 1 ? [0] : Array.from(new Set([0, Math.round((n - 1) / 4), Math.round((n - 1) / 2), Math.round((3 * (n - 1)) / 4), n - 1]));
  const lastActual = actualPts[actualPts.length - 1];
  const lastPlanned = series[n - 1];

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    setHover(Math.round(Math.min(1, Math.max(0, px / iw)) * (n - 1)));
  };
  const h = hover !== null ? series[hover] : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted" aria-hidden>
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 rounded" style={{ background: C_PLANNED }} />Planned (cumulative hours)</span>
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 rounded" style={{ background: C_ACTUAL }} />Actual (hours of topics done)</span>
      </div>
      <div ref={ref} className="relative w-full" style={{ height: H }}>
        {width > 0 && n > 0 && (
          <svg width={width} height={H} role="img" aria-label={`Burn-up chart. Planned ${lastPlanned.planned} hours by ${fmtDate(lastPlanned.date)}; ${lastActual ? lastActual[1] : 0} hours completed so far.`}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={m.l} x2={m.l + iw} y1={y(t)} y2={y(t)} style={{ stroke: GRID }} />
                <text x={m.l - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" style={{ fill: AXIS_TEXT }}>{Math.round(t)}h</text>
              </g>
            ))}
            {xTickIdx.map((i) => (
              <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontSize="11" style={{ fill: AXIS_TEXT }}>
                {fmtDate(series[i].date)}
              </text>
            ))}
            {todayIdx >= 0 && (
              <g>
                <line x1={x(todayIdx)} x2={x(todayIdx)} y1={m.t} y2={m.t + ih} style={{ stroke: "var(--chart-axis)" }} />
                <text x={x(todayIdx)} y={m.t - 4} textAnchor="middle" fontSize="11" style={{ fill: AXIS_TEXT }}>Today</text>
              </g>
            )}
            <path d={actualArea} fill={C_ACTUAL} opacity={0.1} />
            <path d={plannedPath} fill="none" stroke={C_PLANNED} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            <path d={actualPath} fill="none" stroke={C_ACTUAL} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {/* End labels */}
            <circle cx={x(n - 1)} cy={y(lastPlanned.planned)} r={4} fill={C_PLANNED} style={{ stroke: "var(--color-card)" }} strokeWidth={2} />
            <text x={x(n - 1) + 8} y={y(lastPlanned.planned)} dy="0.32em" fontSize="11" style={{ fill: "var(--color-muted)" }}>{Math.round(lastPlanned.planned)}h</text>
            {lastActual && (
              <>
                <circle cx={x(lastActual[0])} cy={y(lastActual[1])} r={4} fill={C_ACTUAL} style={{ stroke: "var(--color-card)" }} strokeWidth={2} />
                {lastActual[0] !== n - 1 || Math.abs(y(lastActual[1]) - y(lastPlanned.planned)) > 14 ? (
                  <text x={x(lastActual[0]) + 8} y={y(lastActual[1])} dy="0.32em" fontSize="11" style={{ fill: "var(--color-fg)" }} fontWeight={700}>
                    {fmtHours(lastActual[1])}
                  </text>
                ) : null}
              </>
            )}
            {hover !== null && h && (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={m.t + ih} style={{ stroke: "var(--chart-axis)" }} />
                <circle cx={x(hover)} cy={y(h.planned)} r={4} fill={C_PLANNED} style={{ stroke: "var(--color-card)" }} strokeWidth={2} />
                {h.actual !== null && <circle cx={x(hover)} cy={y(h.actual)} r={4} fill={C_ACTUAL} style={{ stroke: "var(--color-card)" }} strokeWidth={2} />}
              </g>
            )}
            <rect x={m.l} y={m.t} width={iw} height={ih} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
          </svg>
        )}
        {hover !== null && h && (
          <Tooltip x={x(hover)} y={8} w={width}>
            <div className="font-bold text-fg">{fmtLong(h.date)}</div>
            <div className="mt-1.5 flex items-center justify-between gap-2 text-muted">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: C_PLANNED }} />Planned</span>
              <b className="text-fg">{fmtHours(h.planned)}</b>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2 text-muted">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: C_ACTUAL }} />Actual</span>
              <b className="text-fg">{h.actual === null ? "-" : fmtHours(h.actual)}</b>
            </div>
          </Tooltip>
        )}
      </div>
      <details className="mt-3 text-xs text-quiet">
        <summary className="cursor-pointer hover:text-fg">View as table</summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-fg/10">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-card text-muted">
              <tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Planned</th><th className="px-3 py-2">Actual</th></tr>
            </thead>
            <tbody>
              {series
                .filter((s, i) => weekday(s.date) === 1 || i === 0 || i === n - 1)
                .map((s) => (
                  <tr key={s.date} className="border-t border-fg/[.06]">
                    <td className="px-3 py-1.5">{fmtDate(s.date)}</td>
                    <td className="px-3 py-1.5">{fmtHours(s.planned)}</td>
                    <td className="px-3 py-1.5">{s.actual === null ? "-" : fmtHours(s.actual)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

/* ---------------- Activity heatmap ---------------- */

const HEAT = ["var(--heat-0)", "var(--heat-1)", "var(--heat-2)", "var(--heat-3)", "var(--heat-4)"];

export function Heatmap({ data, today, weeks = 26 }: { data: { date: ISODate; minutes: number; completed: number }[]; today: ISODate; weeks?: number }) {
  const map = useMemo(() => new Map(data.map((d) => [d.date, d])), [data]);
  const [hover, setHover] = useState<{ d: ISODate; x: number; y: number } | null>(null);
  const start = addDays(weekStart(today), -(weeks - 1) * 7);
  const cell = 13;
  const gap = 3;
  const level = (d?: { minutes: number; completed: number }) => {
    if (!d) return 0;
    const score = d.minutes + d.completed * 30;
    return score === 0 ? 0 : score <= 30 ? 1 : score <= 60 ? 2 : score <= 120 ? 3 : 4;
  };
  const cols = Array.from({ length: weeks }, (_, w) => Array.from({ length: 7 }, (_, r) => addDays(start, w * 7 + r)));
  const W = 28 + weeks * (cell + gap);
  const Hh = 18 + 7 * (cell + gap);
  const hd = hover ? map.get(hover.d) : undefined;
  const activeDays = data.filter((d) => d.minutes > 0 || d.completed > 0).length;

  return (
    <div>
      <div className="relative overflow-x-auto pb-1">
        <svg width={W} height={Hh} role="img" aria-label={`Study activity heatmap for the last ${weeks} weeks. Active on ${activeDays} days.`} className="block">
          {cols.map((col, w) => {
            const first = col[0];
            const showMonth = w === 0 || first.slice(5, 7) !== addDays(first, -7).slice(5, 7);
            return showMonth ? (
              <text key={`m${w}`} x={28 + w * (cell + gap)} y={10} fontSize="11" style={{ fill: AXIS_TEXT }}>
                {fmtDate(first, { month: "short" })}
              </text>
            ) : null;
          })}
          {["Mon", "Wed", "Fri"].map((l, i) => (
            <text key={l} x={0} y={18 + (i * 2) * (cell + gap) + cell - 3} fontSize="11" style={{ fill: AXIS_TEXT }}>{l}</text>
          ))}
          {cols.map((col, w) =>
            col.map((d, r) => {
              if (d > today) return null;
              const lv = level(map.get(d));
              const cx = 28 + w * (cell + gap);
              const cy = 18 + r * (cell + gap);
              return (
                <rect
                  key={d}
                  x={cx}
                  y={cy}
                  width={cell}
                  height={cell}
                  rx={3}
                  style={{ fill: HEAT[lv], stroke: d === today ? "var(--color-fg)" : "none", strokeWidth: d === today ? 1 : 0 }}
                  onPointerEnter={() => setHover({ d, x: cx, y: cy })}
                  onPointerLeave={() => setHover(null)}
                />
              );
            }),
          )}
        </svg>
        {hover && (
          <div
            className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-fg/15 bg-card/95 px-2.5 py-1.5 text-xs shadow-xl"
            style={{ left: Math.min(hover.x - 40, W - 170), top: hover.y + cell + 6 }}
            role="status"
          >
            <b className="text-fg">{fmtLong(hover.d)}</b>
            <div className="text-muted">
              {hd?.minutes ? `${fmtHours(hd.minutes / 60)} studied` : "No time logged"}
              {hd?.completed ? ` · ${hd.completed} topic${hd.completed > 1 ? "s" : ""} done` : ""}
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-quiet" aria-hidden>
        Less {HEAT.map((c) => <span key={c} className="h-3 w-3 rounded-[3px]" style={{ background: c }} />)} More
      </div>
    </div>
  );
}

/* ---------------- Weekly study hours (single series) ---------------- */

export function WeeklyBars({ data, today, weeks = 12 }: { data: { date: ISODate; minutes: number }[]; today: ISODate; weeks?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const first = addDays(weekStart(today), -(weeks - 1) * 7);
  const buckets = Array.from({ length: weeks }, (_, i) => ({ start: addDays(first, i * 7), minutes: 0 }));
  for (const d of data) {
    const i = Math.floor(diffDays(first, d.date) / 7);
    if (i >= 0 && i < weeks) buckets[i].minutes += d.minutes;
  }
  const H = 180;
  const m = { l: 34, r: 8, t: 18, b: 24 };
  const iw = Math.max(0, width - m.l - m.r);
  const ih = H - m.t - m.b;
  const max = niceMax(Math.max(1, ...buckets.map((b) => b.minutes / 60)));
  const band = iw / weeks;
  const bw = Math.min(24, band - 2);
  const y = (h: number) => m.t + ih - (h / max) * ih;
  const cur = buckets[weeks - 1];

  return (
    <div ref={ref} className="relative w-full" style={{ height: H }}>
      {width > 0 && (
        <svg width={width} height={H} role="img" aria-label={`Hours studied per week for the last ${weeks} weeks. This week: ${fmtHours(cur.minutes / 60)}.`}>
          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line x1={m.l} x2={m.l + iw} y1={y(f * max)} y2={y(f * max)} style={{ stroke: GRID }} />
              <text x={m.l - 6} y={y(f * max)} dy="0.32em" textAnchor="end" fontSize="11" style={{ fill: AXIS_TEXT }}>{+(f * max).toFixed(1)}h</text>
            </g>
          ))}
          {buckets.map((b, i) => {
            const h = b.minutes / 60;
            const bx = m.l + i * band + (band - bw) / 2;
            const top = y(h);
            const r = Math.min(4, (y(0) - top) / 2);
            const d = h > 0 ? `M${bx},${y(0)}V${top + r}Q${bx},${top} ${bx + r},${top}H${bx + bw - r}Q${bx + bw},${top} ${bx + bw},${top + r}V${y(0)}Z` : "";
            return (
              <g key={b.start} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                <rect x={m.l + i * band} y={m.t} width={band} height={ih} fill="transparent" />
                {d && <path d={d} fill={C_ACTUAL} opacity={hover === null || hover === i ? 1 : 0.55} />}
                {(i === weeks - 1 || (i % 3 === 0 && weeks > 6)) && (
                  <text x={m.l + i * band + band / 2} y={H - 6} textAnchor="middle" fontSize="11" style={{ fill: AXIS_TEXT }}>
                    {i === weeks - 1 ? "This wk" : fmtDate(b.start)}
                  </text>
                )}
              </g>
            );
          })}
          {cur.minutes > 0 && (
            <text x={m.l + (weeks - 1) * band + band / 2} y={y(cur.minutes / 60) - 6} textAnchor="middle" fontSize="11" fontWeight={700} style={{ fill: "var(--color-fg)" }}>
              {fmtHours(cur.minutes / 60)}
            </text>
          )}
        </svg>
      )}
      {hover !== null && (
        <Tooltip x={m.l + hover * band + band / 2} y={0} w={width}>
          <div className="font-bold text-fg">Week of {fmtDate(buckets[hover].start)}</div>
          <div className="mt-1 text-muted">{buckets[hover].minutes ? `${fmtHours(buckets[hover].minutes / 60)} studied` : "No time logged"}</div>
        </Tooltip>
      )}
    </div>
  );
}
