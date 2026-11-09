import "server-only";
import { sql } from "./db";
import type { ISODate } from "./dates";

export type Plan = {
  id: string;
  path_slug: string | null;
  title: string;
  description: string | null;
  start_date: ISODate;
  hours_per_day: number;
  study_days: number[];
  status: "active" | "paused" | "completed";
  created_at: string;
  day_hours: number[] | null;
  notes: string | null;
};

export type Item = {
  id: string;
  plan_id: string;
  position: number;
  module_title: string;
  title: string;
  est_hours: number;
  topic_key: string | null;
  scheduled_start: ISODate;
  scheduled_end: ISODate;
  completed_on: ISODate | null;
  notes: string | null;
};

export type PlanSummary = Plan & {
  total_items: number;
  done_items: number;
  total_hours: number;
  done_hours: number;
  overdue: number;
  end_date: ISODate;
  next_title: string | null;
};

const PLAN_COLS = `p.id, p.path_slug, p.title, p.description, p.start_date::text AS start_date, p.hours_per_day::float8 AS hours_per_day,
  p.study_days::int[] AS study_days, p.status, p.created_at::text AS created_at, p.day_hours::float8[] AS day_hours, p.notes`;

export async function getPlanSummaries(userId: string, today: ISODate): Promise<PlanSummary[]> {
  return (await sql.query(
    `SELECT ${PLAN_COLS},
      count(i.id)::int AS total_items,
      count(i.completed_on)::int AS done_items,
      coalesce(sum(i.est_hours), 0)::float8 AS total_hours,
      coalesce(sum(i.est_hours) FILTER (WHERE i.completed_on IS NOT NULL), 0)::float8 AS done_hours,
      count(i.id) FILTER (WHERE i.completed_on IS NULL AND i.scheduled_end < $2::date)::int AS overdue,
      max(i.scheduled_end)::text AS end_date,
      (SELECT n.title FROM plan_items n WHERE n.plan_id = p.id AND n.completed_on IS NULL ORDER BY n.position LIMIT 1) AS next_title
    FROM plans p LEFT JOIN plan_items i ON i.plan_id = p.id
    WHERE p.user_id = $1
    GROUP BY p.id
    ORDER BY (p.status = 'active') DESC, p.created_at DESC`,
    [userId, today],
  )) as PlanSummary[];
}

export async function getPlan(
  userId: string,
  planId: string,
): Promise<{ plan: Plan; items: (Item & { subtopics: Subtopic[]; myLinks: UserLink[]; tracked_minutes: number })[] } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(planId)) return null;
  const plans = (await sql.query(`SELECT ${PLAN_COLS} FROM plans p WHERE p.id = $1 AND p.user_id = $2`, [planId, userId])) as Plan[];
  if (!plans[0]) return null;
  const items = (await sql.query(
    `SELECT id, plan_id, position, module_title, title, est_hours::float8 AS est_hours, topic_key,
      scheduled_start::text AS scheduled_start, scheduled_end::text AS scheduled_end, completed_on::text AS completed_on, notes
     FROM plan_items WHERE plan_id = $1 ORDER BY position`,
    [planId],
  )) as Item[];
  const [subs, links, tracked] = await Promise.all([
    sql.query(
      `SELECT s.id, s.item_id, s.title, s.done_on::text AS done_on, s.est_minutes,
         coalesce((SELECT sum(l.minutes) FROM study_logs l WHERE l.subtopic_id = s.id), 0)::int AS tracked
       FROM plan_subtopics s JOIN plan_items i ON i.id = s.item_id
       WHERE i.plan_id = $1 ORDER BY s.item_id, s.position, s.created_at`,
      [planId],
    ).then((r) => r as (Subtopic & { item_id: string })[]),
    sql.query(
      `SELECT l.id, l.item_id, l.label, l.url, l.kind FROM plan_links l JOIN plan_items i ON i.id = l.item_id
       WHERE i.plan_id = $1 ORDER BY l.created_at`,
      [planId],
    ).then((r) => r as (UserLink & { item_id: string })[]),
    sql.query(`SELECT item_id, sum(minutes)::int AS minutes FROM study_logs WHERE plan_id = $1 AND item_id IS NOT NULL GROUP BY item_id`, [planId]).then(
      (r) => new Map((r as { item_id: string; minutes: number }[]).map((x) => [x.item_id, x.minutes])),
    ),
  ]);
  const byItem = <T extends { item_id: string }>(rows: T[]) => {
    const m = new Map<string, Omit<T, "item_id">[]>();
    for (const { item_id, ...rest } of rows) m.set(item_id, [...(m.get(item_id) ?? []), rest]);
    return m;
  };
  const sm = byItem(subs);
  const lm = byItem(links);
  return {
    plan: plans[0],
    items: items.map((i) => ({ ...i, subtopics: sm.get(i.id) ?? [], myLinks: lm.get(i.id) ?? [], tracked_minutes: tracked.get(i.id) ?? 0 })),
  };
}

