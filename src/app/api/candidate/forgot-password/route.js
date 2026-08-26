import { NextResponse, after } from "next/server";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { forgotPasswordSchema } from "@/lib/validators";
import { issueOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

// Gives the background email send (via after()) enough headroom on Vercel's default
// function duration, which can otherwise be shorter than the mailer's own SMTP timeouts.
export const maxDuration = 30;

export async function POST(req) {
  const body = await req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const email = parsed.data.email.toLowerCase().trim();
  const candidate = await Candidate.findOne({ email });

  // Same response either way — never reveal whether an account exists for this email.
  if (candidate && !candidate.disabled) {
    const { code } = await issueOtp(candidate, "reset");
    if (code) {
      after(() =>
        sendOtpEmail(email, code, "reset").catch((err) => console.error("[forgot-password] OTP email failed:", err.message))
      );
    }
  }

  return NextResponse.json({ ok: true, message: "If that email is registered, a code has been sent." });
}
