import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { getPath, paths, pathHours, pathTopicCount } from "@/data/learn/paths";
import { PathIcon } from "@/components/learn/bits";
import { fmtHours } from "@/lib/learn/analytics";
import { estimateEnd, weekHoursFrom } from "@/lib/learn/schedule";
import { pathToTree } from "@/lib/learn/tree";
import { PathViews } from "@/components/learn/PathViews";
import { JsonLd, abs, breadcrumbLd, organizationRef } from "@/lib/seo";
import { visualHref } from "@/data/learn/blog";
import { ContinueLearning, LearnedTick, ModuleProgress } from "@/components/learn/ExplainerUI";

export const dynamicParams = false;
export function generateStaticParams() {
  return paths.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPath((await params).slug);
  if (!p) return {};
  const url = `/learn/paths/${p.slug}/`;
  return {
    title: `${p.title}: free roadmap & study plan`,
    description: `${p.description} ${pathTopicCount(p)} topics, ${pathHours(p)} hours, with visual explainers and a day-by-day plan.`.slice(0, 300),
    keywords: [p.title, `${p.title} roadmap`, ...p.tools.slice(0, 8), "free course", "study plan"],
    alternates: { canonical: url },
    openGraph: { url, type: "website", siteName: "Invicly Learn", title: `${p.title} | Invicly Learn`, description: p.tagline, images: [{ url: `${url}og.png`, width: 1200, height: 630, alt: p.title }] },
    twitter: { card: "summary_large_image", title: `${p.title} | Invicly Learn`, description: p.tagline, images: [`${url}og.png`] },
  };
}

