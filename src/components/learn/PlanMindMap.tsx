"use client";
import { useMemo, useState } from "react";
import { MindMap, type TopicStatus } from "@/components/learn/MindMap";
import { TopicDrawer, type ScheduleItem } from "@/components/learn/tracking";
import type { PlanTree } from "@/lib/learn/tree";
import { fmtHours } from "@/lib/learn/analytics";
import type { ISODate } from "@/lib/learn/dates";

export function PlanMindMap({ items, today, planTitle, planId }: { items: ScheduleItem[]; today: ISODate; planTitle: string; planId: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { tree, statuses, meta } = useMemo(() => {
    const mods = new Map<string, PlanTree["modules"][number]>();
    const statuses: Record<string, TopicStatus> = {};
    const meta: Record<string, string> = {};
    for (const i of items) {
      if (i.subtopics?.length) meta[i.id] = `${i.subtopics.filter((x) => x.done_on).length}/${i.subtopics.length}`;
      if (!mods.has(i.module_title)) mods.set(i.module_title, { id: `m-${mods.size}`, title: i.module_title, topics: [] });
      mods.get(i.module_title)!.topics.push({ id: i.id, title: i.title, hours: i.est_hours });
      if (i.completed_on) statuses[i.id] = "done";
      else if (i.scheduled_end < today) statuses[i.id] = "overdue";
      else if (i.scheduled_start <= today) statuses[i.id] = "now";
    }
    return { tree: { modules: [...mods.values()] }, statuses, meta };
  }, [items, today]);
  const done = items.filter((i) => i.completed_on).length;
  return (
    <>
      <MindMap
        tree={tree}
        rootTitle={planTitle}
        rootMeta={`${done}/${items.length} topics · ${fmtHours(items.reduce((s, i) => s + i.est_hours, 0))}`}
        statuses={statuses}
        topicMeta={meta}
        onTopicOpen={setOpenId}
        height={640}
      />
      <TopicDrawer items={items} openId={openId} onOpen={setOpenId} today={today} planTitle={planTitle} planId={planId} />
    </>
  );
}