export type Subtopic = { id: string; title: string; done_on: ISODate | null; est_minutes: number | null; tracked: number };

export type ActiveTimer = {
  plan_id: string;
  plan_title: string;
  item_id: string;
  item_title: string;
  subtopic_id: string | null;
  subtopic_title: string | null;
  started_ms: number;
};

/** The running timer plus the tours this user has finished, in one round trip (used by the Learn layout). */
export async function getLayoutState(userId: string): Promise<{ timer: ActiveTimer | null; tours: string[] }> {
  const rows = (await sql.query(
    `SELECT u.tours_done AS tours, t.plan_id, p.title AS plan_title, t.item_id, i.title AS item_title, t.subtopic_id, s.title AS subtopic_title,
       (extract(epoch FROM t.started_at) * 1000)::float8 AS started_ms
     FROM users u
     LEFT JOIN active_timers t ON t.user_id = u.id
     LEFT JOIN plans p ON p.id = t.plan_id
     LEFT JOIN plan_items i ON i.id = t.item_id
     LEFT JOIN plan_subtopics s ON s.id = t.subtopic_id
     WHERE u.id = $1`,
    [userId],
  )) as (ActiveTimer & { tours: string[] | null })[];
  const r = rows[0];
  if (!r) return { timer: null, tours: [] };
  const { tours, ...t } = r;
  return { timer: t.item_id ? t : null, tours: tours ?? [] };
}
export type UserLink = { id: string; label: string; url: string; kind: string };

export type DueItem = Item & {
  plan_title: string;
  path_slug: string | null;
  next_sub_id: string | null;
  next_sub_title: string | null;
  next_sub_minutes: number | null;
  subs_done: number;
  subs_total: number;
};

const DUE_EXTRA = `,
  (SELECT s.id FROM plan_subtopics s WHERE s.item_id = i.id AND s.done_on IS NULL ORDER BY s.position, s.created_at LIMIT 1) AS next_sub_id,
  (SELECT s.title FROM plan_subtopics s WHERE s.item_id = i.id AND s.done_on IS NULL ORDER BY s.position, s.created_at LIMIT 1) AS next_sub_title,
  (SELECT s.est_minutes FROM plan_subtopics s WHERE s.item_id = i.id AND s.done_on IS NULL ORDER BY s.position, s.created_at LIMIT 1) AS next_sub_minutes,
  (SELECT count(*) FROM plan_subtopics s WHERE s.item_id = i.id AND s.done_on IS NOT NULL)::int AS subs_done,
  (SELECT count(*) FROM plan_subtopics s WHERE s.item_id = i.id)::int AS subs_total`;

