import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/learn/AuthForm";
import { AuthShell } from "@/components/learn/AuthShell";
import { getUser } from "@/lib/learn/auth";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getUser()) redirect(next?.startsWith("/learn/") ? next : "/learn/dashboard/");
  return (
    <AuthShell title="Create your free account" sub="Save plans and track your progress across devices.">
      <AuthForm mode="signup" next={next} />
    </AuthShell>
  );
}
