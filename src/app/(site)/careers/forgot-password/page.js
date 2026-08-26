"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/candidate/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubmitting(false);
    setSent(true);
  }

  if (sent) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center py-16">
        <div className="card-surface w-full max-w-sm p-8 text-center">
          <h1 className="text-xl font-semibold text-foreground">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for {email}, a reset code has been sent.
          </p>
          <Button className="mt-6 w-full" onClick={() => router.push(`/careers/reset-password?email=${encodeURIComponent(email)}`)}>
            I have a code
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center py-16">
      <form onSubmit={onSubmit} className="card-surface w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <KeyRound size={22} />
          </span>
          <h1 className="text-xl font-semibold text-foreground">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">We&apos;ll email you a 6-digit code</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Send reset code
          </Button>
        </div>
      </form>
    </section>
  );
}
