"use client";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { forgotPassword, resendCode, resetPassword, verifyEmail, type FormState } from "@/app/learn/actions";

function CodeInput() {
  const [v, setV] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div>
      <label htmlFor="code" className="lbl">6-digit code</label>
      <input
        ref={ref}
        id="code"
        name="code"
        value={v}
        onChange={(e) => setV(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        required
        placeholder="000000"
        className="fld text-center font-mono !text-[26px] tracking-[0.5em] !min-h-16"
      />
    </div>
  );
}

function Resend({ email, purpose }: { email: string; purpose: "verify" | "reset" }) {
  const [left, setLeft] = useState(60);
  const [msg, setMsg] = useState<FormState>(undefined);
  const [pending, start] = useTransition();
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return (
    <div className="text-center text-sm">
      <button
        type="button"
        disabled={left > 0 || pending}
        onClick={() =>
          start(async () => {
            const r = await resendCode(email, purpose);
            setMsg(r);
            if (!r?.error) setLeft(60);
          })
        }
        className="font-bold text-blue-light hover:text-fg disabled:cursor-not-allowed disabled:text-quiet"
      >
        {left > 0 ? `Resend code in ${left}s` : pending ? "Sending…" : "Resend code"}
      </button>
      {msg && <p role="status" className={`mt-2 ${msg.error ? "text-danger" : "text-ok"}`}>{msg.error ?? msg.ok}</p>}
    </div>
  );
}

function ErrorBox({ state }: { state: FormState }) {
  return state?.error ? (
    <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</p>
  ) : null;
}

export function VerifyForm({ email, next }: { email: string; next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(verifyEmail, undefined);
  return (
    <form action={action} className="space-y-5">
      <div className="flex gap-3 rounded-2xl border border-blue/30 bg-blue/[.06] p-4 text-sm">
        <MailCheck size={20} className="shrink-0 text-blue-light" aria-hidden />
        <p className="text-muted">We sent a code to <b className="break-all text-fg">{email}</b>. It expires in 15 minutes. Check spam if you don&apos;t see it.</p>
      </div>
      <input type="hidden" name="email" value={email} />
      {next && <input type="hidden" name="next" value={next} />}
      <CodeInput />
      <ErrorBox state={state} />
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending && <Loader2 size={18} className="animate-spin" aria-hidden />} Verify email
      </button>
      <Resend email={email} purpose="verify" />
      <p className="text-center text-sm text-quiet">Wrong email? <Link href="/learn/signup/" className="font-bold text-blue-light hover:text-fg">Sign up again</Link></p>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(forgotPassword, undefined);
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className="lbl">Email</label>
        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="fld" />
      </div>
      <ErrorBox state={state} />
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending && <Loader2 size={18} className="animate-spin" aria-hidden />} Send reset code
      </button>
      <p className="text-center text-sm text-muted">Remembered it? <Link href="/learn/login/" className="font-bold text-blue-light hover:text-fg">Log in</Link></p>
    </form>
  );
}

export function ResetForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPassword, undefined);
  return (
    <form action={action} className="space-y-5">
      <p className="text-sm text-muted">If an account exists for <b className="break-all text-fg">{email}</b>, we sent it a code.</p>
      <input type="hidden" name="email" value={email} />
      <CodeInput />
      <div>
        <label htmlFor="password" className="lbl">New password</label>
        <input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required className="fld" />
        <p className="mt-1.5 text-xs text-quiet">At least 8 characters.</p>
      </div>
      <ErrorBox state={state} />
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending && <Loader2 size={18} className="animate-spin" aria-hidden />} Set new password
      </button>
      <Resend email={email} purpose="reset" />
    </form>
  );
}
