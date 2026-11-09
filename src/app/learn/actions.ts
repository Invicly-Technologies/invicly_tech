"use server";

import bcrypt from "bcryptjs";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, getUser, requireUser } from "@/lib/learn/auth";
import { sql } from "@/lib/learn/db";
import { isISODate, isValidTimeZone, todayIn, addDays } from "@/lib/learn/dates";
import { buildSchedule, hoursForDeadline, normalizeWeek, studyDaysOf, avgHours, weekHoursFrom, type WeekHours } from "@/lib/learn/schedule";
import { flattenTree } from "@/lib/learn/tree";
import { sendCodeEmail } from "@/lib/learn/mail";
import { LINK_KINDS, defaultLabel, detectKind, normalizeUrl } from "@/lib/learn/links";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DUMMY_HASH = "$2b$10$Chfv1MS202VQnJZ62Kp2xO2ntfHm/nQW4Mn7Z11ydENpXl1wsK3RO";
const CODE_TTL_MIN = 15;
const RESEND_COOLDOWN_S = 60;
const MAX_ATTEMPTS = 5;

export type FormState = { error?: string; ok?: string } | undefined;

const safeNext = (n: unknown) => (typeof n === "string" && /^\/learn\/[\w\-/?=&%.]*$/.test(n) ? n : "/learn/dashboard/");
const qs = (o: Record<string, string | undefined>) =>
  Object.entries(o)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join("&");

type UserRow = { id: string; name: string; email: string; password_hash: string; timezone: string; email_verified_at: string | null };

async function findUser(email: string) {
  const rows = (await sql.query(
    `SELECT id, name, email::text AS email, password_hash, timezone, email_verified_at::text AS email_verified_at FROM users WHERE email = $1`,
    [email.trim().toLowerCase()],
  )) as UserRow[];
  return rows[0] ?? null;
}

/* ---------------- One-time codes ---------------- */

function hashCode(userId: string, code: string) {
  return createHmac("sha256", process.env.LEARN_AUTH_SECRET ?? "dev").update(`${userId}:${code}`).digest("hex");
}

/** Creates and emails a new code unless one was sent in the last minute. Returns an error message when throttled. */
async function issueCode(u: { id: string; name: string; email: string }, purpose: "verify" | "reset"): Promise<string | null> {
  const recent = (await sql.query(
    `SELECT extract(epoch FROM now() - created_at)::int AS age FROM auth_codes WHERE user_id = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1`,
    [u.id, purpose],
  )) as { age: number }[];
  if (recent[0] && recent[0].age < RESEND_COOLDOWN_S) return `Please wait ${RESEND_COOLDOWN_S - recent[0].age}s before requesting another code.`;
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await sql.transaction([
    sql.query(`UPDATE auth_codes SET used_at = now() WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL`, [u.id, purpose]),
    sql.query(`INSERT INTO auth_codes (user_id, purpose, code_hash, expires_at) VALUES ($1, $2, $3, now() + make_interval(mins => $4))`, [
      u.id,
      purpose,
      hashCode(u.id, code),
      CODE_TTL_MIN,
    ]),
  ]);
  try {
    await sendCodeEmail(u.email, u.name, code, purpose);
  } catch (e) {
    console.error("[learn mail] send failed", e);
    return "We could not send the email right now. Please try again in a minute.";
  }
  return null;
}

/** Checks a code; on success marks it used. */
async function consumeCode(userId: string, purpose: "verify" | "reset", code: string): Promise<string | null> {
  const rows = (await sql.query(
    `SELECT id, code_hash, attempts, (expires_at < now()) AS expired FROM auth_codes
     WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL ORDER BY created_at DESC LIMIT 1`,
    [userId, purpose],
  )) as { id: string; code_hash: string; attempts: number; expired: boolean }[];
  const c = rows[0];
  if (!c) return "That code is no longer valid. Request a new one.";
  if (c.expired) return "That code has expired. Request a new one.";
  if (c.attempts >= MAX_ATTEMPTS) return "Too many attempts. Request a new code.";
  const a = Buffer.from(c.code_hash, "hex");
  const b = Buffer.from(hashCode(userId, code), "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    await sql.query(`UPDATE auth_codes SET attempts = attempts + 1 WHERE id = $1`, [c.id]);
    const left = MAX_ATTEMPTS - c.attempts - 1;
    return left > 0 ? `That code is not right. ${left} attempt${left === 1 ? "" : "s"} left.` : "Too many attempts. Request a new code.";
  }
  await sql.query(`UPDATE auth_codes SET used_at = now() WHERE id = $1`, [c.id]);
  return null;
}

