"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function CandidateLogoutButton() {
  const router = useRouter();

  async function onClick() {
    await fetch("/api/candidate/logout", { method: "POST" });
    router.push("/careers");
    router.refresh();
  }

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
    >
      <LogOut size={14} /> Sign out
    </button>
  );
}