export default async function PathPage({ params }: { params: Promise<{ slug: string }> }) {
  const path = getPath((await params).slug);
  if (!path) notFound();
  const total = pathHours(path);
  // Rough pace examples, starting on a Monday.
  const weekdays = [1, 2, 3, 4, 5];
  const paces = [1, 2, 3].map((h) => ({ h, weeks: Math.ceil((estimateEndDays(total, h, weekdays) + 1) / 7) }));

  return (
    <div className="wrap py-10 md:py-14">
      <JsonLd
        data={[
          {
            "@type": "Course",
            "@id": abs(`/learn/paths/${path.slug}/#course`),
            name: path.title,
            description: path.description,
            url: abs(`/learn/paths/${path.slug}/`),
            provider: organizationRef,
            educationalLevel: path.level,
            inLanguage: "en",
            isAccessibleForFree: true,
            teaches: path.outcomes,
            about: path.tools,
            timeRequired: `PT${Math.round(total)}H`,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD", category: "Free" },
            hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: `PT${Math.round(total)}H` },
            syllabusSections: path.modules.map((m) => ({ "@type": "Syllabus", name: m.title, description: m.summary, timeRequired: `PT${m.topics.reduce((s, t) => s + t.hours, 0)}H` })),
          },
          breadcrumbLd([
            { name: "Invicly Learn", path: "/learn/" },
            { name: path.title, path: `/learn/paths/${path.slug}/` },
          ]),
        ]}
      />
      <Link href="/learn/#paths" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted hover:text-fg">
        <ArrowLeft size={16} aria-hidden /> All paths
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div className="flex items-center gap-4">
            <PathIcon icon={path.icon} className="h-14 w-14" size={26} />
            <span className="rounded-full border border-fg/15 px-2.5 py-1 text-xs font-semibold text-muted">{path.level}</span>
            <span className="rounded-full border border-blue/30 bg-blue/[.06] px-2.5 py-1 text-xs font-semibold text-blue-light">{path.category}</span>
          </div>
          <h1 className="mt-5 text-[38px] font-extrabold leading-[1.08] tracking-[-1.5px] md:text-[52px]">{path.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{path.description}</p>

          <h2 className="mt-12 text-2xl font-bold">What you will be able to do</h2>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {path.outcomes.map((o) => (
              <li key={o} className="flex gap-3 text-[15px] leading-relaxed text-soft">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-blue" aria-hidden />
                {o}
              </li>
            ))}
          </ul>

          <div className="mt-14">
          <PathViews
            tree={pathToTree(path)}
            title={path.title}
            meta={`${path.modules.length} modules, ${total}h`}
            hrefs={Object.fromEntries(path.modules.flatMap((m) => m.topics.map((t) => [`t-${m.key}-${t.key}`, visualHref(path.slug, `${m.key}/${t.key}`) ?? ""])))}
          >
          <p className="text-sm text-quiet">Bar length shows each module&apos;s share of study time.</p>
          <ol className="relative mt-8 space-y-6 border-l border-fg/10 pl-7 md:pl-9">
            {path.modules.map((m, i) => {
              const hours = m.topics.reduce((s, t) => s + t.hours, 0);
              return (
                <li key={m.key} className="relative">
                  <span className="absolute -left-[42px] top-5 grid h-7 w-7 place-items-center rounded-full border border-blue/50 bg-ground font-mono text-xs text-blue-light md:-left-[50px]">
                    {i + 1}
                  </span>
                  <details className="surface group rounded-2xl" open={i === 0}>
                    <summary className="flex cursor-pointer list-none flex-col gap-3 p-5 md:p-6 [&::-webkit-details-marker]:hidden">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold md:text-xl">{m.title}</h3>
                          <p className="mt-1 text-[15px] text-soft">{m.summary}</p>
                        </div>
                        <span className="shrink-0 text-right text-sm">
                          <b>{fmtHours(hours)}</b>
                          <span className="block text-xs text-quiet">{m.topics.length} topics</span>
                        </span>
                      </div>
                      <ModuleProgress pathSlug={path.slug} topicKeys={m.topics.map((t) => `${m.key}/${t.key}`)} />
                      <span className="text-xs font-semibold text-blue-light group-open:hidden">Show topics</span>
                    </summary>
                    <div className="border-t border-fg/10 px-5 pb-5 md:px-6">
                      <ul className="divide-y divide-fg/[.06]">
                        {m.topics.map((t) => (
                          <li key={t.key} className="py-4">
                            <div className="flex items-start justify-between gap-4">
                              <span className="flex min-w-0 items-start gap-2">
                              <LearnedTick pathSlug={path.slug} topicKey={`${m.key}/${t.key}`} />
                              {visualHref(path.slug, `${m.key}/${t.key}`) ? (
                                <Link href={visualHref(path.slug, `${m.key}/${t.key}`)!} className="group/t font-semibold hover:text-blue-light">
                                  {t.title}
                                  <span className="ml-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-blue/10 px-2 py-0.5 align-middle text-[11px] font-bold text-blue-light group-hover/t:bg-blue-fill group-hover/t:text-white">
                                    Learn visually
                                  </span>
                                </Link>
                              ) : (
                                <span className="font-semibold">{t.title}</span>
                              )}
                              </span>
                              <span className="inline-flex shrink-0 items-center gap-1 text-sm text-quiet">
                                <Clock size={13} aria-hidden /> {fmtHours(t.hours)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-soft">{t.goal}</p>
                            {t.subtopics && t.subtopics.length > 0 && (
                              <ul className="mt-2 grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2">
                                {t.subtopics.map((st) => (
                                  <li key={st} className="flex items-start gap-2 text-[13px] leading-snug text-muted">
                                    <span className="mt-[3px] h-3 w-3 shrink-0 rounded-[4px] border border-fg/25" aria-hidden />
                                    {st}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {t.links && (
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                {t.links.map((l) => (
                                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 text-sm text-blue-light hover:text-fg">
                                    {l.label} <ExternalLink size={12} aria-hidden />
                                  </a>
                                ))}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                      {m.links && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-fg/[.06] pt-4">
                          <span className="text-xs font-semibold text-quiet">Module resources:</span>
                          {m.links.map((l) => (
                            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="chp inline-flex min-h-9 items-center hover:text-fg">
                              {l.label} ↗
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
          </PathViews>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface rounded-3xl p-6">
            <dl className="grid grid-cols-3 gap-3 text-center">
              {[
                [`${total}h`, "study"],
                [path.modules.length, "modules"],
                [pathTopicCount(path), "topics"],
              ].map(([v, l]) => (
                <div key={l as string} className="rounded-xl bg-panel py-3">
                  <dd className="font-display text-xl font-bold">{v}</dd>
                  <dt className="text-xs text-quiet">{l}</dt>
                </div>
              ))}
            </dl>
            <ContinueLearning
              pathSlug={path.slug}
              topics={path.modules.flatMap((m) => m.topics.map((t) => ({ key: `${m.key}/${t.key}`, title: t.title, href: visualHref(path.slug, `${m.key}/${t.key}`) ?? `/learn/paths/${path.slug}/` })))}
            />
            <h2 className="mt-6 text-sm font-bold">How long will it take?</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {paces.map((p) => (
                <li key={p.h} className="flex justify-between rounded-lg bg-fg/[.03] px-3 py-2">
                  <span className="text-soft">{p.h}h a day, weekdays</span>
                  <b>~{p.weeks} weeks</b>
                </li>
              ))}
            </ul>
            <Link href={`/learn/plans/new/?path=${path.slug}`} className="btn btn-primary mt-6 w-full">
              Customize &amp; start
            </Link>
            <p className="mt-3 text-center text-xs text-quiet">Next you can edit topics, set hours per weekday and preview the timeline.</p>
            <h2 className="mt-6 text-sm font-bold">Tools you will use</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {path.tools.map((t) => (
                <span key={t} className="chp">{t}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function estimateEndDays(total: number, h: number, days: number[]) {
  const start = "2026-01-05"; // a Monday
  const end = estimateEnd(total, start, weekHoursFrom(h, days));
  return (Date.parse(end) - Date.parse(start)) / 86_400_000;
}
