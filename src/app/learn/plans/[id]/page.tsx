import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info, LayoutDashboard, Library, ListChecks, Network, NotebookPen } from "lucide-react";
import { PlanResources } from "@/components/learn/PlanResources";
import { ExportMenu } from "@/components/learn/exportNotes";
import { visualHref } from "@/data/learn/blog";
import { PlanMindMap } from "@/components/learn/PlanMindMap";
import { PlanNotebook } from "@/components/learn/PlanNotebook";
import { requireUser } from "@/lib/learn/auth";
import { addDays, DAY_LABELS, diffDays, fmtDate, fmtLong, todayIn } from "@/lib/learn/dates";
import { getActivity, getPlan, getRecentLogs } from "@/lib/learn/data";
import { fmtHours, planStats, planWeek } from "@/lib/learn/analytics";
import { getPath } from "@/data/learn/paths";
import { Bar, PathIcon, ProgressRing, StatTile, StatusBadge } from "@/components/learn/bits";
import { BurnUpChart, Heatmap } from "@/components/learn/charts";
import { LogStudyForm, PlanControls, RecentLogs, ScheduleList, type ScheduleItem } from "@/components/learn/tracking";

export const metadata: Metadata = { title: "Plan", robots: { index: false } };

const TABS = [
  ["overview", "Overview", LayoutDashboard],
  ["schedule", "Schedule", ListChecks],
  ["map", "Mind map", Network],
  ["resources", "Resources", Library],
  ["notes", "Notebook", NotebookPen],
] as const;
type Tab = (typeof TABS)[number][0];

