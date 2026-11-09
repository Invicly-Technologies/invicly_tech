import type { Metadata } from "next";
import { NewPlanForm, type PathOption } from "@/components/learn/NewPlanForm";
import { paths, pathHours, pathTopicCount, PATH_CATEGORIES } from "@/data/learn/paths";
import { pathToTree } from "@/lib/learn/tree";
import { requireUser } from "@/lib/learn/auth";
import { todayIn } from "@/lib/learn/dates";

export const metadata: Metadata = { title: "New plan", robots: { index: false } };

export default async function NewPlanPage({ searchParams }: { searchParams: Promise<{ path?: string }> }) {
  const { path } = await searchParams;
  const user = await requireUser(`/learn/plans/new/${path ? `?path=${path}` : ""}`);
  const options: PathOption[] = paths.map((p) => ({
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    icon: p.icon,
    category: p.category,
    level: p.level,
    hours: pathHours(p),
    topics: pathTopicCount(p),
    tree: pathToTree(p),
  }));
  return (
    <div className="wrap py-10 md:py-14">
      <span className="eyebrow">New plan</span>
      <h1 className="mt-3 text-[34px] font-extrabold tracking-[-1.2px] md:text-[44px]">Build your study plan</h1>
      <p className="mt-2 max-w-2xl text-muted">Pick a path, shape it into your own, choose your hours for each weekday, and check the timeline before you commit.</p>
      <div className="mt-8">
        <NewPlanForm options={options} categories={PATH_CATEGORIES} initial={path} today={todayIn(user.tz)} />
      </div>
    </div>
  );
}