/* ---------------- Auth ---------------- */

const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80),
  email: z.email("Enter a valid email").max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  tz: z.string().max(64),
});

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form" };
  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  const tz = isValidTimeZone(parsed.data.tz) ? parsed.data.tz : "Asia/Kolkata";
  const hash = await bcrypt.hash(password, 10);

  const existing = await findUser(email);
  let user: { id: string; name: string; email: string };
  if (existing?.email_verified_at) return { error: "An account with this email already exists. Log in instead." };
  if (existing) {
    // Never verified, so nobody has proven they own it yet: take over the pending sign-up.
    await sql.query(`UPDATE users SET name = $2, password_hash = $3, timezone = $4 WHERE id = $1`, [existing.id, name, hash, tz]);
    user = { id: existing.id, name, email };
  } else {
    const rows = (await sql.query(`INSERT INTO users (email, name, password_hash, timezone) VALUES ($1, $2, $3, $4) RETURNING id`, [
      email,
      name,
      hash,
      tz,
    ])) as { id: string }[];
    user = { id: rows[0].id, name, email };
  }
  const err = await issueCode(user, "verify");
  if (err && !err.startsWith("Please wait")) return { error: err };
  redirect(`/learn/verify/?${qs({ email, next: fd.get("next") ? String(fd.get("next")) : undefined })}`);
}

export async function verifyEmail(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "");
  const code = String(fd.get("code") ?? "").replace(/\D/g, "");
  if (code.length !== 6) return { error: "Enter the 6-digit code from the email" };
  const u = await findUser(email);
  if (!u) return { error: "That code is no longer valid. Request a new one." };
  if (!u.email_verified_at) {
    const err = await consumeCode(u.id, "verify", code);
    if (err) return { error: err };
    await sql.query(`UPDATE users SET email_verified_at = now() WHERE id = $1`, [u.id]);
  }
  await createSession({ id: u.id, name: u.name, email: u.email, tz: u.timezone });
  redirect(safeNext(fd.get("next")));
}

export async function resendCode(email: string, purpose: "verify" | "reset"): Promise<FormState> {
  const u = await findUser(email);
  // Same answer whether or not the account exists.
  if (!u || (purpose === "verify" && u.email_verified_at)) return { ok: "If that account needs a code, we sent a new one." };
  const err = await issueCode(u, purpose);
  return err ? { error: err } : { ok: "New code sent. Check your inbox (and spam)." };
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password" };
  const u = await findUser(email);
  // Compare against a dummy hash when the user is missing so timing does not reveal which emails exist.
  const ok = await bcrypt.compare(password, u?.password_hash ?? DUMMY_HASH);
  if (!u || !ok) return { error: "Email or password is incorrect" };
  const tz = String(fd.get("tz") ?? "");
  const timezone = isValidTimeZone(tz) ? tz : u.timezone;
  if (timezone !== u.timezone) await sql.query(`UPDATE users SET timezone = $1 WHERE id = $2`, [timezone, u.id]);
  if (!u.email_verified_at) {
    await issueCode(u, "verify");
    redirect(`/learn/verify/?${qs({ email, next: fd.get("next") ? String(fd.get("next")) : undefined, sent: "login" })}`);
  }
  await createSession({ id: u.id, name: u.name, email: u.email, tz: timezone });
  redirect(safeNext(fd.get("next")));
}

export async function forgotPassword(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!z.email().safeParse(email).success) return { error: "Enter a valid email" };
  const u = await findUser(email);
  if (u) {
    const err = await issueCode(u, "reset");
    if (err && !err.startsWith("Please wait")) return { error: err };
  }
  redirect(`/learn/reset/?${qs({ email })}`);
}

