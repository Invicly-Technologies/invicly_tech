"use client";
import { NotionEditor } from "@/components/learn/LazyNotionEditor";
import { savePlanNotes } from "@/app/learn/actions";

export function PlanNotebook({ planId, initial, title }: { planId: string; initial: string; title: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-[32px] font-bold tracking-tight">{title} notebook</h2>
      <p className="mt-1 text-sm text-quiet">One page for everything about this plan: goals, cheat sheets, links, questions. Saves as you type.</p>
      <div className="mt-10">
        <NotionEditor
          label={`${title} notebook`}
          initial={initial}
          placeholder="Start writing… type '/' for headings, to-do lists, code blocks and more"
          onSave={(html) => savePlanNotes(planId, html)}
          className="min-h-[50vh]"
        />
      </div>
    </div>
  );
}
