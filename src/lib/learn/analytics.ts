import { addDays, type ISODate } from "./dates";
import { estimateEnd, normalizeWeek, spreadItem, weekHoursFrom, type WeekHours } from "./schedule";

type PlanLike = { start_date: ISODate; hours_per_day: number; study_days: number[]; day_hours?: number[] | null; status: string };

export const planWeek = (p: PlanLike): WeekHours => normalizeWeek(p.day_hours) ?? weekHoursFrom(p.hours_per_day, p.study_days);
type ItemLike = { est_hours: number; scheduled_start: ISODate; scheduled_end: ISODate; completed_on: ISODate | null };

export type PlanStatus = "completed" | "paused" | "not-started" | "ahead" | "on-track" | "behind";

export type BurnPoint = { date: ISODate; planned: number; actual: number | null };

export function planStats(plan: PlanLike, items: ItemLike[], today: ISODate) {
  const total = items.length;
  const done = items.filter((i) => i.completed_on).length;
  const totalHours = items.reduce((s, i) => s + i.est_hours, 0);
  const doneHours = items.reduce((s, i) => s + (i.completed_on ? i.est_hours : 0), 0);
  const overdue = items.filter((i) => !i.completed_on && i.scheduled_end < today).length;
  const plannedEnd = items.reduce((m, i) => (i.scheduled_end > m ? i.scheduled_end : m), plan.start_date);

  const week = planWeek(plan);
  const plannedByDay = new Map<ISODate, number>();
  for (const i of items) spreadItem(i.est_hours, i.scheduled_start, i.scheduled_end, week, plannedByDay);
  const actualByDay = new Map<ISODate, number>();
  for (const i of items) if (i.completed_on) actualByDay.set(i.completed_on, (actualByDay.get(i.completed_on) ?? 0) + i.est_hours);

  const firstDone = items.reduce<ISODate | null>((m, i) => (i.completed_on && (!m || i.completed_on < m) ? i.completed_on : m), null);
  const from = firstDone && firstDone < plan.start_date ? firstDone : plan.start_date;
  const to = plannedEnd > today ? plannedEnd : today;
  const series: BurnPoint[] = [];
  let p = 0;
  let a = 0;
  let expectedHours = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) {
    p += plannedByDay.get(d) ?? 0;
    a += actualByDay.get(d) ?? 0;
    if (d <= today) expectedHours = p;
    series.push({ date: d, planned: round(p), actual: d <= today ? round(a) : null });
  }

  const remainingHours = totalHours - doneHours;
  const projectedEnd =
    remainingHours > 0 && week.some((h) => h > 0)
      ? estimateEnd(remainingHours, today > plan.start_date ? today : plan.start_date, week)
      : plannedEnd;

  let status: PlanStatus;
  if (total > 0 && done === total) status = "completed";
  else if (plan.status === "paused") status = "paused";
  else if (today < plan.start_date && done === 0) status = "not-started";
  else if (overdue > 0) status = "behind";
  else if (doneHours > expectedHours + 0.5) status = "ahead";
  else status = "on-track";

  return {
    total,
    done,
    totalHours: round(totalHours),
    doneHours: round(doneHours),
    pct: total ? Math.round((doneHours / totalHours) * 100) : 0,
    overdue,
    expectedHours: round(expectedHours),
    plannedEnd,
    projectedEnd,
    status,
    series,
  };
}

export function streak(activeDays: Set<ISODate>, today: ISODate) {
  let d = activeDays.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (activeDays.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function longestStreak(days: ISODate[]) {
  const sorted = [...days].sort();
  let best = 0;
  let cur = 0;
  let prev: ISODate | null = null;
  for (const d of sorted) {
    cur = prev && addDays(prev, 1) === d ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return best;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function fmtHours(h: number) {
  if (h < 1) return `${Math.round(h * 60)}m`;
  const whole = Math.floor(h);
  const m = Math.round((h - whole) * 60);
  return m ? `${whole}h ${m}m` : `${whole}h`;
}