export async function resetPassword(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "");
  const code = String(fd.get("code") ?? "").replace(/\D/g, "");
  const password = String(fd.get("password") ?? "");
  if (code.length !== 6) return { error: "Enter the 6-digit code from the email" };
  if (password.length < 8) return { error: "Password must be at least 8 characters" };
  const u = await findUser(email);
  if (!u) return { error: "That code is no longer valid. Request a new one." };
  const err = await consumeCode(u.id, "reset", code);
  if (err) return { error: err };
  // Reading the code from the inbox also proves the email address.
  await sql.query(`UPDATE users SET password_hash = $2, email_verified_at = coalesce(email_verified_at, now()) WHERE id = $1`, [
    u.id,
    await bcrypt.hash(password, 10),
  ]);
  await createSession({ id: u.id, name: u.name, email: u.email, tz: u.timezone });
  redirect("/learn/dashboard/");
}

export async function logout() {
  await destroySession();
  redirect("/learn/");
}

/* ---------------- Plans ---------------- */

type OwnedPlan = { id: string; start_date: string; hours_per_day: number; study_days: number[]; day_hours: number[] | null; status: string };

async function ownedPlan(userId: string, planId: string): Promise<OwnedPlan | null> {
  if (!UUID.test(planId)) return null;
  const rows = (await sql.query(
    `SELECT id, start_date::text AS start_date, hours_per_day::float8 AS hours_per_day, study_days::int[] AS study_days,
       day_hours::float8[] AS day_hours, status
     FROM plans WHERE id = $1 AND user_id = $2`,
    [planId, userId],
  )) as OwnedPlan[];
  return rows[0] ?? null;
}

const weekOf = (p: OwnedPlan): WeekHours => normalizeWeek(p.day_hours) ?? weekHoursFrom(p.hours_per_day, p.study_days);

function parseWeek(fd: FormData): WeekHours | null {
  try {
    return normalizeWeek(JSON.parse(String(fd.get("week") ?? "null")));
  } catch {
    return null;
  }
}

export async function createPlan(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Your session expired. Log in again." };

  const start = String(fd.get("start") ?? "");
  if (!isISODate(start)) return { error: "Pick a start date" };
  const title = String(fd.get("title") ?? "").trim().slice(0, 120);
  if (!title) return { error: "Give your plan a name" };
  const description = String(fd.get("description") ?? "").trim().slice(0, 500) || null;
  const pathSlug = String(fd.get("path") ?? "") || null;

  let tree: unknown;
  try {
    tree = JSON.parse(String(fd.get("tree") ?? ""));
  } catch {
    return { error: "Plan content is missing" };
  }
  const flat = flattenTree(tree);
  if ("error" in flat) return { error: flat.error };
  const rows = flat.rows;
  const totalHours = rows.reduce((s, r) => s + r.hours, 0);

  let week = parseWeek(fd);
  if (!week) return { error: "Pick at least one study day" };
  if (fd.get("mode") === "deadline") {
    const end = String(fd.get("deadline") ?? "");
    if (!isISODate(end) || end < start) return { error: "Pick a finish date after the start date" };
    const h = hoursForDeadline(totalHours, start, end, studyDaysOf(week));
    if (h === null) return { error: "No study days fall between those dates" };
    if (h > 16) return { error: `That needs ${h} hours a day. Pick a later finish date or more study days.` };
    week = weekHoursFrom(h, studyDaysOf(week));
  }

  const sched = buildSchedule(rows.map((r) => r.hours), start, week);
  const planId = crypto.randomUUID();
  const itemIds = rows.map(() => crypto.randomUUID());
  // Split each topic's hours evenly across its subtopics, in 5-minute steps, so every step is a short session.
  const subs = rows.flatMap((r, i) =>
    r.subtopics.map((title, pos) => ({ item: itemIds[i], pos, title, est: Math.max(5, Math.round((r.hours * 60) / r.subtopics.length / 5) * 5) })),
  );
  await sql.transaction([
    sql.query(
      `INSERT INTO plans (id, user_id, path_slug, title, description, start_date, hours_per_day, study_days, day_hours)
       VALUES ($1, $2, $3, $4, $5, $6::date, $7, $8::smallint[], $9::real[])`,
      [planId, user.id, pathSlug, title, description, start, avgHours(week), studyDaysOf(week), week],
    ),
    sql.query(
      `INSERT INTO plan_items (plan_id, id, position, module_title, title, est_hours, topic_key, scheduled_start, scheduled_end)
       SELECT $1, * FROM unnest($9::uuid[], $2::int[], $3::text[], $4::text[], $5::numeric[], $6::text[], $7::date[], $8::date[])`,
      [
        planId,
        rows.map((_, i) => i),
        rows.map((r) => r.module),
        rows.map((r) => r.title),
        rows.map((r) => r.hours),
        rows.map((r) => r.key),
        sched.map((s) => s.start),
        sched.map((s) => s.end),
        itemIds,
      ],
    ),
    sql.query(
      `INSERT INTO plan_subtopics (item_id, position, title, est_minutes) SELECT * FROM unnest($1::uuid[], $2::int[], $3::text[], $4::int[])`,
      [subs.map((x) => x.item), subs.map((x) => x.pos), subs.map((x) => x.title), subs.map((x) => x.est)],
    ),
  ]);
  revalidatePath("/learn/dashboard/");
  redirect(`/learn/plans/${planId}/`);
}

