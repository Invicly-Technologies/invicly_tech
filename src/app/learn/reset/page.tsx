import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/learn/AuthShell";
import { ResetForm } from "@/components/learn/CodeForms";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  if (!email) redirect("/learn/forgot/");
  return (
    <AuthShell title="Set a new password" sub="Enter the code from your email and a new password.">
      <ResetForm email={email} />
    </AuthShell>
  );
}
