"use client";
import { useEffect } from "react";
import { Printer, X } from "lucide-react";

export function PrintBar({ auto }: { auto: boolean }) {
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [auto]);
  return (
    <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#e3e8f2] bg-white/95 px-4 py-2.5 backdrop-blur">
      <p className="text-sm text-[#5f6c86]">In the print dialog, choose <b className="text-[#0b1220]">Save as PDF</b> as the destination.</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => window.close()} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-[#3a4660] hover:bg-[#f3f6fb]">
          <X size={15} aria-hidden /> Close
        </button>
        <button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0A84FF] px-4 text-sm font-bold text-white">
          <Printer size={15} aria-hidden /> Save as PDF
        </button>
      </div>
    </div>
  );
}