/** Re-lays out every unfinished topic starting from today (or the plan start, if later). */
async function reschedule(userId: string, tz: string, planId: string, newWeek?: WeekHours) {
  const plan = await ownedPlan(userId, planId);
  if (!plan) return false;
  const today = todayIn(tz);
  const week = newWeek ?? weekOf(plan);
  const pending = (await sql.query(
    `SELECT id, est_hours::float8 AS est_hours FROM plan_items WHERE plan_id = $1 AND completed_on IS NULL ORDER BY position`,
    [planId],
  )) as { id: string; est_hours: number }[];
  const from = today > plan.start_date ? today : plan.start_date;
  const sched = buildSchedule(pending.map((p) => p.est_hours), from, week);
  const queries = [
    sql.query(`UPDATE plans SET hours_per_day = $2, study_days = $3::smallint[], day_hours = $4::real[], updated_at = now() WHERE id = $1`, [
      planId,
      avgHours(week),
      studyDaysOf(week),
      week,
    ]),
  ];
  if (pending.length)
    queries.push(
      sql.query(
        `UPDATE plan_items i SET scheduled_start = u.s, scheduled_end = u.e
         FROM unnest($1::uuid[], $2::date[], $3::date[]) AS u(id, s, e) WHERE i.id = u.id AND i.plan_id = $4`,
        [pending.map((p) => p.id), sched.map((s) => s.start), sched.map((s) => s.end), planId],
      ),
    );
  await sql.transaction(queries);
  return true;
}

const refresh = (planId: string) => {
  revalidatePath(`/learn/plans/${planId}/`);
  revalidatePath("/learn/dashboard/");
};

export async function rebalancePlan(planId: string): Promise<FormState> {
  const user = await requireUser();
  if (!(await reschedule(user.id, user.tz, planId))) return { error: "Plan not found" };
  refresh(planId);
  return { ok: "Schedule rebuilt from today" };
}

export async function updatePlanSettings(planId: string, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const week = parseWeek(fd);
  const title = String(fd.get("title") ?? "").trim().slice(0, 120);
  if (!week) return { error: "Pick at least one study day" };
  if (!(await reschedule(user.id, user.tz, planId, week))) return { error: "Plan not found" };
  if (title) await sql.query(`UPDATE plans SET title = $1 WHERE id = $2 AND user_id = $3`, [title, planId, user.id]);
  refresh(planId);
  return { ok: "Saved. Remaining topics were rescheduled." };
}

export async function setPlanStatus(planId: string, status: "active" | "paused"): Promise<FormState> {
  const user = await requireUser();
  if (!UUID.test(planId) || (status !== "active" && status !== "paused")) return { error: "Plan not found" };
  await sql.query(`UPDATE plans SET status = $1, updated_at = now() WHERE id = $2 AND user_id = $3 AND status <> 'completed'`, [
    status,
    planId,
    user.id,
  ]);
  if (status === "active") await reschedule(user.id, user.tz, planId);
  refresh(planId);
  return { ok: status === "paused" ? "Plan paused" : "Plan resumed and rescheduled from today" };
}

export async function deletePlan(planId: string) {
  const user = await requireUser();
  if (UUID.test(planId)) await sql.query(`DELETE FROM plans WHERE id = $1 AND user_id = $2`, [planId, user.id]);
  revalidatePath("/learn/dashboard/");
  redirect("/learn/dashboard/");
}

