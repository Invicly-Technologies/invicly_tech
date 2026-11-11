import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowRight, CalendarDays, Flame, PartyPopper, Plus } from "lucide-react";
import { requireUser } from "@/lib/learn/auth";
import { addDays, diffDays, fmtDate, fmtLong, relDay, todayIn, weekStart } from "@/lib/learn/dates";
import { getActivity, getDueItems, getPlanSummaries, getRecentLogs, getTotals, getUpcomingItems, type PlanSummary } from "@/lib/learn/data";
import { fmtHours, longestStreak, streak, type PlanStatus } from "@/lib/learn/analytics";
import { getPath } from "@/data/learn/paths";
import { Bar, PathIcon, StatTile, StatusBadge } from "@/components/learn/bits";
import { Heatmap, WeeklyBars } from "@/components/learn/charts";
import { EmptyPlans, LogStudyForm, RecentLogs, TopicCheck } from "@/components/learn/tracking";
import { TimerButton } from "@/components/learn/timer";
import type { DueItem } from "@/lib/learn/data";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

function summaryStatus(p: PlanSummary, today: string): PlanStatus {
  if (p.total_items > 0 && p.done_items === p.total_items) return "completed";
  if (p.status === "paused") return "paused";
  if (today < p.start_date && p.done_items === 0) return "not-started";
  if (p.overdue > 0) return "behind";
  return "on-track";
}