export default async function PlanPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const tabParam = (await searchParams).tab;
  const tab: Tab = TABS.some(([k]) => k === tabParam) ? (tabParam as Tab) : "overview";
  const user = await requireUser(`/learn/plans/${id}/`);
  const data = await getPlan(user.id, id);
  if (!data) notFound();
  const { plan, items } = data;
  const today = todayIn(user.tz);
  const [activity, logs] = await Promise.all([getActivity(user.id, addDays(today, -26 * 7), plan.id), getRecentLogs(user.id, plan.id, 6)]);
  const s = planStats(plan, items, today);
  const path = plan.path_slug ? getPath(plan.path_slug) : undefined;

  // Attach goals and doc links from the path definition.
  const topicInfo = new Map<string, { goal: string; links?: { label: string; url: string }[] }>();
  path?.modules.forEach((m) => m.topics.forEach((t) => topicInfo.set(`${m.key}/${t.key}`, { goal: t.goal, links: [...(t.links ?? []), ...(m.links ?? [])] })));
  const schedule: ScheduleItem[] = items.map((i) => ({
    ...i,
    ...(i.topic_key ? topicInfo.get(i.topic_key) : {}),
    visual_href: plan.path_slug && i.topic_key ? visualHref(plan.path_slug, i.topic_key) : undefined,
  }));

  const modules = [...new Set(items.map((i) => i.module_title))].map((title) => {
    const list = items.filter((i) => i.module_title === title);
    const total = list.reduce((a, i) => a + i.est_hours, 0);
    const done = list.reduce((a, i) => a + (i.completed_on ? i.est_hours : 0), 0);
    return { title, total, done, count: list.length, doneCount: list.filter((i) => i.completed_on).length };
  });

  const slip = diffDays(s.plannedEnd, s.projectedEnd);
  const week = planWeek(plan);
  const subTotal = items.reduce((a, i) => a + i.subtopics.length, 0);
  const subDone = items.reduce((a, i) => a + i.subtopics.filter((x) => x.done_on).length, 0);
  const daysText = [1, 2, 3, 4, 5, 6, 0].filter((d) => week[d] > 0).map((d) => `${DAY_LABELS[d]} ${fmtHours(week[d])}`).join(" · ");
  const weekTotal = week.reduce((a, b) => a + b, 0);
  const openTopics = items.filter((i) => !i.completed_on || i.completed_on === today).map((i) => ({ id: i.id, title: i.title }));

  return (
    <div className="wrap py-8 md:py-12">
      <Link href="/learn/dashboard/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted hover:text-fg">
        <ArrowLeft size={16} aria-hidden /> Dashboard
      </Link>

      <div className="mt-3 flex flex-col gap-5">
        <div className="flex min-w-0 items-start gap-4">
          {path && <PathIcon icon={path.icon} className="hidden h-14 w-14 sm:grid" size={26} />}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={s.status} detail={s.status === "behind" ? `${s.overdue} overdue` : undefined} />
              {path && (
                <Link href={`/learn/paths/${path.slug}/`} className="-my-2 inline-block py-2 text-xs font-semibold text-quiet hover:text-fg">
                  Path: {path.title} ↗
                </Link>
              )}
            </div>
            <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-[-1px] md:text-[40px]">{plan.title}</h1>
            {plan.description && <p className="mt-1 text-muted">{plan.description}</p>}
            <p className="mt-2 text-sm text-quiet">
              {fmtLong(plan.start_date)} → {fmtLong(s.plannedEnd)} · {fmtHours(weekTotal)}/week
            </p>
            <p className="mt-0.5 text-xs text-quiet">{daysText}
            </p>
          </div>
        </div>
        <PlanControls plan={{ id: plan.id, title: plan.title, status: plan.status, week }} extra={<ExportMenu planId={plan.id} planTitle={plan.title} items={schedule} />} />
      </div>

      {s.status === "behind" && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#FF9F0A]/40 bg-[#FF9F0A]/[.07] p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="flex gap-2 text-warn">
            <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              {s.overdue} topic{s.overdue > 1 ? "s are" : " is"} past due. At your current pace you would finish on <b>{fmtDate(s.projectedEnd, { day: "numeric", month: "short", year: "numeric" })}</b>
              {slip > 0 ? `, ${slip} day${slip > 1 ? "s" : ""} later than planned` : ""}. Use <b>Rebalance from today</b> to move everything forward, or raise your hours in Settings.
            </span>
          </p>
        </div>
      )}

      <nav aria-label="Plan sections" data-tour="plan-tabs" className="sticky top-16 z-30 -mx-5 mt-8 overflow-x-auto border-b border-fg/10 bg-ground/85 px-5 backdrop-blur md:-mx-10 md:px-10">
        <div className="flex gap-1">
          {TABS.map(([k, l, I]) => (
            <Link
              key={k}
              href={k === "overview" ? `/learn/plans/${plan.id}/` : `/learn/plans/${plan.id}/?tab=${k}`}
              scroll={false}
              aria-current={tab === k ? "page" : undefined}
              className={`relative inline-flex min-h-12 shrink-0 items-center gap-2 px-3 text-sm font-bold transition-colors ${tab === k ? "text-fg" : "text-quiet hover:text-fg"}`}
            >
              <I size={16} aria-hidden /> {l}
              {tab === k && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded bg-blue" />}
            </Link>
          ))}
        </div>
      </nav>

      {tab === "overview" && (<>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr]">
        <div className="surface flex items-center gap-5 rounded-2xl p-5 sm:col-span-2 lg:col-span-1">
          <ProgressRing pct={s.pct} label="by hours" />
          <div className="text-sm">
            <div className="font-bold">{s.done} of {s.total} topics</div>
            <div className="mt-1 text-quiet">{fmtHours(s.doneHours)} of {fmtHours(s.totalHours)}</div>
            {subTotal > 0 && <div className="mt-1 text-quiet">{subDone} of {subTotal} subtopics</div>}
          </div>
        </div>
        <StatTile label="Expected by today" value={fmtHours(s.expectedHours)} hint={`You have done ${fmtHours(s.doneHours)}`} />
        <StatTile label="Remaining" value={fmtHours(Math.max(0, s.totalHours - s.doneHours))} hint={`${s.total - s.done} topics left`} />
        <StatTile
          label={s.status === "completed" ? "Finished" : "Projected finish"}
          value={fmtDate(s.status === "completed" ? s.plannedEnd : s.projectedEnd)}
          hint={s.status === "completed" ? "Plan complete" : slip > 0 ? `${slip} days after plan` : "on or before plan"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="surface min-w-0 rounded-3xl p-6" aria-labelledby="burn-h">
          <h2 id="burn-h" className="text-xl font-bold">Planned vs actual</h2>
          <p className="mt-1 text-sm text-quiet">Cumulative study hours. When the blue line is under the amber one, you are behind schedule.</p>
          <div className="mt-5"><BurnUpChart series={s.series} today={today} total={s.totalHours} /></div>
        </section>
        <section className="surface rounded-3xl p-6" aria-labelledby="mod-h">
          <h2 id="mod-h" className="text-xl font-bold">Modules</h2>
          <ul className="mt-5 space-y-4">
            {modules.map((m) => (
              <li key={m.title}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">{m.title}</span>
                  <span className="shrink-0 text-xs text-quiet">{m.doneCount}/{m.count}</span>
                </div>
                <Bar pct={(m.done / m.total) * 100} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="surface min-w-0 rounded-3xl p-6" aria-labelledby="pact-h">
          <h2 id="pact-h" className="text-xl font-bold">Activity on this plan</h2>
          <div className="mt-4"><Heatmap data={activity} today={today} weeks={20} /></div>
          <h3 className="mt-6 text-sm font-bold">Recent sessions</h3>
          <div className="mt-2"><RecentLogs logs={logs} today={today} /></div>
        </section>
        <section className="surface rounded-3xl p-6" aria-labelledby="plog-h">
          <h2 id="plog-h" className="text-xl font-bold">Log study time</h2>
          <div className="mt-4"><LogStudyForm today={today} planId={plan.id} topics={openTopics} /></div>
        </section>
      </div>
      </>)}

      {tab === "schedule" && (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <section className="surface min-w-0 rounded-3xl p-6" aria-labelledby="sched-h">
            <h2 id="sched-h" className="text-xl font-bold">Schedule</h2>
            <p className="mb-5 mt-1 text-sm text-quiet">Tick topics as you finish them. Open a topic for its goal, docs and your notes.</p>
            <ScheduleList items={schedule} today={today} planTitle={plan.title} planId={plan.id} />
          </section>
          <section className="surface rounded-3xl p-6 lg:sticky lg:top-36 lg:self-start" aria-labelledby="plog2-h">
            <h2 id="plog2-h" className="text-xl font-bold">Log study time</h2>
            <div className="mt-4"><LogStudyForm today={today} planId={plan.id} topics={openTopics} /></div>
          </section>
        </div>
      )}

      {tab === "map" && (
        <div className="mt-8">
          <PlanMindMap items={schedule} today={today} planTitle={plan.title} planId={plan.id} />
        </div>
      )}

      {tab === "resources" && (
        <div className="mt-8">
          <PlanResources items={schedule} today={today} planTitle={plan.title} planId={plan.id} />
        </div>
      )}

      {tab === "notes" && (
        <div className="surface mt-8 rounded-3xl px-6 py-10 md:px-12">
          <PlanNotebook planId={plan.id} initial={plan.notes ?? ""} title={plan.title} />
        </div>
      )}
    </div>
  );
}