export async function savePlanNotes(planId: string, html: string): Promise<FormState> {
  const user = await requireUser();
  if (!UUID.test(planId)) return { error: "Plan not found" };
  const rows = (await sql.query(`UPDATE plans SET notes = NULLIF($3, '') WHERE id = $1 AND user_id = $2 RETURNING id`, [
    planId,
    user.id,
    html.slice(0, 200_000),
  ])) as { id: string }[];
  return rows[0] ? { ok: "Saved" } : { error: "Plan not found" };
}

/* ---------------- Topics ---------------- */

export async function toggleItem(itemId: string, done: boolean): Promise<FormState> {
  const user = await requireUser();
  if (!UUID.test(itemId)) return { error: "Topic not found" };
  const today = todayIn(user.tz);
  const rows = (await sql.query(
    `UPDATE plan_items i SET completed_at = CASE WHEN $3 THEN now() END, completed_on = CASE WHEN $3 THEN $4::date END
     FROM plans p WHERE i.plan_id = p.id AND p.user_id = $1 AND i.id = $2 RETURNING i.plan_id`,
    [user.id, itemId, done, today],
  )) as { plan_id: string }[];
  const planId = rows[0]?.plan_id;
  if (!planId) return { error: "Topic not found" };
  // Done means done: tick any open subtopics too (unticking the topic leaves them as they are).
  if (done) await sql.query(`UPDATE plan_subtopics SET done_on = $2::date WHERE item_id = $1 AND done_on IS NULL`, [itemId, today]);
  await syncPlanStatus(planId);
  refresh(planId);
  return { ok: done ? "Marked done" : "Marked not done" };
}

/** Keeps the plan status in sync with topic completion. */
async function syncPlanStatus(planId: string) {
  await sql.query(
    `UPDATE plans SET status = CASE
        WHEN NOT EXISTS (SELECT 1 FROM plan_items WHERE plan_id = $1 AND completed_on IS NULL) THEN 'completed'
        WHEN status = 'completed' THEN 'active' ELSE status END
     WHERE id = $1`,
    [planId],
  );
}

/* ---------------- Subtopics ---------------- */

async function ownedItem(userId: string, itemId: string) {
  if (!UUID.test(itemId)) return null;
  const rows = (await sql.query(`SELECT i.plan_id FROM plan_items i JOIN plans p ON p.id = i.plan_id WHERE i.id = $1 AND p.user_id = $2`, [
    itemId,
    userId,
  ])) as { plan_id: string }[];
  return rows[0]?.plan_id ?? null;
}

async function ownedSubtopic(userId: string, subId: string) {
  if (!UUID.test(subId)) return null;
  const rows = (await sql.query(
    `SELECT s.item_id, i.plan_id FROM plan_subtopics s JOIN plan_items i ON i.id = s.item_id JOIN plans p ON p.id = i.plan_id
     WHERE s.id = $1 AND p.user_id = $2`,
    [subId, userId],
  )) as { item_id: string; plan_id: string }[];
  return rows[0] ?? null;
}

export async function addSubtopic(itemId: string, title: string, estMinutes = 15): Promise<FormState> {
  const user = await requireUser();
  const est = Math.min(600, Math.max(5, Math.round(Number(estMinutes) || 15)));
  const t = title.trim().slice(0, 300);
  if (!t) return { error: "Type a subtopic first" };
  const planId = await ownedItem(user.id, itemId);
  if (!planId) return { error: "Topic not found" };
  const count = (await sql.query(`SELECT count(*)::int AS n FROM plan_subtopics WHERE item_id = $1`, [itemId])) as { n: number }[];
  if (count[0].n >= 50) return { error: "A topic can have up to 50 subtopics" };
  await sql.query(
    `INSERT INTO plan_subtopics (item_id, position, title, est_minutes)
     VALUES ($1, (SELECT coalesce(max(position) + 1, 0) FROM plan_subtopics WHERE item_id = $1), $2, $3)`,
    [itemId, t, est],
  );
  revalidatePath(`/learn/plans/${planId}/`);
  return { ok: "Added" };
}

/**
 * Ticks a subtopic. Finishing the last open subtopic completes the topic;
 * reopening a subtopic of a finished topic reopens the topic.
 */