function greeting(tz: string) {
  let h = 12;
  try {
    h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: tz }).format(new Date()));
  } catch {}
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function Dashboard() {
  const user = await requireUser("/learn/dashboard/");
  const today = todayIn(user.tz);
  const from = addDays(weekStart(today), -25 * 7);
  // One parallel batch: "upcoming" is only shown when nothing is due, but fetching it up front avoids a second round trip.
  const [plans, due, activity, logs, totals, upcomingAll] = await Promise.all([
    getPlanSummaries(user.id, today),
    getDueItems(user.id, today),
    getActivity(user.id, from),
    getRecentLogs(user.id),
    getTotals(user.id),
    getUpcomingItems(user.id),
  ]);
  const activeDays = activity.filter((a) => a.minutes > 0 || a.completed > 0).map((a) => a.date);
  const current = streak(new Set(activeDays), today);
  const best = longestStreak(activeDays);
  const weekMin = activity.filter((a) => a.date >= weekStart(today)).reduce((s, a) => s + a.minutes, 0);
  const active = plans.filter((p) => p.status === "active");
  const overdueCount = due.filter((d) => d.scheduled_end < today).length;
  const upcoming = due.length === 0 && active.length > 0 ? upcomingAll : [];

  return (
    <div className="wrap py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-quiet">{fmtLong(today)}</p>
          <h1 className="mt-1 text-[30px] font-extrabold tracking-[-1px] md:text-[40px]">
            {greeting(user.tz)}, <span className="text-shimmer">{user.name.split(" ")[0]}</span>
          </h1>
        </div>
        <Link href="/learn/plans/new/" className="btn btn-primary btn-sm" data-tour="new-plan">
          <Plus size={17} aria-hidden /> New plan
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Current streak"
          value={<span className="inline-flex items-center gap-2">{current}<Flame size={22} className={current ? "text-[#FF9F0A]" : "text-quiet"} aria-hidden /></span>}
          hint={`day${current === 1 ? "" : "s"} · best ${best}`}
        />
        <StatTile label="This week" value={fmtHours(weekMin / 60)} hint="study time logged" />
        <StatTile label="Topics done" value={totals.completed} hint={`${fmtHours(totals.minutes / 60)} logged in total`} />
        <StatTile label="Active plans" value={active.length} hint={plans.length > active.length ? `${plans.length - active.length} paused or finished` : "keep it focused"} />
      </div>

      {plans.length === 0 ? (
        <div className="mt-10"><EmptyPlans /></div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <section className="surface rounded-3xl p-6" aria-labelledby="today-h" data-tour="today">
              <div className="flex items-center justify-between gap-3">
                <h2 id="today-h" className="flex items-center gap-2 text-xl font-bold">
                  <CalendarDays size={20} className="text-blue-light" aria-hidden /> Today&apos;s focus
                </h2>
                {overdueCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#FF9F0A]/45 bg-[#FF9F0A]/10 px-2.5 py-1 text-xs font-bold text-warn">
                    <AlertCircle size={13} aria-hidden /> {overdueCount} overdue
                  </span>
                )}
              </div>
              {due.length === 0 ? (
                <>
                  <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-fg/15 px-6 py-8 text-center">
                    <PartyPopper size={28} className="text-blue-light" aria-hidden />
                    <p className="mt-3 font-bold">All caught up</p>
                    <p className="mt-1 text-sm text-muted">Nothing scheduled for today. Get ahead on your next topic, or take the day off.</p>
                  </div>
                  {upcoming.length > 0 && <>
                  <h3 className="mt-6 text-sm font-bold text-muted">Up next</h3>
                  <ul className="mt-3 space-y-2">
                    {upcoming.map((d) => (
                      <DueRow key={d.id} d={d} today={today} upcoming />
                    ))}
                  </ul>
                  </>}
                </>
              ) : (
                <ul className="mt-5 space-y-2">
                  {due.map((d) => (
                    <DueRow key={d.id} d={d} today={today} />
                  ))}
                </ul>
              )}
            </section>

            <section className="surface rounded-3xl p-6" aria-labelledby="log-h" data-tour="log">
              <h2 id="log-h" className="text-xl font-bold">Log study time</h2>
              <p className="mt-1 text-sm text-quiet">Every session counts toward your streak.</p>
              <div className="mt-5">
                <LogStudyForm today={today} plans={active.map((p) => ({ id: p.id, title: p.title }))} />
              </div>
            </section>
          </div>

          <section className="mt-10" aria-labelledby="plans-h">
            <h2 id="plans-h" className="text-2xl font-bold">My plans</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((p) => {
                const pct = p.total_hours ? Math.round((p.done_hours / p.total_hours) * 100) : 0;
                const st = summaryStatus(p, today);
                const path = p.path_slug ? getPath(p.path_slug) : undefined;
                const daysLeft = diffDays(today, p.end_date);
                return (
                  <Link key={p.id} href={`/learn/plans/${p.id}/`} className="card3d group surface flex flex-col rounded-3xl p-6">
                    <div className="flex items-start justify-between gap-3">
                      {path ? <PathIcon icon={path.icon} className="h-11 w-11 rounded-xl" size={20} /> : <span className="grid h-11 w-11 place-items-center rounded-xl border border-fg/20 font-display font-bold text-muted">{p.title.slice(0, 1)}</span>}
                      <StatusBadge status={st} detail={st === "behind" ? `${p.overdue} overdue` : undefined} />
                    </div>
                    <h3 className="mt-4 text-lg font-bold leading-snug">{p.title}</h3>
                    <div className="mt-4 flex items-baseline justify-between text-sm">
                      <span className="font-display text-2xl font-bold">{pct}%</span>
                      <span className="text-quiet">{p.done_items}/{p.total_items} topics · {fmtHours(p.done_hours)} of {fmtHours(p.total_hours)}</span>
                    </div>
                    <Bar pct={pct} className="mt-2" />
                    {p.next_title && (
                      <p className="mt-4 text-sm text-soft"><span className="text-quiet">Next:</span> {p.next_title}</p>
                    )}
                    <p className="mt-auto flex items-center justify-between pt-4 text-xs text-quiet">
                      <span>{st === "completed" ? "Finished. Great work!" : daysLeft >= 0 ? `Planned finish ${fmtDate(p.end_date)} · ${daysLeft} days` : `Planned finish was ${fmtDate(p.end_date)}`}</span>
                      <ArrowRight size={16} className="arr text-blue-light" aria-hidden />
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]" aria-label="Activity">
        <div className="surface min-w-0 rounded-3xl p-6" data-tour="activity">
          <h2 className="text-xl font-bold">Activity</h2>
          <p className="mt-1 text-sm text-quiet">Each square is a day: study time logged plus topics completed, last 26 weeks.</p>
          <div className="mt-5"><Heatmap data={activity} today={today} /></div>
          <h3 className="mt-8 text-base font-bold">Hours studied per week</h3>
          <div className="mt-3"><WeeklyBars data={activity} today={today} /></div>
        </div>
        <div className="surface rounded-3xl p-6">
          <h2 className="text-xl font-bold">Recent sessions</h2>
          <div className="mt-4"><RecentLogs logs={logs} today={today} /></div>
        </div>
      </section>
    </div>
  );
}

function DueRow({ d, today, upcoming = false }: { d: DueItem; today: string; upcoming?: boolean }) {
  const late = !upcoming && d.scheduled_end < today;
  return (
    <li className="rounded-2xl border border-fg/[.07] bg-panel px-4 py-3">
      <div className="flex items-center gap-3">
        <TopicCheck id={d.id} done={false} title={d.title} />
        <Link href={`/learn/plans/${d.plan_id}/?tab=schedule`} className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug hover:text-blue-light">{d.title}</span>
          <span className="mt-0.5 block truncate text-xs text-quiet">
            {d.plan_title} · {fmtHours(d.est_hours)}
            {d.subs_total > 0 && ` · ${d.subs_done}/${d.subs_total} steps`}
          </span>
        </Link>
        <span className={`hidden shrink-0 text-right text-xs sm:block ${late ? "font-bold text-warn" : "text-quiet"}`}>
          {upcoming ? relDay(d.scheduled_start, today) : late ? `Due ${relDay(d.scheduled_end, today).toLowerCase()}` : d.scheduled_end === today ? "Today" : `Until ${fmtDate(d.scheduled_end)}`}
        </span>
        {!d.next_sub_id && <TimerButton planId={d.plan_id} planTitle={d.plan_title} itemId={d.id} itemTitle={d.title} />}
      </div>
      {d.next_sub_id && (
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-fg/[.04] py-1.5 pl-3 pr-1.5 text-sm sm:ml-9">
          <span className="text-[11px] font-bold text-blue-light">Next</span>
          <span className="min-w-0 flex-1 truncate text-soft">{d.next_sub_title}</span>
          {d.next_sub_minutes && <span className="shrink-0 text-xs text-quiet">{fmtHours(d.next_sub_minutes / 60)}</span>}
          <TimerButton planId={d.plan_id} planTitle={d.plan_title} itemId={d.id} itemTitle={d.title} subtopicId={d.next_sub_id} subtopicTitle={d.next_sub_title} />
        </div>
      )}
    </li>
  );
}
