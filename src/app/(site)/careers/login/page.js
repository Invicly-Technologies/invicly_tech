"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import { candidateLoginSchema } from "@/lib/validators";
import { Input, PasswordInput, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CandidateLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/careers";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(candidateLoginSchema) });

  async function onSubmit(values) {
    setError("");
    const res = await fetch("/api/candidate/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (data.needsVerification) {
        router.push(`/careers/verify?email=${encodeURIComponent(values.email)}&next=${encodeURIComponent(next)}`);
        return;
      }
      setError(data.error || "Something went wrong");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center py-16">
      <form onSubmit={handleSubmit(onSubmit)} className="card-surface w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LogIn size={22} />
          </span>
          <h1 className="text-xl font-semibold text-foreground">Candidate login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to apply and track your applications</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Log in
          </Button>

          <div className="flex items-center justify-between text-sm">
            <Link href="/careers/forgot-password" className="text-muted-foreground hover:text-primary">
              Forgot password?
            </Link>
            <Link href={`/careers/signup?next=${encodeURIComponent(next)}`} className="text-primary underline">
              Create account
            </Link>
          </div>
        </div>
      </form>
    </section>
  );
}
