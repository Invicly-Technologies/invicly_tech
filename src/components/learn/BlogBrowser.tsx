"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { searchRows } from "@/components/learn/BlogSearch";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export type PostCard = { slug: string; title: string; summary: string; path: string; category: string; minutes: number; keywords: string };

const PAGE = 24;

export function BlogBrowser({ posts, categories }: { posts: PostCard[]; categories: string[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [limit, setLimit] = useState(PAGE);
  // Searches from the header arrive as /blog/?q=...
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("q");
    if (fromUrl) setQ(fromUrl);
  }, []);
  const list = useMemo(() => {
    const inCat = cat === "All" ? posts : posts.filter((p) => p.category === cat);
    return searchRows(inCat, q, (p) => ({ title: p.title, rest: `${p.path} ${p.keywords} ${p.summary}` }));
  }, [posts, q, cat]);
  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {["All", ...categories].map((c) => (
            <button key={c} type="button" onClick={() => { setCat(c); setLimit(PAGE); }} aria-pressed={cat === c} className={cn("min-h-10 rounded-full border px-4 text-sm font-bold", cat === c ? "border-fg bg-fg text-ground" : "border-fg/15 text-muted hover:text-fg")}>
              {c}
            </button>
          ))}
        </div>
        <div className="relative lg:w-80">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-quiet" aria-hidden />
          <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Filter articles" aria-label="Search articles" className="fld !min-h-11 !pl-10" />
        </div>
      </div>
      <p className="mt-4 text-sm text-quiet">{list.length} article{list.length === 1 ? "" : "s"}</p>
      <ul className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.slice(0, limit).map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}/`} className="surface group flex h-full flex-col rounded-2xl p-5 transition-colors hover:border-blue/50">
              <span className="text-xs font-semibold text-blue-light">{p.path}</span>
              <span className="mt-2 font-display text-[19px] font-bold leading-snug group-hover:text-blue-light">{p.title}</span>
              <span className="mt-2 line-clamp-3 text-[14.5px] leading-relaxed text-soft">{p.summary}</span>
              <span className="mt-auto pt-4 text-xs text-quiet">{p.minutes} min read</span>
            </Link>
          </li>
        ))}
      </ul>
      {list.length > limit && (
        <div className="mt-8 text-center">
          <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="btn btn-ghost btn-sm">
            Load more ({list.length - limit} left)
          </button>
        </div>
      )}
    </div>
  );
}
