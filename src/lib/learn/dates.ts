/** Date-only helpers. Every calendar date is a "YYYY-MM-DD" string; math is done in UTC to avoid DST drift. */

export type ISODate = string;

const toUTC = (d: ISODate) => new Date(`${d}T00:00:00Z`);
const fromUTC = (d: Date): ISODate => d.toISOString().slice(0, 10);

export function addDays(d: ISODate, n: number): ISODate {
  const x = toUTC(d);
  x.setUTCDate(x.getUTCDate() + n);
  return fromUTC(x);
}

/** 0 = Sunday ... 6 = Saturday */
export const weekday = (d: ISODate) => toUTC(d).getUTCDay();

export const diffDays = (a: ISODate, b: ISODate) => Math.round((toUTC(b).getTime() - toUTC(a).getTime()) / 86_400_000);

export function todayIn(timeZone: string): ISODate {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  } catch {
    return fromUTC(new Date());
  }
}

export function isValidTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Monday of the week containing d. */
export function weekStart(d: ISODate): ISODate {
  return addDays(d, -((weekday(d) + 6) % 7));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type FmtOpts = { weekday?: "short" | "long"; day?: "numeric"; month?: "short" | "long"; year?: "numeric" };

/**
 * en-GB style date ("Sun, 8 Nov 2026") without Intl, so server (Node) and browser always produce
 * identical text; their locale data differs (e.g. "Sep" vs "Sept"), which breaks hydration.
 */
export function fmtDate(d: ISODate, opts: FmtOpts = { day: "numeric", month: "short" }) {
  const x = toUTC(d);
  const parts: string[] = [];
  if (opts.day) parts.push(String(x.getUTCDate()));
  if (opts.month) parts.push(opts.month === "long" ? MONTHS_LONG[x.getUTCMonth()] : MONTHS[x.getUTCMonth()]);
  if (opts.year) parts.push(String(x.getUTCFullYear()));
  const date = parts.join(" ");
  if (!opts.weekday) return date;
  const wd = opts.weekday === "long" ? DAYS_LONG[x.getUTCDay()] : DAY_LABELS[x.getUTCDay()];
  return date ? `${wd}, ${date}` : wd;
}

export function fmtLong(d: ISODate) {
  return fmtDate(d, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function relDay(d: ISODate, today: ISODate) {
  const n = diffDays(today, d);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n === -1) return "Yesterday";
  if (n < 0) return `${-n} days ago`;
  if (n < 7) return fmtDate(d, { weekday: "long" });
  return fmtDate(d);
}

export const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(toUTC(s).getTime()) && fromUTC(toUTC(s)) === s;

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
