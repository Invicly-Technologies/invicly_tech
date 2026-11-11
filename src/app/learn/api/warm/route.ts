import { sql } from "@/lib/learn/db";

export const dynamic = "force-dynamic";

/**
 * Wakes the Neon database. On Neon's free plan the compute sleeps after ~5 idle minutes and the first
 * query then waits several seconds for it to start. Auth pages call this as soon as they open, so by the
 * time someone has typed their email and password the database is already awake.
 * Only auth pages call it, so ordinary visitors and crawlers never wake the database.
 */
export async function POST() {
  try {
    await sql.query("SELECT 1");
  } catch {}
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