/** Unfinished topics in active plans that are scheduled to have started by `today`. */
export async function getDueItems(userId: string, today: ISODate): Promise<DueItem[]> {
  return (await sql.query(
    `SELECT i.id, i.plan_id, i.position, i.module_title, i.title, i.est_hours::float8 AS est_hours, i.topic_key,
      i.scheduled_start::text AS scheduled_start, i.scheduled_end::text AS scheduled_end, i.completed_on::text AS completed_on, i.notes,
      p.title AS plan_title, p.path_slug ${DUE_EXTRA}
     FROM plan_items i JOIN plans p ON p.id = i.plan_id
     WHERE p.user_id = $1 AND p.status = 'active' AND i.completed_on IS NULL AND i.scheduled_start <= $2::date
     ORDER BY i.scheduled_end, p.created_at, i.position
     LIMIT 20`,
    [userId, today],
  )) as DueItem[];
}

export type ActivityDay = { date: ISODate; minutes: number; completed: number };

export async function getActivity(userId: string, from: ISODate, planId?: string): Promise<ActivityDay[]> {
  const rows = (await sql.query(
    `WITH l AS (
       SELECT log_date AS d, sum(minutes)::int AS minutes FROM study_logs
       WHERE user_id = $1 AND log_date >= $2::date AND ($3::uuid IS NULL OR plan_id = $3::uuid) GROUP BY log_date
     ), c AS (
       SELECT i.completed_on AS d, count(*)::int AS completed FROM plan_items i JOIN plans p ON p.id = i.plan_id
       WHERE p.user_id = $1 AND i.completed_on >= $2::date AND ($3::uuid IS NULL OR p.id = $3::uuid) GROUP BY i.completed_on
     )
     SELECT coalesce(l.d, c.d)::text AS date, coalesce(l.minutes, 0) AS minutes, coalesce(c.completed, 0) AS completed
     FROM l FULL JOIN c ON c.d = l.d ORDER BY 1`,
    [userId, from, planId ?? null],
  )) as ActivityDay[];
  return rows;
}

export type StudyLog = { id: string; log_date: ISODate; minutes: number; note: string | null; item_title: string | null; plan_title: string | null };

export async function getRecentLogs(userId: string, planId?: string, limit = 8): Promise<StudyLog[]> {
  return (await sql.query(
    `SELECT l.id, l.log_date::text AS log_date, l.minutes, l.note, i.title AS item_title, p.title AS plan_title
     FROM study_logs l LEFT JOIN plan_items i ON i.id = l.item_id LEFT JOIN plans p ON p.id = l.plan_id
     WHERE l.user_id = $1 AND ($2::uuid IS NULL OR l.plan_id = $2::uuid)
     ORDER BY l.log_date DESC, l.created_at DESC LIMIT $3`,
    [userId, planId ?? null, limit],
  )) as StudyLog[];
}

export async function getTotals(userId: string) {
  const [r] = (await sql.query(
    `SELECT (SELECT coalesce(sum(minutes),0)::int FROM study_logs WHERE user_id = $1) AS minutes,
            (SELECT count(*)::int FROM plan_items i JOIN plans p ON p.id = i.plan_id WHERE p.user_id = $1 AND i.completed_on IS NOT NULL) AS completed`,
    [userId],
  )) as { minutes: number; completed: number }[];
  return r;
}

/** Next unfinished topics in active plans, for days with nothing due. */
export async function getUpcomingItems(userId: string, limit = 4): Promise<DueItem[]> {
  return (await sql.query(
    `SELECT i.id, i.plan_id, i.position, i.module_title, i.title, i.est_hours::float8 AS est_hours, i.topic_key,
      i.scheduled_start::text AS scheduled_start, i.scheduled_end::text AS scheduled_end, i.completed_on::text AS completed_on, i.notes,
      p.title AS plan_title, p.path_slug ${DUE_EXTRA}
     FROM plan_items i JOIN plans p ON p.id = i.plan_id
     WHERE p.user_id = $1 AND p.status = 'active' AND i.completed_on IS NULL
     ORDER BY i.scheduled_start, p.created_at, i.position
     LIMIT $2`,
    [userId, limit],
  )) as DueItem[];
}
