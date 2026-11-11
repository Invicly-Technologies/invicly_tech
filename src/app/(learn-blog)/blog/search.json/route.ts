import { posts } from "@/data/learn/blog";

export const dynamic = "force-static";

/**
 * Compact search index for the header search box, fetched on first focus (not shipped with every page).
 * Row: [slug, title, path title, extra searchable words (module + key terms)].
 */
export function GET() {
  const rows = posts.map((p) => [p.slug, p.title, p.pathTitle, [p.moduleTitle, ...p.keywords.slice(1, -1)].join(" ")]);
  return new Response(JSON.stringify(rows), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
