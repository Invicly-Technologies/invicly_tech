"use client";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { login, signup, type FormState } from "@/app/learn/actions";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : signup, undefined);
  const [tz, setTz] = useState("");
  // Controlled so React's post-action form reset doesn't wipe them after an error.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => setTz(Intl.DateTimeFormat().resolvedOptions().timeZone), []);
  const nextQs = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="space-y-5" noValidate={false}>
      <input type="hidden" name="tz" value={tz} />
      {next && <input type="hidden" name="next" value={next} />}
      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="lbl">Name</label>
          <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className="fld" autoComplete="name" required maxLength={80} />
        </div>
      )}
      <div>
        <label htmlFor="email" className="lbl">Email</label>
        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="fld" autoComplete="email" required />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="lbl">Password</label>
          {mode === "login" && <Link href="/learn/forgot/" className="mb-2 text-xs font-bold text-blue-light hover:text-fg">Forgot password?</Link>}
        </div>
        <input
          id="password"
          name="password"
          type="password"
          className="fld"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={mode === "signup" ? 8 : undefined}
          required
        />
        {mode === "signup" && <p className="mt-1.5 text-xs text-quiet">At least 8 characters. We&apos;ll email you a code to verify your address.</p>}
      </div>
      {state?.error && (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending && <Loader2 size={18} className="animate-spin" aria-hidden />}
        {mode === "login" ? "Log in" : "Create account"}
      </button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>New here? <Link className="font-bold text-blue-light hover:text-fg" href={`/learn/signup/${nextQs}`}>Create a free account</Link></>
        ) : (
          <>Already have an account? <Link className="font-bold text-blue-light hover:text-fg" href={`/learn/login/${nextQs}`}>Log in</Link></>
        )}
      </p>
    </form>
  );
}
