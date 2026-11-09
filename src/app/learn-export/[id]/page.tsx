import type { Metadata } from "next";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { requireUser } from "@/lib/learn/auth";
import { getPlan } from "@/lib/learn/data";
import { fmtHours } from "@/lib/learn/analytics";
import { getPath } from "@/data/learn/paths";
import { PrintBar } from "./PrintBar";

export const metadata: Metadata = { title: "Notes export", robots: { index: false } };

const clean = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: ["h1", "h2", "h3", "p", "br", "strong", "b", "em", "i", "s", "u", "mark", "code", "pre", "blockquote", "ul", "ol", "li", "a", "hr", "label", "input", "div", "span"],
    allowedAttributes: { a: ["href"], ul: ["data-type"], li: ["data-type", "data-checked"], input: ["type", "checked", "disabled"], code: ["class"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: { input: (tag, attribs) => ({ tagName: "input", attribs: { ...attribs, disabled: "" } }) },
  });

export default async function ExportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ item?: string; print?: string }> }) {
  const { id } = await params;
  const { item, print } = await searchParams;
  const user = await requireUser(`/learn/plans/${id}/`);
  const data = await getPlan(user.id, id);
  if (!data) notFound();
  const path = data.plan.path_slug ? getPath(data.plan.path_slug) : undefined;
  const links = new Map<string, { label: string; url: string }[]>();
  path?.modules.forEach((m) => m.topics.forEach((t) => links.set(`${m.key}/${t.key}`, [...(t.links ?? []), ...(m.links ?? [])])));
  const goals = new Map<string, string>();
  path?.modules.forEach((m) => m.topics.forEach((t) => goals.set(`${m.key}/${t.key}`, t.goal)));
  const items = item ? data.items.filter((i) => i.id === item) : data.items;
  if (!items.length) notFound();
  let mod = "";

  return (
    <div className="min-h-screen bg-white text-[#0b1220]">
      <PrintBar auto={print === "1"} />
      <article className="pdoc mx-auto max-w-[760px] px-6 py-10 print:p-0">
        <header className="border-b border-[#e3e8f2] pb-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#0a63c9]">Invicly Learn · {item ? "Topic notes" : "Plan notes"}</div>
          <h1 className="mt-2 text-[30px] font-extrabold leading-tight">{item ? items[0].title : data.plan.title}</h1>
          <p className="mt-1 text-sm text-[#5f6c86]">
            {item ? `${data.plan.title} · ${items[0].module_title}` : `${items.length} topics`} · exported {new Date().toISOString().slice(0, 10)}
          </p>
        </header>
        {items.map((i) => {
          const showMod = !item && i.module_title !== mod;
          mod = i.module_title;
          const topicLinks = [...(i.topic_key ? links.get(i.topic_key) ?? [] : []), ...i.myLinks];
          const goal = i.topic_key ? goals.get(i.topic_key) : undefined;
          return (
            <section key={i.id} className="break-inside-avoid-page">
              {showMod && <h2 className="mt-10 border-b-2 border-[#0A84FF] pb-1 text-xl font-extrabold">{i.module_title}</h2>}
              {!item && <h3 className="mt-7 text-lg font-bold">{i.completed_on ? "✓ " : ""}{i.title}</h3>}
              <p className="mt-2 text-[13px] text-[#5f6c86]">
                {i.completed_on ? `Done ${i.completed_on}` : "Not done"} · {i.tracked_minutes ? `${fmtHours(i.tracked_minutes / 60)} tracked of ` : "Estimate "}
                {fmtHours(i.est_hours)} · scheduled {i.scheduled_start === i.scheduled_end ? i.scheduled_start : `${i.scheduled_start} → ${i.scheduled_end}`}
              </p>
              {goal && <p className="mt-3 rounded-lg bg-[#f3f6fb] px-3 py-2 text-[14px]"><b>Goal:</b> {goal}</p>}
              {i.subtopics.length > 0 && (
                <>
                  <h4 className="mt-4 text-sm font-bold">Subtopics</h4>
                  <ul className="mt-1.5 space-y-1 text-[14px]">
                    {i.subtopics.map((s) => (
                      <li key={s.id} className="flex gap-2">
                        <span className="mt-[3px] inline-grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[3px] border border-[#8a95ab] text-[10px] leading-none">{s.done_on ? "✓" : ""}</span>
                        <span className={s.done_on ? "text-[#5f6c86] line-through" : ""}>{s.title}</span>
                        <span className="ml-auto shrink-0 text-xs text-[#8a95ab]">
                          {s.tracked ? `${fmtHours(s.tracked / 60)} / ` : ""}{s.est_minutes ? fmtHours(s.est_minutes / 60) : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {topicLinks.length > 0 && (
                <>
                  <h4 className="mt-4 text-sm font-bold">References</h4>
                  <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-[14px]">
                    {topicLinks.map((l) => (
                      <li key={l.url}>
                        <a href={l.url} className="text-[#0a63c9] underline">{l.label}</a> <span className="text-xs text-[#8a95ab]">{l.url}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <h4 className="mt-4 text-sm font-bold">Notes</h4>
              {i.notes ? (
                <div className="pdoc-notes mt-1.5" dangerouslySetInnerHTML={{ __html: clean(i.notes) }} />
              ) : (
                <p className="mt-1.5 text-[14px] italic text-[#8a95ab]">No notes yet.</p>
              )}
            </section>
          );
        })}
      </article>
    </div>
  );
}
