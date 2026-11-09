import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/learn/AuthShell";
import { VerifyForm } from "@/components/learn/CodeForms";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false } };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ email?: string; next?: string; sent?: string }> }) {
  const { email, next, sent } = await searchParams;
  if (!email) redirect("/learn/signup/");
  return (
    <AuthShell title="Check your email" sub={sent === "login" ? "Your email isn't verified yet. Enter the code we just sent." : "One last step: confirm it's really you."}>
      <VerifyForm email={email} next={next?.startsWith("/learn/") ? next : undefined} />
    </AuthShell>
  );
}
