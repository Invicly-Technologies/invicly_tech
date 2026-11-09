"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListTree, Network } from "lucide-react";
import { MindMap } from "@/components/learn/MindMap";
import type { PlanTree } from "@/lib/learn/tree";
import { cn } from "@/lib/cn";

export function PathViews({ tree, title, meta, hrefs, children }: { tree: PlanTree; title: string; meta: string; hrefs?: Record<string, string>; children: React.ReactNode }) {
  const [view, setView] = useState<"roadmap" | "map">("roadmap");
  const router = useRouter();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Roadmap</h2>
        <div className="inline-flex rounded-full border border-fg/15 p-0.5" role="tablist" aria-label="Roadmap view">
          {(
            [
              ["roadmap", "List", ListTree],
              ["map", "Mind map", Network],
            ] as const
          ).map(([k, l, I]) => (
            <button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => setView(k)} className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold", view === k ? "bg-fg text-ground" : "text-muted hover:text-fg")}>
              <I size={14} aria-hidden /> {l}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">{view === "map" ? <MindMap tree={tree} rootTitle={title} rootMeta={meta} height={620} onTopicOpen={hrefs ? (id) => hrefs[id] && router.push(hrefs[id]) : undefined} /> : children}</div>
    </div>
  );
}
