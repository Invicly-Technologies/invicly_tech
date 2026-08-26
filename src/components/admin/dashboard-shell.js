"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/admin/sidebar";

export function DashboardShell({ adminEmail, isSuperAdmin, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar adminEmail={adminEmail} isSuperAdmin={isSuperAdmin} open={open} onNavigate={() => setOpen(false)} />

      <div className="flex-1 overflow-x-hidden">
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 md:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <p className="text-sm font-semibold text-foreground">Invicly Technologies</p>
        </div>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
