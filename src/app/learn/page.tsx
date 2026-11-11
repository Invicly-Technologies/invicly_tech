import Link from "next/link";
import { ArrowRight, CalendarRange, Flame, LineChart, MailCheck, Network, NotebookPen, RefreshCcw, SunMoon, Wand2 } from "lucide-react";
import { paths, pathHours, pathTopicCount, PATH_CATEGORIES } from "@/data/learn/paths";
import { PathBrowser } from "@/components/learn/PathBrowser";
import { HeroCta, SignupBand } from "@/components/learn/LandingCta";
import { PathIcon, ProgressRing, Bar } from "@/components/learn/bits";
import type { Metadata } from "next";
import { BlueprintField } from "@/components/ui/BlueprintField";
import { JsonLd, abs, organizationRef } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Invicly Learn: free learning paths, study planner & progress tracker" },
  description:
    "Free roadmaps for DevOps, Python, Java, React, AWS, Kubernetes, SQL, AI engineering, system design and interview prep, with visual explainers for every topic. Plan your study days and track progress.",
  alternates: { canonical: "/learn/" },
  openGraph: { url: "/learn/", type: "website", siteName: "Invicly Learn", images: [{ url: "/learn/og.png", width: 1200, height: 630, alt: "Invicly Learn" }] },
  twitter: { card: "summary_large_image", images: ["/learn/og.png"] },
};

const features = [
  { Icon: CalendarRange, title: "A dated schedule", body: "Pick a start date, your study days and hours a day, or a finish date. Every topic gets a day on the calendar." },
  { Icon: RefreshCcw, title: "Rebalance in one click", body: "Missed a few days? Rebuild the rest of the schedule from today instead of feeling behind forever." },
  { Icon: LineChart, title: "Planned vs actual", body: "A burn-up chart shows whether you are ahead or behind, and the projected finish at your current pace." },
  { Icon: Flame, title: "Streaks & heatmap", body: "Log study time and see every day you showed up. Small daily sessions add up." },
  { Icon: Network, title: "Mind maps", body: "See any path or plan as a mind map, and build your own plan by typing: Tab for a child, Enter for a sibling." },
  { Icon: NotebookPen, title: "Notion-style notes", body: "Rich notes on every topic plus a notebook per plan. Type / for headings, to-dos and code blocks." },
  { Icon: Wand2, title: "Plans that fit you", body: "Edit any path, set different hours for each weekday, or paste a syllabus and turn it into a plan." },
  { Icon: SunMoon, title: "Light & dark", body: "Study at night or in the sun. Follows your system, or pick a theme yourself." },
  { Icon: MailCheck, title: "Your data, your account", body: "Verified email sign-in and password reset. Progress syncs across every device." },
];

export default function LearnHome() {
  return (
    <>
      <JsonLd
        data={{
          "@type": "ItemList",
          name: "Invicly Learn paths",
          itemListElement: paths.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: abs(`/learn/paths/${p.slug}/`),
            name: p.title,
          })),
        }}
      />
      <section className="relative overflow-hidden border-b border-fg/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <BlueprintField className="absolute inset-0" />
        </div>
        <div className="wrap relative grid grid-cols-1 items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div className="hero-in">
            <h1 className="text-[42px] font-extrabold leading-[1.04] tracking-[-2px] md:text-[64px]">
              Study plans you&apos;ll <span className="text-shimmer">actually finish.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              {paths.length} structured learning paths, from DevOps and Java to React, AI engineering and interview prep. Turn any path into a day-by-day plan that fits your
              time, then track every topic until it is done.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <HeroCta />
              <a href="#paths" className="btn btn-ghost">
                Browse paths
              </a>
            </div>
            <p className="mt-4 text-sm text-quiet">Browsing every path is open. An account is only needed to save a plan and track progress.</p>
          </div>

          <div className="hero-in surface relative rounded-3xl p-6 [animation-delay:.15s]" aria-hidden>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-quiet">Full DevOps with Python</div>
                <div className="mt-1 font-display text-lg font-bold">Week 6 of 18</div>
              </div>
              <span className="rounded-full border border-blue/40 bg-blue/10 px-2.5 py-1 text-xs font-bold text-blue-light">On track</span>
            </div>
            <div className="mt-6 flex items-center gap-6">
              <ProgressRing pct={34} size={104} label="done" />
              <div className="flex-1 space-y-3 text-sm">
                {[
                  ["Linux & networking", 100],
                  ["Python for automation", 72],
                  ["Containers with Docker", 20],
                ].map(([t, p]) => (
                  <div key={t as string}>
                    <div className="mb-1 flex justify-between text-[13px]">
                      <span className="text-muted">{t}</span>
                      <span className="text-quiet">{p}%</span>
                    </div>
                    <Bar pct={p as number} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-fg/10 bg-panel p-4">
              <div className="text-xs font-semibold text-quiet">Today</div>
              {["Dockerfiles & multi-stage builds", "Docker Compose for local stacks"].map((t, i) => (
                <div key={t} className="mt-3 flex items-center gap-3 text-sm">
                  <span className={`grid h-5 w-5 place-items-center rounded-md border ${i === 0 ? "border-blue bg-blue" : "border-fg/25"}`}>
                    {i === 0 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>}
                  </span>
                  <span className={i === 0 ? "text-quiet line-through" : ""}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="paths" className="wrap scroll-mt-20 py-16 md:py-20">
        <h2 className="mt-3 text-[32px] font-bold tracking-[-1.2px] md:text-[42px]">Pick where you want to go</h2>
        <p className="mt-2 text-sm text-quiet">{paths.length} paths, {paths.reduce((s, p) => s + pathTopicCount(p), 0)} topics and {Math.round(paths.reduce((s, p) => s + pathHours(p), 0))} hours of guided study</p>
        <p className="mt-3 max-w-2xl text-muted">Each path is broken into modules and topics with time estimates and links to the official docs. Open one to see the roadmap as a list or a mind map.</p>
        <div className="mt-8">
          <PathBrowser
            categories={PATH_CATEGORIES}
            paths={paths.map((p) => ({
              slug: p.slug,
              title: p.title,
              tagline: p.tagline,
              level: p.level,
              category: p.category,
              icon: p.icon,
              hours: Math.round(pathHours(p)),
              modules: p.modules.length,
              topics: pathTopicCount(p),
              tools: p.tools,
            }))}
          />
        </div>
      </section>

      <section className="border-y border-fg/10 bg-deep py-16 md:py-20">
        <div className="wrap">
          <ol className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              ["Choose a path", "Start from a default path, drop the modules you already know, or write your own."],
              ["Fit it to your time", "Set your start date, study days and hours a day, or the date you want to finish by."],
              ["Show up and tick it off", "Your dashboard shows what is due today. Mark topics done, log time and watch the charts move."],
            ].map(([t, b], i) => (
              <li key={t} className="surface rounded-2xl p-6">
                <div className="font-mono text-[13px] text-blue">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-3 text-xl font-bold">{t}</h3>
                <p className="mt-2 leading-relaxed text-soft">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap py-16 md:py-20">
        <h2 className="mt-3 text-[32px] font-bold tracking-[-1.2px] md:text-[42px]">Built for actually finishing</h2>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="surface rounded-2xl p-6">
              <f.Icon className="text-blue-light" size={24} aria-hidden />
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-soft">{f.body}</p>
            </div>
          ))}
        </div>
        <SignupBand />
      </section>
    </>
  );
}
