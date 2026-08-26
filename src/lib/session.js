import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getAdminSession() {
  return getServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session?.user) {
    return null;
  }
  return session;
}