export async function toggleSubtopic(subId: string, done: boolean): Promise<FormState & { topicDone?: boolean }> {
  const user = await requireUser();
  const own = await ownedSubtopic(user.id, subId);
  if (!own) return { error: "Subtopic not found" };
  const today = todayIn(user.tz);
  await sql.query(`UPDATE plan_subtopics SET done_on = CASE WHEN $2 THEN $3::date END WHERE id = $1`, [subId, done, today]);
  const [st] = (await sql.query(
    `SELECT count(*) FILTER (WHERE done_on IS NULL)::int AS open, count(*)::int AS total,
       (SELECT completed_on IS NOT NULL FROM plan_items WHERE id = $1) AS topic_done
     FROM plan_subtopics WHERE item_id = $1`,
    [own.item_id],
  )) as { open: number; total: number; topic_done: boolean }[];
  let topicDone = st.topic_done;
  if (done && st.total > 0 && st.open === 0 && !st.topic_done) {
    await sql.query(`UPDATE plan_items SET completed_at = now(), completed_on = $2::date WHERE id = $1`, [own.item_id, today]);
    topicDone = true;
  } else if (!done && st.topic_done) {
    await sql.query(`UPDATE plan_items SET completed_at = NULL, completed_on = NULL WHERE id = $1`, [own.item_id]);
    topicDone = false;
  }
  if (topicDone !== st.topic_done) await syncPlanStatus(own.plan_id);
  refresh(own.plan_id);
  return { ok: topicDone && !st.topic_done ? "All subtopics done. Topic complete!" : "Saved", topicDone };
}

export async function renameSubtopic(subId: string, title: string): Promise<FormState> {
  const user = await requireUser();
  const t = title.trim().slice(0, 300);
  const own = await ownedSubtopic(user.id, subId);
  if (!own) return { error: "Subtopic not found" };
  if (!t) return deleteSubtopic(subId);
  await sql.query(`UPDATE plan_subtopics SET title = $2 WHERE id = $1`, [subId, t]);
  revalidatePath(`/learn/plans/${own.plan_id}/`);
  return { ok: "Saved" };
}

export async function deleteSubtopic(subId: string): Promise<FormState> {
  const user = await requireUser();
  const own = await ownedSubtopic(user.id, subId);
  if (!own) return { error: "Subtopic not found" };
  await sql.query(`DELETE FROM plan_subtopics WHERE id = $1`, [subId]);
  revalidatePath(`/learn/plans/${own.plan_id}/`);
  return { ok: "Removed" };
}

