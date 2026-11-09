"use client";
import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { PathIcon } from "@/components/learn/bits";
import type { PathIconName } from "@/data/learn/types";
import { cn } from "@/lib/cn";

export type PathCard = {
  slug: string;
  title: string;
  tagline: string;
  level: string;
  category: string;
  icon: PathIconName;
  hours: number;
  modules: number;
  topics: number;
  tools: string[];
};

export function PathBrowser({ paths, categories }: { paths: PathCard[]; categories: readonly string[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const counts = Object.fromEntries(categories.map((c) => [c, paths.filter((p) => p.category === c).length]));
  const list = paths.filter(
    (p) => (cat === "All" || p.category === cat) && (!q || `${p.title} ${p.tagline} ${p.tools.join(" ")} ${p.category}`.toLowerCase().includes(q.toLowerCase())),
  );
  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {["All", ...categories.filter((c) => counts[c] > 0)].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={cn("min-h-10 rounded-full border px-4 text-sm font-bold transition-colors", cat === c ? "border-fg bg-fg text-ground" : "border-fg/15 text-muted hover:border-fg/30 hover:text-fg")}
            >
              {c} <span className="opacity-60">{c === "All" ? paths.length : counts[c]}</span>
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-quiet" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search paths or tools" aria-label="Search paths" className="fld !min-h-11 !pl-10" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <Link key={p.slug} href={`/learn/paths/${p.slug}/`} className="card3d group surface flex flex-col rounded-3xl p-6">
            <div className="flex items-start justify-between gap-4">
              <PathIcon icon={p.icon} />
              <span className="rounded-full border border-fg/15 px-2.5 py-1 text-[11px] font-semibold text-muted">{p.category}</span>
            </div>
            <h3 className="mt-5 text-[21px] font-bold leading-snug tracking-tight">{p.title}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{p.tagline}</p>
            <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <div><dt className="sr-only">Hours</dt><dd><b className="text-fg">{p.hours}h</b> <span className="text-quiet">study</span></dd></div>
              <div><dt className="sr-only">Topics</dt><dd><b className="text-fg">{p.topics}</b> <span className="text-quiet">topics</span></dd></div>
              <div><dt className="sr-only">Level</dt><dd className="text-quiet">{p.level}</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.tools.slice(0, 5).map((t) => (
                <span key={t} className="chp">{t}</span>
              ))}
              {p.tools.length > 5 && <span className="chp">+{p.tools.length - 5}</span>}
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-blue-light group-hover:text-fg">
              View roadmap <span className="arr">→</span>
            </span>
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="mt-10 text-center text-muted">No paths match “{q}”. Try another word, or build your own plan.</p>}
    </div>
  );
}
