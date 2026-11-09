import { NextResponse } from "next/server";
import { getUser } from "@/lib/learn/auth";
import { getLayoutState } from "@/lib/learn/data";

export const dynamic = "force-dynamic";

/** Who is signed in, their running timer and finished tours. Fetched by the browser so Learn pages can stay static. */
export async function GET() {
  const user = await getUser();
  const body = user
    ? { user: { name: user.name }, ...(await getLayoutState(user.id).catch(() => ({ timer: null, tours: [] as string[] }))) }
    : { user: null, timer: null, tours: [] as string[] };
  return NextResponse.json(body, { headers: { "Cache-Control": "private, no-store" } });
}
