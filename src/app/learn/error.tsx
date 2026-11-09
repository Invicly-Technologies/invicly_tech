"use client";
import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw, WifiOff } from "lucide-react";

export default function LearnError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.warn("Invicly Learn page error", error.digest);
  }, [error]);
  return (
    <div className="wrap grid min-h-[60vh] place-items-center py-16 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-warn/15 text-warn"><WifiOff size={26} aria-hidden /></span>
        <h1 className="mt-5 text-2xl font-bold">We couldn&apos;t load this page</h1>
        <p className="mt-2 text-muted">This is usually a brief connection hiccup. Your plans and progress are safe.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primary btn-sm"><RefreshCw size={16} aria-hidden /> Try again</button>
          <Link href="/learn/dashboard/" className="btn btn-ghost btn-sm">Dashboard</Link>
        </div>
        {error.digest && <p className="mt-6 font-mono text-xs text-quiet">Ref: {error.digest}</p>}
      </div>
    </div>
  );
}
