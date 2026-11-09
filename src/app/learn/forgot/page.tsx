import type { Metadata } from "next";
import { AuthShell } from "@/components/learn/AuthShell";
import { ForgotForm } from "@/components/learn/CodeForms";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPage() {
  return (
    <AuthShell title="Reset your password" sub="Enter your email and we'll send you a code.">
      <ForgotForm />
    </AuthShell>
  );
}
