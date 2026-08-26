import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { resetPasswordSchema } from "@/lib/validators";
import { verifyOtp } from "@/lib/otp";

export async function POST(req) {
  const body = await req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const email = parsed.data.email.toLowerCase().trim();
  const candidate = await Candidate.findOne({ email });
  if (!candidate) {
    return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
  }

  const result = await verifyOtp(candidate, "reset", parsed.data.otp);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  candidate.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await candidate.save();

  return NextResponse.json({ ok: true });
}
