"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { candidateSignupSchema } from "@/lib/validators";
import { Input, PasswordInput, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CandidateSignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/careers";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(candidateSignupSchema) });

  async function onSubmit(values) {
    setError("");
    const res = await fetch("/api/candidate/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    router.push(`/careers/verify?email=${encodeURIComponent(values.email)}&next=${encodeURIComponent(next)}`);
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center py-16">
      <form onSubmit={handleSubmit(onSubmit)} className="card-surface w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserPlus size={22} />
          </span>
          <h1 className="text-xl font-semibold text-foreground">Create a candidate account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign up to apply for roles at Invicly Technologies</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Create account
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={`/careers/login?next=${encodeURIComponent(next)}`} className="text-primary underline">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </section>
  );
}
