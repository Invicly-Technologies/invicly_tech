import type { Metadata } from "next";
import Link from "next/link";
import { paths, PATH_CATEGORIES } from "@/data/learn/paths";
import { posts, postsForPath, seriesHref } from "@/data/learn/blog";
import { BlogBrowser } from "@/components/learn/BlogBrowser";
import { BlogSearch } from "@/components/learn/BlogSearch";
import { PathIcon } from "@/components/learn/bits";
import { JsonLd, abs, organizationRef } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Invicly Blog: visual guides to DevOps, security, Linux, DSA and more" },
  description: `${posts.length} free, beginner-friendly articles with step-by-step diagrams, flashcards and self-check questions. DevOps, cyber security, Linux, DSA, Java, React, AWS, Kubernetes, AI and system design.`,
  alternates: { canonical: "/blog/", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { url: "/blog/", type: "website", siteName: "Invicly Learn", images: [{ url: "/learn/og.png", width: 1200, height: 630, alt: "Invicly Blog" }] },
};

export default function BlogIndex() {
  const cards = posts.map((p) => ({ slug: p.slug, title: p.title, summary: p.summary, path: p.pathTitle, category: p.category, minutes: p.minutes, keywords: `${p.moduleTitle} ${p.keywords.join(" ")}` }));
  return (
    <>
    <section className="relative border-b border-fg/10">
      <div className="wrap relative py-12 md:py-16">
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
        <h1 className="text-[38px] font-extrabold leading-[1.08] tracking-[-1.5px] md:text-[54px]">Learn one topic at a time, <span className="text-shimmer">with pictures.</span></h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {posts.length} short guides across {paths.length} subjects. Every article has a diagram you can step through, key-term flashcards and questions to check yourself.
        </p>
        <BlogSearch size="lg" className="mt-7 max-w-2xl" />
        <p className="mt-2.5 text-sm text-quiet">Try docker, subnetting or react hooks.</p>
      </header>
      </div>
    </section>
    <div className="wrap pb-10 md:pb-14">

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

      <section id="all" className="mt-12 scroll-mt-24" aria-labelledby="all-h">
        <h2 id="all-h" className="mb-4 text-xl font-bold">All articles</h2>
        <BlogBrowser posts={cards} categories={[...PATH_CATEGORIES]} />
      </section>
    </div>
    </>
  );
}
