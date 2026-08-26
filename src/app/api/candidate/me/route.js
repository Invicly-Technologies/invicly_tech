import { NextResponse } from "next/server";
import { getCurrentCandidate } from "@/lib/candidate-auth";

export async function GET() {
  const candidate = await getCurrentCandidate();
  if (!candidate) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: candidate._id.toString(),
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
  });
}
