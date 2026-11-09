import { posts, postHref, BLOG_PUBLISHED } from "@/data/learn/blog";
import { site } from "@/data/site";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export function GET() {
  const pub = new Date(`${BLOG_PUBLISHED}T09:00:00Z`).toUTCString();
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(`${p.title}: explained visually`)}</title>
      <link>${site.url}${postHref(p.slug)}</link>
      <guid isPermaLink="true">${site.url}${postHref(p.slug)}</guid>
      <category>${esc(p.pathTitle)}</category>
      <pubDate>${pub}</pubDate>
      <description>${esc(p.summary)}</description>
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Invicly Blog</title>
    <link>${site.url}/blog/</link>
    <atom:link href="${site.url}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>Visual, beginner-friendly guides to DevOps, cyber security, Linux, DSA, Java, React, AWS, Kubernetes, AI and system design.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
