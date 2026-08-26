import { NextResponse, after } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { candidateSignupSchema } from "@/lib/validators";
import { issueOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

// Gives the background email send (via after()) enough headroom on Vercel's default
// function duration, which can otherwise be shorter than the mailer's own SMTP timeouts.
export const maxDuration = 30;

export async function POST(req) {
  const body = await req.json();
  const parsed = candidateSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await Candidate.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const candidate = await Candidate.create({
    name: parsed.data.name,
    email,
    phone: parsed.data.phone || "",
    passwordHash,
  });

  const { code } = await issueOtp(candidate, "verify");
  // Send in the background: the OTP is already saved (hashed) in the DB, so the client can
  // move to the verify screen immediately instead of waiting on a slow/unreliable SMTP round trip.
  if (code) {
    after(() => sendOtpEmail(email, code, "verify").catch((err) => console.error("[signup] OTP email failed:", err.message)));
  }

  return NextResponse.json({ ok: true, email }, { status: 201 });
}
