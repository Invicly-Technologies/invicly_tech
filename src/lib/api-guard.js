import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getCurrentCandidate } from "@/lib/candidate-auth";

export async function requireAdminOrResponse() {
  const session = await requireAdmin();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, response: null };
}

export async function requireSuperAdminOrResponse() {
  const { session, response } = await requireAdminOrResponse();
  if (response) return { session: null, response };

  if (!session.user?.isSuperAdmin) {
    return { session: null, response: NextResponse.json({ error: "Super admin only" }, { status: 403 }) };
  }
  return { session, response: null };
}

export async function requireCandidateOrResponse() {
  const candidate = await getCurrentCandidate();
  if (!candidate) {
    return { candidate: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { candidate, response: null };
}
