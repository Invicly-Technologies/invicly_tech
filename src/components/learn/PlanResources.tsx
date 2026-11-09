"use client";
import { useMemo, useState, useTransition } from "react";
import { ExternalLink, Plus, Search } from "lucide-react";
import { addLink } from "@/app/learn/actions";
import { TopicDrawer, type ScheduleItem } from "@/components/learn/tracking";
import { KindIcon, useAllLinks } from "@/components/learn/TopicExtras";
import { useFlash } from "@/components/learn/useFlash";
import { KIND_LABEL, LINK_KINDS, detectKind, hostOf, normalizeUrl, type LinkKind } from "@/lib/learn/links";
import type { ISODate } from "@/lib/learn/dates";
import { cn } from "@/lib/cn";

export function PlanResources({ items, today, planTitle, planId }: { items: ScheduleItem[]; today: ISODate; planTitle: string; planId: string }) {
  const all = useAllLinks(items);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<LinkKind | "all">("all");
  const [who, setWho] = useState<"all" | "mine">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState(items.find((i) => !i.completed_on)?.id ?? items[0]?.id ?? "");
  const [pending, start] = useTransition();
  const [flash, toast] = useFlash();

  const counts = useMemo(() => Object.fromEntries(LINK_KINDS.map((k) => [k, all.filter((l) => l.kind === k).length])), [all]);
  const shown = all.filter(
    (l) =>
      (kind === "all" || l.kind === kind) &&
      (who === "all" || l.mine) &&
      (!q || `${l.label} ${l.url} ${l.topic} ${l.module}`.toLowerCase().includes(q.toLowerCase())),
  );
  const groups = useMemo(() => {
    const g = new Map<string, typeof shown>();
    for (const l of shown) g.set(l.module, [...(g.get(l.module) ?? []), l]);
    return [...g.entries()];
  }, [shown]);
  const normalized = normalizeUrl(url);

  return (
    <div>
      <form
        className="surface flex flex-col gap-2 rounded-2xl p-3 md:flex-row md:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          if (!normalized || !topic) return flash({ error: "Paste a valid link and pick a topic" });
          start(async () => {
            const r = await addLink(topic, { url: normalized });
            flash(r);
            if (!r?.error) setUrl("");
          });
        }}
      >
        <label htmlFor="res-url" className="sr-only">Link URL</label>
        <input id="res-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a doc, video or article link" inputMode="url" className="fld !min-h-11 flex-1 !py-2 text-sm" />
        <label htmlFor="res-topic" className="sr-only">Topic</label>
        <select id="res-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="fld !min-h-11 !py-2 text-sm md:!w-72">
          {items.map((i) => (
            <option key={i.id} value={i.id}>{i.title}</option>
          ))}
        </select>
        <button type="submit" disabled={!normalized || pending} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-blue px-4 text-sm font-bold text-white disabled:opacity-40">
          <Plus size={16} aria-hidden /> Add {normalized ? KIND_LABEL[detectKind(normalized)].toLowerCase() : "link"}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by type">
          <Chip on={kind === "all"} onClick={() => setKind("all")}>All {all.length}</Chip>
          {LINK_KINDS.filter((k) => counts[k] > 0).map((k) => (
            <Chip key={k} on={kind === k} onClick={() => setKind(k)}>
              <KindIcon kind={k} size={13} /> {KIND_LABEL[k]} {counts[k]}
            </Chip>
          ))}
          <span className="mx-1 hidden w-px bg-fg/10 sm:block" />
          <Chip on={who === "mine"} onClick={() => setWho(who === "mine" ? "all" : "mine")}>Only mine {all.filter((l) => l.mine).length}</Chip>
        </div>
        <div className="relative lg:w-72">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-quiet" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search links or topics" aria-label="Search links" className="fld !min-h-10 !py-2 !pl-9 text-sm" />
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-fg/15 p-8 text-center text-muted">
          {all.length === 0 ? "No links yet. Paste one above, or open a topic and add references there." : "No links match these filters."}
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {groups.map(([mod, links]) => (
            <section key={mod}>
              <h3 className="mb-3 flex items-baseline justify-between text-sm font-bold">
                {mod} <span className="text-xs font-semibold text-quiet">{links.length}</span>
              </h3>
              <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {links.map((l) => (
                  <li key={l.key} className="group flex items-center gap-3 rounded-xl border border-fg/[.08] bg-card px-3 py-2.5 hover:border-blue/40">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue/10 text-blue-light"><KindIcon kind={l.kind} /></span>
                    <div className="min-w-0 flex-1">
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="block truncate py-1 text-sm font-semibold hover:text-blue-light">
                        {l.label} <ExternalLink size={12} className="ml-0.5 inline align-baseline text-quiet" aria-hidden />
                      </a>
                      <div className="flex min-w-0 items-center gap-1.5 text-xs text-quiet">
                        <span className="shrink-0">{hostOf(l.url)}</span>·
                        <button type="button" onClick={() => setOpenId(l.itemId)} className="-my-1.5 truncate py-1.5 hover:text-fg hover:underline">{l.topic}</button>
                        {!l.mine && <span className="shrink-0 rounded bg-fg/[.07] px-1.5 text-[11px] font-bold uppercase">Rec</span>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      <TopicDrawer items={items} openId={openId} onOpen={setOpenId} today={today} planTitle={planTitle} planId={planId} />
      {toast}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-bold", on ? "border-fg bg-fg text-ground" : "border-fg/15 text-muted hover:text-fg")}>
      {children}
    </button>
  );
}
