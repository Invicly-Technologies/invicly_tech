import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpenCheck, Clock, ExternalLink, FlaskConical, GraduationCap, Lightbulb, ListChecks, Newspaper, Shapes, Target } from "lucide-react";
import { getPath } from "@/data/learn/paths";
import { getExplainer } from "@/data/learn/explainers";
import { getExtra } from "@/data/learn/extra";
import { BLOG_PUBLISHED, postFor, postHref, seriesHref, type BlogPost } from "@/data/learn/blog";
import {
  CopyLink,
  Flashcards,
  LearnedButton,
  MobileJump,
  PageToc,
  Practice,
  Quiz,
  SelfCheck,
  ShareButtons,
  SidebarTopics,
  StepVisual,
  TopicKeys,
} from "@/components/learn/ExplainerUI";
import { CopyButton } from "@/components/learn/CopyButton";
import { PathIcon } from "@/components/learn/bits";
import { fmtHours } from "@/lib/learn/analytics";
import { JsonLd, abs, breadcrumbLd, organizationRef } from "@/lib/seo";

export function articleData(post: BlogPost) {
  const path = getPath(post.pathSlug)!;
  const mod = path.modules.find((m) => m.key === post.moduleKey)!;
  const t = mod.topics.find((x) => `${mod.key}/${x.key}` === post.topicKey)!;
  const ex = getExplainer(post.pathSlug, post.topicKey)!;
  const extra = getExtra(post.pathSlug, post.topicKey);
  return { path, mod, t, ex, extra };
}

const fmtDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${y}`;
};

/** A topic's full visual explainer, published as a blog post at /blog/<slug>/. */
export function ExplainerArticle({ post, modified }: { post: BlogPost; modified: string }) {
  const { path, mod, t, ex, extra } = articleData(post);
  const slug = path.slug;
  const key = post.topicKey;
  const steps = t.subtopics ?? [];
  const perStep = steps.length ? Math.max(5, Math.round((t.hours * 60) / steps.length / 5) * 5) : 0;
  const links = [...(t.links ?? []), ...(mod.links ?? [])];
  const visuals = [...ex.visuals, ...(extra?.moreVisuals ?? [])];
  const pageUrl = postHref(post.slug);

  const flat = path.modules.flatMap((m) => m.topics.map((x) => ({ key: `${m.key}/${x.key}`, title: x.title })));
  const idx = flat.findIndex((f) => f.key === key);
  const hrefOf = (k: string) => {
    const p = postFor(slug, k);
    return p ? postHref(p.slug) : `/learn/paths/${slug}/`;
  };
  const prev = flat[idx - 1];
  const next = flat[idx + 1];
  const allKeys = flat.map((f) => f.key);

  const toc = [
    { id: "in-short", label: "In short" },
    ...(extra?.plain?.length ? [{ id: "simply", label: "Explained simply" }] : []),
    { id: "diagrams", label: visuals.length > 1 ? "Diagrams" : "Diagram" },
    ...(extra?.deepDive?.length ? [{ id: "in-depth", label: "In depth" }] : []),
    ...(steps.length ? [{ id: "steps", label: "Learning steps" }] : []),
    { id: "key-points", label: "Key points" },
    { id: "terms", label: "Key terms" },
    ...(ex.example || extra?.examples?.length ? [{ id: "examples", label: "Examples" }] : []),
    ...(extra?.cheatSheet?.length ? [{ id: "reference", label: "Quick reference" }] : []),
    ...(ex.pitfalls?.length ? [{ id: "mistakes", label: "Common mistakes" }] : []),
    ...(extra?.quiz?.length ? [{ id: "quiz", label: "Quiz" }] : []),
    ...(extra?.practice?.length ? [{ id: "practice", label: "Practice" }] : []),
    { id: "check", label: "Check yourself" },
    ...(extra?.faq?.length ? [{ id: "faq", label: "FAQ" }] : []),
    ...(links.length ? [{ id: "deeper", label: "Go deeper" }] : []),
  ];

  return (
    <div className="wrap py-8 md:py-12">
      <TopicKeys prev={prev ? hrefOf(prev.key) : undefined} next={next ? hrefOf(next.key) : undefined} />
      <JsonLd
        data={[
          {
            "@type": ["BlogPosting", "LearningResource"],
            "@id": abs(`${pageUrl}#article`),
            headline: `${t.title}: explained visually`,
            name: t.title,
            description: ex.summary,
            url: abs(pageUrl),
            mainEntityOfPage: abs(pageUrl),
            image: abs(`${pageUrl}og.png`),
            datePublished: BLOG_PUBLISHED,
            dateModified: modified,
            author: organizationRef,
            publisher: { ...organizationRef, logo: { "@type": "ImageObject", url: abs("/brand/invicly-mark-256.png") } },
            articleSection: path.title,
            keywords: post.keywords.join(", "),
            inLanguage: "en",
            isAccessibleForFree: true,
            timeRequired: `PT${post.minutes}M`,
            learningResourceType: "Explainer",
            educationalLevel: path.level,
            teaches: t.goal,
            isPartOf: { "@type": "Course", "@id": abs(`/learn/paths/${slug}/#course`), name: path.title, url: abs(`/learn/paths/${slug}/`) },
          },
          ...(extra?.faq?.length
            ? [{ "@type": "FAQPage", mainEntity: extra.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }]
            : []),
          breadcrumbLd([
            { name: "Blog", path: "/blog/" },
            { name: path.title, path: seriesHref(slug) },
            { name: t.title, path: pageUrl },
          ]),
        ]}
      />
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-quiet">
        <Link href="/blog/" className="hover:text-fg">Blog</Link>
        <span>/</span>
        <Link href={seriesHref(slug)} className="hover:text-fg">{path.title}</Link>
        <span>/</span>
        <span className="text-muted">{mod.title}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue/40 bg-blue/[.07] px-3 py-1 text-xs font-bold text-blue-light">
                <Shapes size={13} aria-hidden /> Visual explainer
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-fg/15 px-3 py-1 text-xs font-semibold text-muted"><Clock size={12} aria-hidden /> {fmtHours(t.hours)} to learn</span>
              {steps.length > 0 && <span className="inline-flex items-center gap-1 rounded-full border border-fg/15 px-3 py-1 text-xs font-semibold text-muted"><ListChecks size={12} aria-hidden /> {steps.length} steps</span>}
            </div>
            <h1 className="mt-4 text-[34px] font-extrabold leading-[1.1] tracking-[-1.2px] md:text-[48px]">{t.title}</h1>
            <p className="mt-3 flex gap-2 text-lg leading-relaxed text-muted"><Target size={20} className="mt-1 shrink-0 text-blue-light" aria-hidden />{t.goal}</p>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-quiet">
              <span className="inline-flex items-center gap-1.5"><Newspaper size={14} aria-hidden /> By <b className="text-muted">Invicly Tech</b></span>
              <span>·</span>
              <span>{post.minutes} min read</span>
              <span>·</span>
              <time dateTime={BLOG_PUBLISHED}>{fmtDay(BLOG_PUBLISHED)}</time>
              <span>·</span>
              <Link href={seriesHref(slug)} className="hover:text-fg">Part of <b className="text-muted">{path.title}</b></Link>
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <LearnedButton pathSlug={slug} topicKey={key} />
              <CopyLink />
              <span className="text-xs text-quiet">Topic {idx + 1} of {flat.length} · use ← → to move between topics</span>
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

          {extra?.plain?.length ? (
            <section id="simply" className="mt-10 scroll-mt-24" aria-labelledby="simply-h">
              <h2 id="simply-h" className="text-2xl font-bold">Explained simply</h2>
              <div className="mt-3 space-y-4 text-[16.5px] leading-[1.75] text-soft">
                {extra.plain.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          ) : null}

          <section id="diagrams" className="mt-10 scroll-mt-24 space-y-6" aria-label="Diagrams">
            <p className="text-sm text-quiet">Press <b className="text-fg">Play</b> on a diagram to walk through it one step at a time.</p>
            {visuals.map((v, i) => (
              <StepVisual key={i} v={v} />
            ))}
          </section>

          {extra?.deepDive?.length ? (
            <section id="in-depth" className="mt-12 scroll-mt-24" aria-labelledby="deep-h">
              <h2 id="deep-h" className="text-2xl font-bold">In depth</h2>
              <div className="mt-4 space-y-8">
                {extra.deepDive.map((d, i) => (
                  <div key={i}>
                    <h3 className="text-lg font-bold">{d.heading}</h3>
                    <div className="mt-2 space-y-3 text-[16px] leading-[1.75] text-soft">
                      {d.body.split(/\n\n+/).map((para, k) => (
                        <p key={k}>{para}</p>
                      ))}
                    </div>
                    {d.bullets?.length ? (
                      <ul className="mt-3 space-y-1.5 text-[15.5px] leading-relaxed text-soft">
                        {d.bullets.map((b) => (
                          <li key={b} className="flex gap-2.5"><span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-blue" aria-hidden />{b}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

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
              <Flashcards terms={ex.terms} storageKey={`il-cards:${slug}:${key}`} />
            </div>
          </section>

          {(ex.example || extra?.examples?.length) && (
            <section id="examples" className="mt-10 scroll-mt-24 space-y-5" aria-labelledby="ex-h">
              <h2 id="ex-h" className="text-2xl font-bold">Examples</h2>
              {ex.example && <CodeCard lang={ex.example.lang} code={ex.example.code} caption={ex.example.caption} />}
              {extra?.examples?.map((e, i) => (
                <div key={i} className="surface rounded-3xl p-5 md:p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold"><GraduationCap size={18} className="text-blue-light" aria-hidden /> {e.title}</h3>
                  <p className="mt-2 whitespace-pre-line text-[15.5px] leading-relaxed text-soft">{e.explanation}</p>
                  {e.code && <div className="mt-4"><CodeCard lang={e.code.lang} code={e.code.code} /></div>}
                </div>
              ))}
            </section>
          )}

          {extra?.cheatSheet?.length ? (
            <section id="reference" className="surface mt-10 scroll-mt-24 rounded-3xl p-6" aria-labelledby="ref-h">
              <h2 id="ref-h" className="text-lg font-bold">Quick reference</h2>
              <ul className="mt-3 divide-y divide-fg/[.07]">
                {extra.cheatSheet.map((c) => (
                  <li key={c} className="py-2 font-mono text-[13.5px] leading-relaxed text-soft">{c}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {ex.pitfalls && ex.pitfalls.length > 0 && (
            <section id="mistakes" className="mt-10 scroll-mt-24 rounded-3xl border border-warn/30 bg-warn/[.06] p-6" aria-labelledby="pit-h">
              <h2 id="pit-h" className="flex items-center gap-2 text-lg font-bold"><AlertTriangle size={18} className="text-warn" aria-hidden /> Common mistakes</h2>
              <ul className="mt-3 space-y-2">
                {ex.pitfalls.map((p) => (
                  <li key={p} className="flex gap-2 text-[15px] leading-snug text-soft"><span className="text-warn" aria-hidden>✕</span>{p}</li>
                ))}
              </ul>
            </section>
          )}

          {extra?.quiz?.length ? (
            <section id="quiz" className="mt-10 scroll-mt-24" aria-labelledby="quiz-h">
              <h2 id="quiz-h" className="text-2xl font-bold">Quick quiz</h2>
              <p className="mb-4 mt-1 text-sm text-quiet">Pick an answer to see if you're right and why.</p>
              <Quiz items={extra.quiz} storageKey={`il-quiz:${slug}:${key}`} />
            </section>
          ) : null}

          {extra?.practice?.length ? (
            <section id="practice" className="mt-10 scroll-mt-24" aria-labelledby="practice-h">
              <h2 id="practice-h" className="flex items-center gap-2 text-2xl font-bold"><FlaskConical size={22} className="text-blue-light" aria-hidden /> Practice exercises</h2>
              <p className="mb-4 mt-1 text-sm text-quiet">Try each one yourself first. Use the hint if you get stuck, then compare with the solution.</p>
              <Practice items={extra.practice} storageKey={`il-practice:${slug}:${key}`} />
            </section>
          ) : null}

          <section id="check" className="mt-10 scroll-mt-24" aria-labelledby="check-h">
            <h2 id="check-h" className="text-2xl font-bold">Check yourself</h2>
            <p className="mb-4 mt-1 text-sm text-quiet">Answer in your head, reveal, then be honest with yourself.</p>
            <SelfCheck check={ex.check} storageKey={`il-check:${slug}:${key}`} />
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-ok/30 bg-ok/[.05] p-4">
              <p className="flex-1 text-sm text-soft">Feel confident about this topic?</p>
              <LearnedButton pathSlug={slug} topicKey={key} />
            </div>
          </section>

          {extra?.faq?.length ? (
            <section id="faq" className="mt-10 scroll-mt-24" aria-labelledby="faq-h">
              <h2 id="faq-h" className="text-2xl font-bold">Frequently asked questions</h2>
              <dl className="mt-4 divide-y divide-fg/[.08] rounded-2xl border border-fg/10 bg-card">
                {extra.faq.map((f) => (
                  <div key={f.q} className="px-5 py-4">
                    <dt className="font-semibold">{f.q}</dt>
                    <dd className="mt-1.5 text-[15px] leading-relaxed text-soft">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

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

          <div className="mt-10 border-t border-fg/10 pt-6">
            <ShareButtons title={`${t.title}: explained visually`} path={pageUrl} />
          </div>

          <nav aria-label="Topic navigation" className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={hrefOf(prev.key)} className="surface group rounded-2xl p-4 hover:border-blue/50">
                <span className="flex items-center gap-1 text-xs text-quiet"><ArrowLeft size={13} aria-hidden /> Previous</span>
                <span className="mt-1 block font-bold group-hover:text-blue-light">{prev.title}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link href={hrefOf(next.key)} className="surface group rounded-2xl p-4 text-right hover:border-blue/50">
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
              current={key}
              total={allKeys}
              moduleTitle={mod.title}
              topics={mod.topics.map((x) => ({ key: `${mod.key}/${x.key}`, title: x.title, href: hrefOf(`${mod.key}/${x.key}`) }))}
            />
          </div>
          <div className="mt-6 px-1"><PageToc items={toc} /></div>
        </aside>
      </div>
    </div>
  );
}

function CodeCard({ lang, code, caption }: { lang: string; code: string; caption?: string }) {
  return (
    <div className="force-dark overflow-hidden rounded-3xl border border-fg/10 bg-[#0a0f1c]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-2.5">
        <span className="font-mono text-xs font-medium text-[#8fa0bd]">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-[#dce6fa]"><code>{code}</code></pre>
      {caption && <p className="border-t border-white/10 px-5 py-3 text-[13px] text-[#9fb0cc]">{caption}</p>}
    </div>
  );
}
