import crypto from "crypto";
import bcrypt from "bcryptjs";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

export function generateOtpCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function issueOtp(candidate, purpose) {
  const now = Date.now();
  if (candidate.otp?.lastSentAt && now - new Date(candidate.otp.lastSentAt).getTime() < RESEND_COOLDOWN_MS) {
    const waitSeconds = Math.ceil(
      (RESEND_COOLDOWN_MS - (now - new Date(candidate.otp.lastSentAt).getTime())) / 1000
    );
    return { code: null, waitSeconds };
  }

  const code = generateOtpCode();
  candidate.otp = {
    codeHash: await bcrypt.hash(code, 10),
    purpose,
    expiresAt: new Date(now + OTP_TTL_MS),
    attempts: 0,
    lastSentAt: new Date(now),
  };
  await candidate.save();

  if (process.env.NODE_ENV !== "production") {
    console.log(`[otp] ${purpose} code for ${candidate.email}: ${code}`);
  }

  return { code, waitSeconds: 0 };
}

export async function verifyOtp(candidate, purpose, code) {
  const otp = candidate.otp;
  if (!otp?.codeHash || otp.purpose !== purpose) {
    return { ok: false, reason: "No pending code. Request a new one." };
  }
  if (new Date(otp.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: "Code expired. Request a new one." };
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "Too many attempts. Request a new code." };
  }

  const valid = await bcrypt.compare(code, otp.codeHash);
  if (!valid) {
    candidate.otp.attempts += 1;
    await candidate.save();
    return { ok: false, reason: "Incorrect code." };
  }

  candidate.otp = { codeHash: null, purpose: null, expiresAt: null, attempts: 0, lastSentAt: null };
  await candidate.save();
  return { ok: true };
}
