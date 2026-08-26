import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { resendOtpSchema } from "@/lib/validators";
import { issueOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req) {
  const body = await req.json();
  const parsed = resendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const email = parsed.data.email.toLowerCase().trim();
  const candidate = await Candidate.findOne({ email });

  // Always respond the same way whether or not the account exists, to avoid leaking who's registered.
  if (!candidate || candidate.disabled) {
    return NextResponse.json({ ok: true });
  }

  const { code, waitSeconds } = await issueOtp(candidate, parsed.data.purpose);
  if (waitSeconds) {
    return NextResponse.json({ error: `Please wait ${waitSeconds}s before requesting another code.` }, { status: 429 });
  }

  if (code) await sendOtpEmail(email, code, parsed.data.purpose);

  return NextResponse.json({ ok: true });
}
