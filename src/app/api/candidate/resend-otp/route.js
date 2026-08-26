import { NextResponse, after } from "next/server";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { resendOtpSchema } from "@/lib/validators";
import { issueOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

// Gives the background email send (via after()) enough headroom on Vercel's default
// function duration, which can otherwise be shorter than the mailer's own SMTP timeouts.
export const maxDuration = 30;

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

  if (code) {
    after(() =>
      sendOtpEmail(email, code, parsed.data.purpose).catch((err) =>
        console.error("[resend-otp] OTP email failed:", err.message)
      )
    );
  }

  return NextResponse.json({ ok: true });
}
