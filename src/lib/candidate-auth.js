import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";

const COOKIE_NAME = "candidate_token";
const TOKEN_TTL = "7d";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function secret() {
  const value = process.env.CANDIDATE_JWT_SECRET;
  if (!value) throw new Error("CANDIDATE_JWT_SECRET is not configured.");
  return value;
}

export function signCandidateToken(candidate) {
  return jwt.sign({ sub: candidate._id.toString() }, secret(), { expiresIn: TOKEN_TTL });
}

export function verifyCandidateToken(token) {
  try {
    return jwt.verify(token, secret());
  } catch {
    return null;
  }
}

export async function setCandidateCookie(token) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearCandidateCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentCandidate() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyCandidateToken(token);
  if (!payload?.sub) return null;

  await connectDB();
  const candidate = await Candidate.findById(payload.sub);
  if (!candidate || candidate.disabled) return null;

  return candidate;
}
