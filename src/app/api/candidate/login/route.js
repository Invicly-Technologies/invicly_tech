import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { candidateLoginSchema } from "@/lib/validators";
import { signCandidateToken, setCandidateCookie } from "@/lib/candidate-auth";

export async function POST(req) {
  const body = await req.json();
  const parsed = candidateLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const email = parsed.data.email.toLowerCase().trim();
  const candidate = await Candidate.findOne({ email });
  if (!candidate) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(parsed.data.password, candidate.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (candidate.disabled) {
    return NextResponse.json({ error: "This account has been disabled." }, { status: 403 });
  }

  if (!candidate.emailVerified) {
    return NextResponse.json(
      { error: "Please verify your email first.", needsVerification: true },
      { status: 403 }
    );
  }

  const token = signCandidateToken(candidate);
  await setCandidateCookie(token);

  return NextResponse.json({ ok: true });
}
