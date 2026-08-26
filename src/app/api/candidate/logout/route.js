import { NextResponse } from "next/server";
import { clearCandidateCookie } from "@/lib/candidate-auth";

export async function POST() {
  await clearCandidateCookie();
  return NextResponse.json({ ok: true });
}
