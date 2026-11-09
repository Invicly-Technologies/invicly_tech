import type { LearningPath } from "@/data/learn/types";
import { parseCustomTopics } from "./schedule";

export type TreeTopic = { id: string; title: string; hours: number; key?: string | null; done?: boolean; subtopics?: string[] };
export type TreeModule = { id: string; title: string; topics: TreeTopic[] };
export type PlanTree = { modules: TreeModule[] };

let n = 0;
export const uid = (p = "n") => `${p}${Date.now().toString(36)}${(n++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function pathToTree(path: LearningPath): PlanTree {
  return {
    modules: path.modules.map((m) => ({
      id: `m-${m.key}`,
      title: m.title,
      topics: m.topics.map((t) => ({ id: `t-${m.key}-${t.key}`, title: t.title, hours: t.hours, key: `${m.key}/${t.key}`, subtopics: t.subtopics ?? [] })),
    })),
  };
}

export function outlineToTree(text: string): PlanTree {
  const mods = new Map<string, TreeModule>();
  for (const t of parseCustomTopics(text)) {
    if (!mods.has(t.module)) mods.set(t.module, { id: uid("m"), title: t.module, topics: [] });
    mods.get(t.module)!.topics.push({ id: uid("t"), title: t.title, hours: t.hours, subtopics: t.subtopics });
  }
  return { modules: [...mods.values()] };
}

export const treeHours = (t: PlanTree) => t.modules.reduce((s, m) => s + m.topics.reduce((a, x) => a + (x.hours || 0), 0), 0);
export const treeTopics = (t: PlanTree) => t.modules.reduce((s, m) => s + m.topics.length, 0);
export const treeSubtopics = (t: PlanTree) => t.modules.reduce((s, m) => s + m.topics.reduce((a, x) => a + (x.subtopics?.length ?? 0), 0), 0);

/** Server-side validation of a client-submitted tree. Returns flat rows or an error message. */
export type FlatRow = { module: string; title: string; hours: number; key: string | null; subtopics: string[] };

export function flattenTree(raw: unknown): { rows: FlatRow[] } | { error: string } {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as PlanTree).modules)) return { error: "Plan content is missing" };
  const rows: FlatRow[] = [];
  for (const m of (raw as PlanTree).modules.slice(0, 60)) {
    const mt = String(m?.title ?? "").trim().slice(0, 120) || "Untitled module";
    if (!Array.isArray(m?.topics)) continue;
    for (const t of m.topics) {
      const title = String(t?.title ?? "").trim().slice(0, 200);
      if (!title) continue;
      const h = Number(t?.hours);
      const hours = Number.isFinite(h) && h > 0 ? Math.min(200, Math.round(h * 4) / 4 || 0.25) : 1;
      const key = typeof t?.key === "string" && /^[\w-]+\/[\w-]+$/.test(t.key) ? t.key : null;
      const subtopics = Array.isArray(t?.subtopics)
        ? t.subtopics.map((x: unknown) => String(x ?? "").trim().slice(0, 300)).filter(Boolean).slice(0, 30)
        : [];
      rows.push({ module: mt, title, hours, key, subtopics });
    }
  }
  if (rows.length === 0) return { error: "Add at least one topic" };
  if (rows.length > 400) return { error: "A plan can have up to 400 topics" };
  return { rows };
}
