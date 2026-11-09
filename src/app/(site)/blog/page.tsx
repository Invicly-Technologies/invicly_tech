import type { Metadata } from "next";
import Link from "next/link";
import { paths, PATH_CATEGORIES } from "@/data/learn/paths";
import { posts, postsForPath, seriesHref } from "@/data/learn/blog";
import { BlogBrowser } from "@/components/learn/BlogBrowser";
import { PathIcon } from "@/components/learn/bits";
import { JsonLd, abs, organizationRef } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Invicly Blog: visual guides to DevOps, security, Linux, DSA and more" },
  description: `${posts.length} free, beginner-friendly articles with step-by-step diagrams, flashcards and self-check questions. DevOps, cyber security, Linux, DSA, Java, React, AWS, Kubernetes, AI and system design.`,
  alternates: { canonical: "/blog/", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { url: "/blog/", type: "website", siteName: "Invicly Learn", images: [{ url: "/learn/og.png", width: 1200, height: 630, alt: "Invicly Blog" }] },
};

export default function BlogIndex() {
  const cards = posts.map((p) => ({ slug: p.slug, title: p.title, summary: p.summary, path: p.pathTitle, category: p.category, minutes: p.minutes }));
  return (
    <div className="wrap py-10 md:py-14">
      <JsonLd
        data={{
          "@type": "Blog",
          "@id": abs("/blog/#blog"),
          name: "Invicly Blog",
          url: abs("/blog/"),
          description: "Visual, beginner-friendly guides to software engineering topics.",
          publisher: organizationRef,
          inLanguage: "en",
        }}
      />
      <header className="max-w-3xl">
        <p className="text-sm font-semibold text-blue-light">The Invicly Blog</p>
        <h1 className="mt-2 text-[38px] font-extrabold leading-[1.08] tracking-[-1.5px] md:text-[54px]">Learn one topic at a time, with pictures.</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {posts.length} short guides across {paths.length} subjects. Every article has a diagram you can step through, key-term flashcards and questions to check yourself.
        </p>
      </header>

      <section className="mt-10" aria-labelledby="series-h">
        <h2 id="series-h" className="text-xl font-bold">Series</h2>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((p) => (
            <li key={p.slug}>
              <Link href={seriesHref(p.slug)} className="surface flex items-center gap-3 rounded-2xl p-4 transition-colors hover:border-blue/50">
                <PathIcon icon={p.icon} className="h-10 w-10 rounded-xl" size={18} />
                <span className="min-w-0">
                  <span className="block truncate font-bold">{p.title}</span>
                  <span className="block text-xs text-quiet">{postsForPath(p.slug).length} articles</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="all-h">
        <h2 id="all-h" className="mb-4 text-xl font-bold">All articles</h2>
        <BlogBrowser posts={cards} categories={[...PATH_CATEGORIES]} />
      </section>
    </div>
  );
}
