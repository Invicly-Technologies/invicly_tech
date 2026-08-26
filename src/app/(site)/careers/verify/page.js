"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const next = searchParams.get("next") || "/careers";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/candidate/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json().catch(() => ({}));

    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function onResend() {
    setError("");
    setInfo("");
    setResending(true);
    const res = await fetch("/api/candidate/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose: "verify" }),
    });
    const data = await res.json().catch(() => ({}));
    setResending(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    setInfo("A new code has been sent.");
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center py-16">
      <form onSubmit={onSubmit} className="card-surface w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MailCheck size={22} />
          </span>
          <h1 className="text-xl font-semibold text-foreground">Verify your email</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the 6-digit code we sent to <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {info && <p className="text-sm text-emerald-500">{info}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Verify
          </Button>

          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="w-full text-center text-sm text-muted-foreground hover:text-primary disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        </div>
      </form>
    </section>
  );
}
