import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPath, paths } from "@/data/learn/paths";
import { postFor, postHref, postsForPath, seriesHref } from "@/data/learn/blog";
import { PathIcon } from "@/components/learn/bits";
import { JsonLd, abs, breadcrumbLd } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return paths.map((p) => ({ path: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ path: string }> }): Promise<Metadata> {
  const p = getPath((await params).path);
  if (!p) return {};
  const url = seriesHref(p.slug);
  return {
    title: `${p.title}: ${postsForPath(p.slug).length} visual guides`,
    description: `Every topic in ${p.title}, explained simply with diagrams, examples, quizzes and practice. ${p.tagline}`,
    alternates: { canonical: url },
    openGraph: { url, type: "website", siteName: "Invicly Learn", images: [{ url: `/learn/paths/${p.slug}/og.png`, width: 1200, height: 630, alt: p.title }] },
  };
}

export default async function SeriesPage({ params }: { params: Promise<{ path: string }> }) {
  const p = getPath((await params).path);
  if (!p) notFound();
  const list = postsForPath(p.slug);
  return (
    <div className="wrap max-w-4xl py-10 md:py-14">
      <JsonLd
        data={[
          { "@type": "ItemList", name: `${p.title} articles`, itemListElement: list.map((x, i) => ({ "@type": "ListItem", position: i + 1, url: abs(postHref(x.slug)), name: x.title })) },
          breadcrumbLd([{ name: "Blog", path: "/blog/" }, { name: p.title, path: seriesHref(p.slug) }]),
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-quiet">
        <Link href="/blog/" className="hover:text-fg">Blog</Link> / <span className="text-muted">{p.title}</span>
      </nav>
      <div className="mt-5 flex items-center gap-4">
        <PathIcon icon={p.icon} className="h-14 w-14" size={26} />
        <div>
          <h1 className="text-[32px] font-extrabold leading-tight tracking-[-1px] md:text-[42px]">{p.title}</h1>
          <p className="text-muted">{p.tagline}</p>
        </div>
      </div>
      <p className="mt-4 leading-relaxed text-soft">{p.description}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/learn/paths/${p.slug}/`} className="btn btn-ghost btn-sm">See the roadmap</Link>
        <Link href={`/learn/plans/new/?path=${p.slug}`} className="btn btn-primary btn-sm">Turn it into a study plan</Link>
      </div>
      <div className="mt-10 space-y-10">
        {p.modules.map((m, mi) => (
          <section key={m.key} aria-labelledby={`m-${m.key}`}>
            <h2 id={`m-${m.key}`} className="flex items-baseline gap-3 text-xl font-bold">
              <span className="font-mono text-sm text-quiet">{String(mi + 1).padStart(2, "0")}</span>
              {m.title}
            </h2>
            <p className="mt-1 text-sm text-quiet">{m.summary}</p>
            <ol className="mt-4 divide-y divide-fg/[.07] rounded-2xl border border-fg/10 bg-card">
              {m.topics.map((t) => {
                const post = postFor(p.slug, `${m.key}/${t.key}`);
                return (
                  <li key={t.key}>
                    {post ? (
                      <Link href={postHref(post.slug)} className="group flex items-start justify-between gap-4 px-4 py-3.5 hover:bg-fg/[.03]">
                        <span className="min-w-0">
                          <span className="block font-semibold group-hover:text-blue-light">{t.title}</span>
                          <span className="mt-0.5 line-clamp-2 block text-sm text-soft">{post.summary}</span>
                        </span>
                        <span className="shrink-0 pt-0.5 text-xs text-quiet">{post.minutes} min</span>
                      </Link>
                    ) : (
                      <span className="block px-4 py-3.5 font-semibold">{t.title}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
