import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpenCheck, Clock, ExternalLink, Lightbulb, ListChecks, Sparkles, Target } from "lucide-react";
import { getPath, paths } from "@/data/learn/paths";
import { explainerKeys, getExplainer, topicKeyFromSlug, topicSlug } from "@/data/learn/explainers";
import { CopyLink, Flashcards, LearnedButton, MobileJump, PageToc, ReadingProgress, SelfCheck, SidebarTopics, StepVisual, TopicKeys } from "@/components/learn/ExplainerUI";
import { CopyButton } from "@/components/learn/CopyButton";
import { PathIcon } from "@/components/learn/bits";
import { fmtHours } from "@/lib/learn/analytics";
import { JsonLd, abs, breadcrumbLd, organizationRef } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return paths.flatMap((p) => explainerKeys(p.slug).map((k) => ({ slug: p.slug, topic: topicSlug(k) })));
}

function lookup(slug: string, topic: string) {
  const path = getPath(slug);
  if (!path) return null;
  const key = topicKeyFromSlug(topic);
  const [mk, tk] = key.split("/");
  const mod = path.modules.find((m) => m.key === mk);
  const t = mod?.topics.find((x) => x.key === tk);
  const ex = getExplainer(slug, key);
  if (!mod || !t || !ex) return null;
  const flat = path.modules.flatMap((m) => m.topics.map((x) => ({ key: `${m.key}/${x.key}`, title: x.title, module: m.title })));
  const idx = flat.findIndex((f) => f.key === key);
  return { path, mod, t, ex, key, prev: flat[idx - 1], next: flat[idx + 1], flat };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; topic: string }> }): Promise<Metadata> {
  const { slug, topic } = await params;
  const r = lookup(slug, topic);
  if (!r) return {};
  const url = `/learn/paths/${slug}/learn/${topic}/`;
  const title = `${r.t.title} explained visually`;
  return {
    title,
    description: r.ex.summary.slice(0, 300),
    keywords: [r.t.title, ...r.ex.terms.map((x) => x.term).slice(0, 6), r.path.title],
    alternates: { canonical: url },
    openGraph: { url, type: "article", siteName: "Invicly Learn", title: `${title} | Invicly Learn`, description: r.ex.summary, section: r.path.title, images: [{ url: `${url}og.png`, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title: `${title} | Invicly Learn`, description: r.ex.summary, images: [`${url}og.png`] },
  };
}

export default async function TopicExplainer({ params }: { params: Promise<{ slug: string; topic: string }> }) {
  const { slug, topic } = await params;
  const r = lookup(slug, topic);
  if (!r) notFound();
  const { path, mod, t, ex, prev, next } = r;
  const steps = t.subtopics ?? [];
  const perStep = steps.length ? Math.max(5, Math.round((t.hours * 60) / steps.length / 5) * 5) : 0;
  const links = [...(t.links ?? []), ...(mod.links ?? [])];
  const href = (k: string) => `/learn/paths/${slug}/learn/${topicSlug(k)}/`;

  const pageUrl = `/learn/paths/${slug}/learn/${topic}/`;
  const toc = [
    { id: "in-short", label: "In short" },
    { id: "diagrams", label: ex.visuals.length > 1 ? "Diagrams" : "Diagram" },
    ...(steps.length ? [{ id: "steps", label: "Learning steps" }] : []),
    { id: "key-points", label: "Key points" },
    { id: "terms", label: "Key terms" },
    ...(ex.example ? [{ id: "example", label: "Example" }] : []),
    ...(ex.pitfalls?.length ? [{ id: "mistakes", label: "Common mistakes" }] : []),
    { id: "check", label: "Check yourself" },
    ...(links.length ? [{ id: "deeper", label: "Go deeper" }] : []),
  ];
  const allKeys = path.modules.flatMap((m) => m.topics.map((x) => `${m.key}/${x.key}`));
  const topicIndex = allKeys.indexOf(r.key) + 1;
  return (
    <div className="wrap py-8 md:py-12">
      <ReadingProgress />
      <TopicKeys prev={prev ? href(prev.key) : undefined} next={next ? href(next.key) : undefined} />
      <JsonLd
        data={[
          {
            "@type": "LearningResource",
            name: `${t.title} explained`,
            headline: `${t.title} explained visually`,
            description: ex.summary,
            url: abs(pageUrl),
            learningResourceType: "Explainer",
            educationalLevel: path.level,
            inLanguage: "en",
            isAccessibleForFree: true,
            timeRequired: `PT${Math.round(t.hours * 60)}M`,
            teaches: t.goal,
            keywords: ex.terms.map((x) => x.term).join(", "),
            author: organizationRef,
            publisher: organizationRef,
            isPartOf: { "@type": "Course", "@id": abs(`/learn/paths/${slug}/#course`), name: path.title, url: abs(`/learn/paths/${slug}/`) },
          },
          breadcrumbLd([
            { name: "Invicly Learn", path: "/learn/" },
            { name: path.title, path: `/learn/paths/${slug}/` },
            { name: t.title, path: pageUrl },
          ]),
        ]}
      />
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-quiet">
        <Link href="/learn/#paths" className="hover:text-fg">Paths</Link>
        <span>/</span>
        <Link href={`/learn/paths/${slug}/`} className="hover:text-fg">{path.title}</Link>
        <span>/</span>
        <span className="text-muted">{mod.title}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue/40 bg-blue/[.07] px-3 py-1 text-xs font-bold text-blue-light">
                <Sparkles size={13} aria-hidden /> Visual explainer
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-fg/15 px-3 py-1 text-xs font-semibold text-muted"><Clock size={12} aria-hidden /> {fmtHours(t.hours)} to learn</span>
              {steps.length > 0 && <span className="inline-flex items-center gap-1 rounded-full border border-fg/15 px-3 py-1 text-xs font-semibold text-muted"><ListChecks size={12} aria-hidden /> {steps.length} steps</span>}
            </div>
            <h1 className="mt-4 text-[34px] font-extrabold leading-[1.1] tracking-[-1.2px] md:text-[48px]">{t.title}</h1>
            <p className="mt-3 flex gap-2 text-lg leading-relaxed text-muted"><Target size={20} className="mt-1 shrink-0 text-blue-light" aria-hidden />{t.goal}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <LearnedButton pathSlug={slug} topicKey={r.key} />
              <CopyLink />
              <span className="text-xs text-quiet">Topic {topicIndex} of {allKeys.length} · use ← → to move between topics</span>
            </div>
            <div className="mt-4"><MobileJump items={toc} /></div>
          </header>

          <section id="in-short" className="mt-8 scroll-mt-24 rounded-3xl border border-blue/25 bg-gradient-to-br from-blue/[.08] to-transparent p-6 md:p-8" aria-labelledby="short-h">
            <h2 id="short-h" className="text-sm font-bold uppercase tracking-wider text-blue-light">In short</h2>
            <p className="mt-2 text-[17px] leading-relaxed">{ex.summary}</p>
            {ex.analogy && (
              <p className="mt-4 flex gap-2.5 rounded-2xl bg-card/70 p-4 text-[15px] leading-relaxed text-soft">
                <Lightbulb size={18} className="mt-0.5 shrink-0 text-warn" aria-hidden />
                <span><b className="text-fg">Think of it like this:</b> {ex.analogy}</span>
              </p>
            )}
          </section>

          <section id="diagrams" className="mt-8 scroll-mt-24 space-y-6" aria-label="Diagrams">
            <p className="text-sm text-quiet">Press <b className="text-fg">Play</b> on a diagram to walk through it one step at a time.</p>
            {ex.visuals.map((v, i) => (
              <StepVisual key={i} v={v} />
            ))}
          </section>

          {steps.length > 0 && (
            <section id="steps" className="mt-10 scroll-mt-24" aria-labelledby="steps-h">
              <h2 id="steps-h" className="text-2xl font-bold">Learn it in {steps.length} short steps</h2>
              <p className="mt-1 text-sm text-quiet">About {fmtHours(perStep / 60)} each. Track them with a timer in your plan.</p>
              <ol className="relative mt-5 space-y-3 border-l-2 border-fg/10 pl-6">
                {steps.map((s, i) => (
                  <li key={s} className="relative">
                    <span className="absolute -left-[37px] grid h-6 w-6 place-items-center rounded-full bg-blue text-[11px] font-bold text-white">{i + 1}</span>
                    <div className="flex items-baseline justify-between gap-3 rounded-xl border border-fg/[.08] bg-card px-4 py-2.5">
                      <span className="font-semibold">{s}</span>
                      <span className="shrink-0 text-xs text-quiet">~{fmtHours(perStep / 60)}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section id="key-points" className="surface mt-10 scroll-mt-24 rounded-3xl p-6" aria-labelledby="kp-h">
            <h2 id="kp-h" className="text-lg font-bold">Key points</h2>
            <ul className="mt-3 space-y-2.5">
              {ex.keyPoints.map((k) => (
                <li key={k} className="flex gap-2.5 text-[15px] leading-snug text-soft">
                  <BookOpenCheck size={17} className="mt-0.5 shrink-0 text-blue-light" aria-hidden />
                  {k}
                </li>
              ))}
            </ul>
          </section>

          <section id="terms" className="mt-10 scroll-mt-24" aria-labelledby="terms-h">
            <h2 id="terms-h" className="text-2xl font-bold">Key terms</h2>
            <div className="mt-3">
              <Flashcards terms={ex.terms} storageKey={`il-cards:${slug}:${r.key}`} />
            </div>
          </section>

          {ex.example && (
            <section id="example" className="force-dark mt-10 scroll-mt-24 overflow-hidden rounded-3xl border border-fg/10 bg-[#0a0f1c]" aria-labelledby="ex-h">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-2.5">
                <h2 id="ex-h" className="text-sm font-bold text-white">Example <span className="ml-1 font-mono text-xs font-medium text-[#8fa0bd]">{ex.example.lang}</span></h2>
                <CopyButton text={ex.example.code} />
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-[#dce6fa]"><code>{ex.example.code}</code></pre>
              {ex.example.caption && <p className="border-t border-white/10 px-5 py-3 text-[13px] text-[#9fb0cc]">{ex.example.caption}</p>}
            </section>
          )}

          {ex.pitfalls && ex.pitfalls.length > 0 && (
            <section id="mistakes" className="mt-6 scroll-mt-24 rounded-3xl border border-warn/30 bg-warn/[.06] p-6" aria-labelledby="pit-h">
              <h2 id="pit-h" className="flex items-center gap-2 text-lg font-bold"><AlertTriangle size={18} className="text-warn" aria-hidden /> Common mistakes</h2>
              <ul className="mt-3 space-y-2">
                {ex.pitfalls.map((p) => (
                  <li key={p} className="flex gap-2 text-[15px] leading-snug text-soft"><span className="text-warn" aria-hidden>✕</span>{p}</li>
                ))}
              </ul>
            </section>
          )}

          <section id="check" className="mt-10 scroll-mt-24" aria-labelledby="check-h">
            <h2 id="check-h" className="text-2xl font-bold">Check yourself</h2>
            <p className="mb-4 mt-1 text-sm text-quiet">Answer in your head, reveal, then be honest with yourself.</p>
            <SelfCheck check={ex.check} storageKey={`il-check:${slug}:${r.key}`} />
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-ok/30 bg-ok/[.05] p-4">
              <p className="flex-1 text-sm text-soft">Feel confident about this topic?</p>
              <LearnedButton pathSlug={slug} topicKey={r.key} />
            </div>
          </section>

          {links.length > 0 && (
            <section id="deeper" className="mt-10 scroll-mt-24" aria-labelledby="deeper-h">
              <h2 id="deeper-h" className="text-lg font-bold">Go deeper</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-fg/10 px-3 py-2 text-sm font-semibold hover:border-blue/50 hover:text-blue-light">
                    {l.label} <ExternalLink size={13} aria-hidden />
                  </a>
                ))}
              </div>
            </section>
          )}

          <nav aria-label="Topic navigation" className="mt-12 grid grid-cols-1 gap-3 border-t border-fg/10 pt-6 sm:grid-cols-2">
            {prev ? (
              <Link href={href(prev.key)} className="surface group rounded-2xl p-4 hover:border-blue/50">
                <span className="flex items-center gap-1 text-xs text-quiet"><ArrowLeft size={13} aria-hidden /> Previous</span>
                <span className="mt-1 block font-bold group-hover:text-blue-light">{prev.title}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link href={href(next.key)} className="surface group rounded-2xl p-4 text-right hover:border-blue/50">
                <span className="flex items-center justify-end gap-1 text-xs text-quiet">Next <ArrowRight size={13} aria-hidden /></span>
                <span className="mt-1 block font-bold group-hover:text-blue-light">{next.title}</span>
              </Link>
            )}
          </nav>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface rounded-3xl p-5">
            <div className="flex items-center gap-3">
              <PathIcon icon={path.icon} className="h-10 w-10 rounded-xl" size={18} />
              <Link href={`/learn/paths/${slug}/`} className="-my-2 py-2 text-sm font-bold leading-snug hover:text-blue-light">{path.title}</Link>
            </div>
            <Link href={`/learn/plans/new/?path=${slug}`} className="btn btn-primary btn-sm mt-4 w-full">Track this path</Link>
            <SidebarTopics
              pathSlug={slug}
              current={r.key}
              total={allKeys}
              moduleTitle={mod.title}
              topics={mod.topics.map((x) => ({ key: `${mod.key}/${x.key}`, title: x.title, href: href(`${mod.key}/${x.key}`) }))}
            />
          </div>
          <div className="mt-6 px-1"><PageToc items={toc} /></div>
        </aside>
      </div>
    </div>
  );
}
