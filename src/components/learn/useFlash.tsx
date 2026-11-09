"use client";
import { useEffect, useState } from "react";
import type { FormState } from "@/app/learn/actions";
import { cn } from "@/lib/cn";

/* ---------------- Toast ---------------- */

export function useFlash() {
  const [msg, setMsg] = useState<FormState>(undefined);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(undefined), 3500);
    return () => clearTimeout(t);
  }, [msg]);
  const node = msg ? (
    <div
      role="status"
      className={cn(
        "fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-2xl backdrop-blur",
        msg.error ? "border-[#ff7a7a]/40 bg-card text-danger" : "border-fg/15 bg-card/95 text-fg",
      )}
    >
      {msg.error ?? msg.ok}
    </div>
  ) : null;
  return [setMsg, node] as const;
}

