"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLearnSession } from "@/components/learn/session";

/** Hero call to action: dashboard for signed-in users, sign-up otherwise (decided in the browser so the page stays static). */
export function HeroCta() {
  const { user } = useLearnSession();
  return user ? (
    <Link href="/learn/dashboard/" className="btn btn-primary">
      Go to my dashboard <ArrowRight size={18} aria-hidden />
    </Link>
  ) : (
    <Link href="/learn/signup/" className="btn btn-primary">
      Start tracking, free <ArrowRight size={18} aria-hidden />
    </Link>
  );
}

export function SignupBand() {
  const { user, loaded } = useLearnSession();
  if (loaded && user) return null;
  return (
    <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-3xl border border-blue/30 bg-gradient-to-br from-blue/15 to-transparent p-8 md:flex-row md:items-center md:p-10">
      <div>
        <h2 className="text-[28px] font-bold tracking-tight">Ready to start your first plan?</h2>
        <p className="mt-2 text-muted">Free, no card, takes 30 seconds.</p>
      </div>
      <Link href="/learn/signup/" className="btn btn-primary">
        Create free account <ArrowRight size={18} aria-hidden />
      </Link>
    </div>
  );
}
