import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { verifyOtpSchema } from "@/lib/validators";
import { verifyOtp } from "@/lib/otp";
import { signCandidateToken, setCandidateCookie } from "@/lib/candidate-auth";

export async function POST(req) {
  const body = await req.json();
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const email = parsed.data.email.toLowerCase().trim();
  const candidate = await Candidate.findOne({ email });
  if (!candidate) {
    return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
  }

  const result = await verifyOtp(candidate, "verify", parsed.data.otp);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  candidate.emailVerified = true;
  await candidate.save();

  const token = signCandidateToken(candidate);
  await setCandidateCookie(token);

  return NextResponse.json({ ok: true });
}
