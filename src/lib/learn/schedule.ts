import { addDays, weekday, type ISODate } from "./dates";

const EPS = 1e-6;
/** Leftover capacity smaller than this rolls the next topic over to the next study day. */
const MIN_SLOT = 0.25;

/** Study hours for each weekday, index 0 = Sunday … 6 = Saturday. 0 = rest day. */
export type WeekHours = number[];

export function weekHoursFrom(hoursPerDay: number, studyDays: number[]): WeekHours {
  const set = new Set(studyDays);
  return Array.from({ length: 7 }, (_, d) => (set.has(d) ? hoursPerDay : 0));
}

export function normalizeWeek(w: unknown): WeekHours | null {
  if (!Array.isArray(w) || w.length !== 7) return null;
  const out = w.map((x) => {
    const n = Number(x);
    return Number.isFinite(n) && n > 0 ? Math.min(16, Math.round(n * 4) / 4) : 0;
  });
  return out.some((x) => x > 0) ? out : null;
}

export const studyDaysOf = (w: WeekHours) => w.flatMap((h, d) => (h > 0 ? [d] : []));
export const weeklyHours = (w: WeekHours) => w.reduce((s, h) => s + h, 0);
export const avgHours = (w: WeekHours) => {
  const d = studyDaysOf(w);
  return d.length ? Math.round((weeklyHours(w) / d.length) * 100) / 100 : 0;
};

export function nextStudyDay(from: ISODate, w: WeekHours): ISODate {
  if (!w.some((h) => h > 0)) throw new Error("Pick at least one study day");
  let d = from;
  while (!(w[weekday(d)] > 0)) d = addDays(d, 1);
  return d;
}

/**
 * Lays topics out back to back over study days, using each weekday's hours.
 * A topic longer than the time left in a day continues on the next study day.
 */
export function buildSchedule(hours: number[], start: ISODate, w: WeekHours): { start: ISODate; end: ISODate }[] {
  const out: { start: ISODate; end: ISODate }[] = [];
  let day = nextStudyDay(start, w);
  let capacity = w[weekday(day)];
  for (const h of hours) {
    let remaining = h;
    let first: ISODate | null = null;
    for (;;) {
      if (capacity < Math.min(MIN_SLOT, w[weekday(day)]) - EPS || capacity <= EPS) {
        day = nextStudyDay(addDays(day, 1), w);
        capacity = w[weekday(day)];
      }
      first ??= day;
      const take = Math.min(remaining, capacity);
      remaining -= take;
      capacity -= take;
      if (remaining <= EPS) break;
    }
    out.push({ start: first, end: day });
  }
  return out;
}

export function estimateEnd(totalHours: number, start: ISODate, w: WeekHours): ISODate {
  if (totalHours <= 0) return nextStudyDay(start, w);
  return buildSchedule([totalHours], start, w)[0].end;
}

export function countStudyDays(start: ISODate, end: ISODate, studyDays: number[]) {
  const set = new Set(studyDays);
  let n = 0;
  for (let d = start; d <= end; d = addDays(d, 1)) if (set.has(weekday(d))) n++;
  return n;
}

/** Hours per study day (rounded up to 15 minutes) needed to finish by `end`. */
export function hoursForDeadline(totalHours: number, start: ISODate, end: ISODate, studyDays: number[]) {
  const days = countStudyDays(start, end, studyDays);
  if (days === 0) return null;
  return Math.max(0.25, Math.ceil((totalHours / days) * 4) / 4);
}

/** Planned hours per calendar day for one item, spread over its window in proportion to each day's hours. */
export function spreadItem(hours: number, start: ISODate, end: ISODate, w: WeekHours, into: Map<ISODate, number>) {
  const days: [ISODate, number][] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) if (w[weekday(d)] > 0) days.push([d, w[weekday(d)]]);
  if (days.length === 0) days.push([start, 1]);
  const total = days.reduce((s, [, h]) => s + h, 0);
  for (const [d, h] of days) into.set(d, (into.get(d) ?? 0) + (hours * h) / total);
}

/**
 * Parses a pasted outline: "# Module" headings, then "Topic | hours" lines (bullets allowed).
 * Indented lines (2+ spaces or a tab) under a topic become its subtopics.
 */
export function parseCustomTopics(text: string) {
  const items: { module: string; title: string; hours: number; subtopics: string[] }[] = [];
  let module = "General";
  for (const raw of text.split("\n")) {
    if (!raw.trim()) continue;
    const indented = /^(\s{2,}|\t)/.test(raw);
    const line = raw.trim().replace(/^[-*•]\s+|^\d+[.)]\s+/, "").replace(/^\[[ x]\]\s*/i, "");
    if (!line) continue;
    if (line.startsWith("#")) {
      module = line.replace(/^#+\s*/, "").slice(0, 120) || "General";
      continue;
    }
    if (indented && items.length && items[items.length - 1].module === module) {
      const last = items[items.length - 1];
      if (last.subtopics.length < 30) last.subtopics.push(line.slice(0, 300));
      continue;
    }
    const [title, h] = line.split("|").map((s) => s.trim());
    const hours = Number.parseFloat(h ?? "");
    if (!title) continue;
    items.push({ module, title: title.slice(0, 200), hours: Number.isFinite(hours) && hours > 0 ? Math.min(hours, 200) : 1, subtopics: [] });
  }
  return items;
}
