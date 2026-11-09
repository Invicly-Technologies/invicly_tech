import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "il_session";
const MAX_AGE = 60 * 60 * 24 * 30;

export type SessionUser = { id: string; name: string; email: string; tz: string };

function secret() {
  const s = process.env.LEARN_AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("LEARN_AUTH_SECRET must be set (32+ chars)");
  return new TextEncoder().encode(s);
}

export async function createSession(u: SessionUser) {
  const token = await new SignJWT({ name: u.name, email: u.email, tz: u.tz })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(u.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return { id: payload.sub, name: String(payload.name ?? ""), email: String(payload.email ?? ""), tz: String(payload.tz ?? "UTC") };
  } catch {
    return null;
  }
}

export async function requireUser(next = "/learn/dashboard/"): Promise<SessionUser> {
  const u = await getUser();
  if (!u) redirect(`/learn/login/?next=${encodeURIComponent(next)}`);
  return u;
}
