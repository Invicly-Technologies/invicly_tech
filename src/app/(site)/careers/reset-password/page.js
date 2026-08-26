"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { resetPasswordSchema } from "@/lib/validators";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: searchParams.get("email") || "", otp: "", newPassword: "" },
  });

  async function onSubmit(values) {
    setError("");
    const res = await fetch("/api/candidate/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center py-16">
        <div className="card-surface w-full max-w-sm p-8 text-center">
          <h1 className="text-xl font-semibold text-foreground">Password updated</h1>
          <p className="mt-2 text-sm text-muted-foreground">You can now log in with your new password.</p>
          <Button className="mt-6 w-full" onClick={() => router.push("/careers/login")}>
            Go to login
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center py-16">
      <form onSubmit={handleSubmit(onSubmit)} className="card-surface w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck size={22} />
          </span>
          <h1 className="text-xl font-semibold text-foreground">Enter your reset code</h1>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
          <div>
            <Label htmlFor="otp">6-digit code</Label>
            <Input id="otp" inputMode="numeric" maxLength={6} {...register("otp")} />
            {errors.otp && <p className="mt-1 text-xs text-red-500">{errors.otp.message}</p>}
          </div>
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" {...register("newPassword")} />
            {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Reset password
          </Button>
        </div>
      </form>
    </section>
  );
}
