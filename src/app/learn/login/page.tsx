import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/learn/AuthForm";
import { AuthShell } from "@/components/learn/AuthShell";
import { getUser } from "@/lib/learn/auth";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getUser()) redirect(next?.startsWith("/learn/") ? next : "/learn/dashboard/");
  return (
    <AuthShell title="Welcome back" sub="Log in to continue your plans.">
      <AuthForm mode="login" next={next} />
    </AuthShell>
  );
}