export async function moveSubtopic(subId: string, dir: -1 | 1): Promise<FormState> {
  const user = await requireUser();
  const own = await ownedSubtopic(user.id, subId);
  if (!own) return { error: "Subtopic not found" };
  const list = (await sql.query(`SELECT id FROM plan_subtopics WHERE item_id = $1 ORDER BY position, created_at`, [own.item_id])) as { id: string }[];
  const i = list.findIndex((x) => x.id === subId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return { ok: "Saved" };
  [list[i], list[j]] = [list[j], list[i]];
  await sql.query(`UPDATE plan_subtopics s SET position = u.pos FROM unnest($1::uuid[], $2::int[]) AS u(id, pos) WHERE s.id = u.id`, [
    list.map((x) => x.id),
    list.map((_, k) => k),
  ]);
  revalidatePath(`/learn/plans/${own.plan_id}/`);
  return { ok: "Saved" };
}

export async function setSubtopicEstimate(subId: string, minutes: number): Promise<FormState> {
  const user = await requireUser();
  const own = await ownedSubtopic(user.id, subId);
  if (!own) return { error: "Subtopic not found" };
  const m = Math.round(Number(minutes));
  if (!Number.isFinite(m) || m < 5 || m > 600) return { error: "Use between 5 minutes and 10 hours" };
  await sql.query(`UPDATE plan_subtopics SET est_minutes = $2 WHERE id = $1`, [subId, m]);
  revalidatePath(`/learn/plans/${own.plan_id}/`);
  return { ok: "Saved" };
}

/** Splits the topic's estimate evenly across its subtopics (5-minute steps). */
export async function splitTopicTime(itemId: string): Promise<FormState> {
  const user = await requireUser();
  const planId = await ownedItem(user.id, itemId);
  if (!planId) return { error: "Topic not found" };
  await sql.query(
    `UPDATE plan_subtopics s SET est_minutes = GREATEST(5, ROUND(i.est_hours * 60 / c.n / 5) * 5)
     FROM plan_items i, (SELECT count(*) AS n FROM plan_subtopics WHERE item_id = $1) c
     WHERE s.item_id = $1 AND i.id = $1`,
    [itemId],
  );
  revalidatePath(`/learn/plans/${planId}/`);
  return { ok: "Time split evenly across subtopics" };
}

/* ---------------- Timer ---------------- */

const MAX_TIMER_MIN = 12 * 60;

/** Closes the running timer (if any) into a study log. Returns logged minutes. */
async function closeTimer(userId: string, tz: string, discard = false) {
  const rows = (await sql.query(`DELETE FROM active_timers WHERE user_id = $1 RETURNING plan_id, item_id, subtopic_id, started_at`, [userId])) as {
    plan_id: string;
    item_id: string;
    subtopic_id: string | null;
    started_at: string;
  }[];
  const t = rows[0];
  if (!t) return { minutes: 0, planId: null as string | null };
  if (discard) return { minutes: 0, planId: t.plan_id };
  const res = (await sql.query(
    `INSERT INTO study_logs (user_id, plan_id, item_id, subtopic_id, log_date, minutes, started_at, ended_at, note)
     SELECT $1, $2, $3, $4, ($5::timestamptz AT TIME ZONE $6)::date,
            LEAST($7, GREATEST(1, ROUND(extract(epoch FROM now() - $5::timestamptz) / 60)))::int, $5::timestamptz, now(), 'Timer'
     WHERE extract(epoch FROM now() - $5::timestamptz) >= 30
     RETURNING minutes`,
    [userId, t.plan_id, t.item_id, t.subtopic_id, t.started_at, isValidTimeZone(tz) ? tz : "UTC", MAX_TIMER_MIN],
  )) as { minutes: number }[];
  return { minutes: res[0]?.minutes ?? 0, planId: t.plan_id };
}

export async function startTimer(itemId: string, subtopicId?: string | null): Promise<FormState> {
  const user = await requireUser();
  const planId = await ownedItem(user.id, itemId);
  if (!planId) return { error: "Topic not found" };
  if (subtopicId) {
    const own = await ownedSubtopic(user.id, subtopicId);
    if (!own || own.item_id !== itemId) return { error: "Subtopic not found" };
  }
  const prev = await closeTimer(user.id, user.tz);
  await sql.query(`INSERT INTO active_timers (user_id, plan_id, item_id, subtopic_id) VALUES ($1, $2, $3, $4)`, [user.id, planId, itemId, subtopicId ?? null]);
  revalidatePath("/learn", "layout");
  return { ok: prev.minutes ? `Saved ${prev.minutes} min on the previous timer. New timer started.` : "Timer started" };
}

export async function stopTimer(discard = false): Promise<FormState> {
  const user = await requireUser();
  const r = await closeTimer(user.id, user.tz, discard);
  revalidatePath("/learn", "layout");
  if (!r.planId) return { ok: "No timer running" };
  return { ok: discard ? "Timer discarded" : r.minutes ? `Logged ${r.minutes} min` : "Under 30 seconds, not logged" };
}

/* ---------------- Tours ---------------- */

export async function completeTour(id: string): Promise<FormState> {
  const user = await getUser();
  if (!user || !/^[a-z-]{1,30}$/.test(id)) return { ok: "" };
  await sql.query(`UPDATE users SET tours_done = array_append(tours_done, $2) WHERE id = $1 AND NOT ($2 = ANY(tours_done))`, [user.id, id]);
  return { ok: "" };
}

export async function resetTour(id: string): Promise<FormState> {
  const user = await requireUser();
  await sql.query(`UPDATE users SET tours_done = array_remove(tours_done, $2) WHERE id = $1`, [user.id, id]);
  revalidatePath("/learn", "layout");
  return { ok: "" };
}

/* ---------------- References ---------------- */

export async function addLink(itemId: string, input: { url: string; label?: string; kind?: string }): Promise<FormState> {
  const user = await requireUser();
  const url = normalizeUrl(input.url ?? "");
  if (!url) return { error: "Enter a valid web address (https://…)" };
  const planId = await ownedItem(user.id, itemId);
  if (!planId) return { error: "Topic not found" };
  const count = (await sql.query(`SELECT count(*)::int AS n FROM plan_links WHERE item_id = $1`, [itemId])) as { n: number }[];
  if (count[0].n >= 50) return { error: "A topic can have up to 50 links" };
  const kind = (LINK_KINDS as readonly string[]).includes(input.kind ?? "") ? input.kind! : detectKind(url);
  const label = (input.label ?? "").trim().slice(0, 200) || defaultLabel(url);
  await sql.query(`INSERT INTO plan_links (item_id, label, url, kind) VALUES ($1, $2, $3, $4)`, [itemId, label, url, kind]);
  revalidatePath(`/learn/plans/${planId}/`);
  return { ok: "Link added" };
}

export async function deleteLink(linkId: string): Promise<FormState> {
  const user = await requireUser();
  if (!UUID.test(linkId)) return { error: "Link not found" };
  const rows = (await sql.query(
    `DELETE FROM plan_links l USING plan_items i, plans p
     WHERE l.id = $1 AND i.id = l.item_id AND p.id = i.plan_id AND p.user_id = $2 RETURNING i.plan_id`,
    [linkId, user.id],
  )) as { plan_id: string }[];
  if (!rows[0]) return { error: "Link not found" };
  revalidatePath(`/learn/plans/${rows[0].plan_id}/`);
  return { ok: "Removed" };
}

/** Saves a topic note (HTML from the editor). Not revalidated on purpose: the editor already shows the latest text. */
export async function saveNote(itemId: string, note: string): Promise<FormState> {
  const user = await requireUser();
  if (!UUID.test(itemId)) return { error: "Topic not found" };
  const clean = note.trim() === "<p></p>" ? "" : note;
  const rows = (await sql.query(
    `UPDATE plan_items i SET notes = NULLIF($3, '') FROM plans p WHERE i.plan_id = p.id AND p.user_id = $1 AND i.id = $2 RETURNING i.plan_id`,
    [user.id, itemId, clean.slice(0, 100_000)],
  )) as { plan_id: string }[];
  return rows[0] ? { ok: "Saved" } : { error: "Topic not found" };
}

/* ---------------- Study log ---------------- */

export async function logStudy(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Your session expired. Log in again." };
  const today = todayIn(user.tz);
  const minutes = Math.round(Number(fd.get("minutes")));
  const date = String(fd.get("date") || today);
  const planId = String(fd.get("plan") ?? "") || null;
  const itemId = String(fd.get("item") ?? "") || null;
  const note = String(fd.get("note") ?? "").trim().slice(0, 500) || null;
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440) return { error: "Enter minutes between 1 and 1440" };
  if (!isISODate(date) || date > today || date < addDays(today, -365)) return { error: "Pick a date within the last year" };
  if (itemId && !planId) return { error: "Pick a plan for that topic" };
  if ((planId && !UUID.test(planId)) || (itemId && !UUID.test(itemId))) return { error: "Invalid plan or topic" };
  if (planId && !(await ownedPlan(user.id, planId))) return { error: "Plan not found" };
  await sql.query(
    `INSERT INTO study_logs (user_id, plan_id, item_id, log_date, minutes, note)
     SELECT $1, $2, i.id, $4::date, $5, $6 FROM (SELECT $3::uuid AS id) x
     LEFT JOIN plan_items i ON i.id = x.id AND i.plan_id = $2`,
    [user.id, planId, itemId, date, minutes, note],
  );
  revalidatePath("/learn/dashboard/");
  if (planId) revalidatePath(`/learn/plans/${planId}/`);
  return { ok: `Logged ${minutes} min` };
}

export async function deleteLog(logId: string): Promise<FormState> {
  const user = await requireUser();
  if (!UUID.test(logId)) return { error: "Log not found" };
  const rows = (await sql.query(`DELETE FROM study_logs WHERE id = $1 AND user_id = $2 RETURNING plan_id`, [logId, user.id])) as {
    plan_id: string | null;
  }[];
  revalidatePath("/learn/dashboard/");
  if (rows[0]?.plan_id) revalidatePath(`/learn/plans/${rows[0].plan_id}/`);
  return { ok: "Removed" };
}
