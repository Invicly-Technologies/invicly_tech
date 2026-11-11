"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsDownUp, ChevronsUpDown, Clock, ListChecks, Maximize2, Minimize2, Minus, Plus, Scan, Trash2 } from "lucide-react";
import type { PlanTree, TreeModule, TreeTopic } from "@/lib/learn/tree";
import { uid } from "@/lib/learn/tree";
import { fmtHours } from "@/lib/learn/analytics";
import { cn } from "@/lib/cn";

/** Decorative branch colors (identity only; all text stays in text tokens). */
export const BRANCH = ["#0A84FF", "#BF5AF2", "#FF9F0A", "#30D158", "#FF375F", "#40C8E0", "#E5B800", "#5E5CE6", "#FF6B35", "#32ADE6"];

export type TopicStatus = "done" | "overdue" | "now";
type Kind = "root" | "module" | "topic";
type Box = { id: string; kind: Kind; x: number; y: number; w: number; h: number; side: 1 | -1; color: string; mi: number; ti: number };
type Edge = { id: string; d: string; color: string; root: boolean };

const EST: Record<Kind, { w: number; h: number }> = { root: { w: 220, h: 64 }, module: { w: 190, h: 52 }, topic: { w: 210, h: 38 } };
const GAP_ROOT = 76;
const GAP_MOD = 54;
const VGAP_T = 10;
const VGAP_M = 26;

function curve(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
}

type Props = {
  tree: PlanTree;
  rootTitle: string;
  rootMeta?: string;
  mode?: "view" | "edit";
  statuses?: Record<string, TopicStatus>;
  /** Extra label per topic, e.g. subtopic progress "2/5". */
  topicMeta?: Record<string, string>;
  onChange?: (t: PlanTree) => void;
  onRootTitle?: (t: string) => void;
  onTopicOpen?: (topicId: string) => void;
  height?: number;
  className?: string;
};

export function MindMap({ tree, rootTitle, rootMeta, mode = "view", statuses, topicMeta, onChange, onRootTitle, onTopicOpen, height = 560, className }: Props) {
  const edit = mode === "edit";
  const outer = useRef<HTMLDivElement>(null);
  const nodeEls = useRef(new Map<string, HTMLElement>());
  const [sizes, setSizes] = useState<Record<string, { w: number; h: number }>>({});
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [full, setFull] = useState(false);
  const fitted = useRef(false);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);

  /* ---------- layout ---------- */
  const { boxes, edges, bounds } = useMemo(() => {
    const size = (id: string, k: Kind) => sizes[id] ?? EST[k];
    const r = size("root", "root");
    const boxes: Box[] = [{ id: "root", kind: "root", x: -r.w / 2, y: -r.h / 2, w: r.w, h: r.h, side: 1, color: "#0A84FF", mi: -1, ti: -1 }];
    const edges: Edge[] = [];
    const n = tree.modules.length;
    const split = Math.ceil(n / 2);
    const sides: [TreeModule[], 1 | -1, number][] = [
      [tree.modules.slice(0, split), 1, 0],
      [tree.modules.slice(split), -1, split],
    ];
    for (const [mods, dir, offset] of sides) {
      const blocks = mods.map((m) => {
        const mh = size(m.id, "module").h;
        const topics = collapsed.has(m.id) ? [] : m.topics;
        const th = topics.reduce((s, t) => s + size(t.id, "topic").h, 0) + Math.max(0, topics.length - 1) * VGAP_T;
        return { m, topics, bh: Math.max(mh, th), th };
      });
      const total = blocks.reduce((s, b) => s + b.bh, 0) + Math.max(0, blocks.length - 1) * VGAP_M;
      let y = -total / 2;
      blocks.forEach((b, bi) => {
        const mi = offset + bi;
        const color = BRANCH[mi % BRANCH.length];
        const ms = size(b.m.id, "module");
        const cy = y + b.bh / 2;
        const mx = dir > 0 ? r.w / 2 + GAP_ROOT : -r.w / 2 - GAP_ROOT - ms.w;
        boxes.push({ id: b.m.id, kind: "module", x: mx, y: cy - ms.h / 2, w: ms.w, h: ms.h, side: dir, color, mi, ti: -1 });
        edges.push({ id: `e-${b.m.id}`, color, root: true, d: curve(dir > 0 ? r.w / 2 : -r.w / 2, 0, dir > 0 ? mx : mx + ms.w, cy) });
        let ty = cy - b.th / 2;
        b.topics.forEach((t, ti) => {
          const ts = size(t.id, "topic");
          const tx = dir > 0 ? mx + ms.w + GAP_MOD : mx - GAP_MOD - ts.w;
          boxes.push({ id: t.id, kind: "topic", x: tx, y: ty, w: ts.w, h: ts.h, side: dir, color, mi, ti });
          edges.push({ id: `e-${t.id}`, color, root: false, d: curve(dir > 0 ? mx + ms.w : mx, cy, dir > 0 ? tx : tx + ts.w, ty + ts.h / 2) });
          ty += ts.h + VGAP_T;
        });
        y += b.bh + VGAP_M;
      });
    }
    const minX = Math.min(...boxes.map((b) => b.x));
    const maxX = Math.max(...boxes.map((b) => b.x + b.w));
    const minY = Math.min(...boxes.map((b) => b.y));
    const maxY = Math.max(...boxes.map((b) => b.y + b.h));
    return { boxes, edges, bounds: { minX, maxX, minY, maxY } };
  }, [tree, sizes, collapsed]);

  const byId = useMemo(() => new Map(boxes.map((b) => [b.id, b])), [boxes]);

  // Measure rendered nodes; re-layout when their real size differs from the estimate.
  useLayoutEffect(() => {
    let changed = false;
    const next: Record<string, { w: number; h: number }> = { ...sizes };
    nodeEls.current.forEach((el, id) => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const prev = sizes[id];
      if (!prev || Math.abs(prev.w - w) > 0.5 || Math.abs(prev.h - h) > 0.5) {
        next[id] = { w, h };
        changed = true;
      }
    });
    if (changed) setSizes(next);
  });

  const fit = useCallback(() => {
    const el = outer.current;
    if (!el) return;
    const W = el.clientWidth;
    const H = el.clientHeight;
    const bw = bounds.maxX - bounds.minX;
    const bh = bounds.maxY - bounds.minY;
    // Leave room for the toolbars (top) and the shortcut hint (bottom).
    const top = 64;
    const bottom = 40;
    const k = Math.max(0.25, Math.min(1.1, (W - 48) / bw, (H - top - bottom) / bh));
    setView({ k, x: W / 2 - k * (bounds.minX + bw / 2), y: top + (H - top - bottom) / 2 - k * (bounds.minY + bh / 2) });
  }, [bounds]);

  const fitRef = useRef(fit);
  fitRef.current = fit;
  useEffect(() => {
    if (fitted.current || Object.keys(sizes).length === 0) return;
    fitted.current = true;
    fitRef.current();
    // Measured sizes can settle over a second layout pass; fit again with the final bounds.
    const t = setTimeout(() => fitRef.current(), 160);
    return () => clearTimeout(t);
  }, [sizes]);

  useEffect(() => {
    const t = setTimeout(fit, 30);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  // Ctrl/Cmd + wheel (and trackpad pinch) zooms around the cursor. Plain wheel pans only in full screen.
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const r = el.getBoundingClientRect();
        const px = e.clientX - r.left;
        const py = e.clientY - r.top;
        setView((v) => {
          const k = Math.min(2, Math.max(0.2, v.k * Math.exp(-e.deltaY * 0.0022)));
          return { k, x: px - ((px - v.x) * k) / v.k, y: py - ((py - v.y) * k) / v.k };
        });
      } else if (full) {
        e.preventDefault();
        setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [full]);

  const zoomBy = (f: number) => {
    const el = outer.current;
    if (!el) return;
    const px = el.clientWidth / 2;
    const py = el.clientHeight / 2;
    setView((v) => {
      const k = Math.min(2, Math.max(0.2, v.k * f));
      return { k, x: px - ((px - v.x) * k) / v.k, y: py - ((py - v.y) * k) / v.k };
    });
  };

  // Keep the selected node on screen.
  useEffect(() => {
    if (!selected || !outer.current) return;
    const b = byId.get(selected);
    if (!b) return;
    const W = outer.current.clientWidth;
    const H = outer.current.clientHeight;
    const sx = view.x + b.x * view.k;
    const sy = view.y + b.y * view.k;
    const sw = b.w * view.k;
    const sh = b.h * view.k;
    let dx = 0;
    let dy = 0;
    if (sx < 16) dx = 16 - sx;
    else if (sx + sw > W - 16) dx = W - 16 - sx - sw;
    if (sy < 56) dy = 56 - sy;
    else if (sy + sh > H - 40) dy = H - 40 - sy - sh;
    if (dx || dy) setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, byId]);

  /* ---------- tree edits ---------- */
  const find = (id: string) => {
    for (let mi = 0; mi < tree.modules.length; mi++) {
      const m = tree.modules[mi];
      if (m.id === id) return { mi, ti: -1 };
      const ti = m.topics.findIndex((t) => t.id === id);
      if (ti >= 0) return { mi, ti };
    }
    return null;
  };
  const commit = (fn: (mods: TreeModule[]) => TreeModule[]) => onChange?.({ modules: fn(tree.modules.map((m) => ({ ...m, topics: [...m.topics] }))) });

  const startEdit = (id: string, text?: string) => {
    if (!edit) return;
    setSelected(id);
    setEditing(id);
    if (text !== undefined) setDraft(text);
    else if (id === "root") setDraft(rootTitle);
    else {
      const p = find(id);
      if (!p) return;
      setDraft(p.ti < 0 ? tree.modules[p.mi].title : tree.modules[p.mi].topics[p.ti].title);
    }
  };

  const addModule = (afterIndex?: number) => {
    const m: TreeModule = { id: uid("m"), title: "", topics: [] };
    commit((mods) => {
      mods.splice(afterIndex === undefined ? mods.length : afterIndex + 1, 0, m);
      return mods;
    });
    startEdit(m.id, "");
  };
  const addTopic = (mi: number, afterIndex?: number) => {
    const t: TreeTopic = { id: uid("t"), title: "", hours: 1 };
    commit((mods) => {
      const ts = mods[mi].topics;
      ts.splice(afterIndex === undefined ? ts.length : afterIndex + 1, 0, t);
      return mods;
    });
    setCollapsed((c) => {
      const n = new Set(c);
      n.delete(tree.modules[mi].id);
      return n;
    });
    startEdit(t.id, "");
  };
  const remove = (id: string) => {
    const p = find(id);
    if (!p) return;
    const m = tree.modules[p.mi];
    let nextSel: string = "root";
    if (p.ti < 0) {
      nextSel = tree.modules[p.mi - 1]?.id ?? tree.modules[p.mi + 1]?.id ?? "root";
      commit((mods) => mods.filter((x) => x.id !== id));
    } else {
      nextSel = m.topics[p.ti - 1]?.id ?? m.topics[p.ti + 1]?.id ?? m.id;
      commit((mods) => {
        mods[p.mi].topics = mods[p.mi].topics.filter((t) => t.id !== id);
        return mods;
      });
    }
    setSelected(nextSel);
  };
  const setHours = (id: string, delta: number, absolute?: number) => {
    const p = find(id);
    if (!p || p.ti < 0) return;
    commit((mods) => {
      const t = { ...mods[p.mi].topics[p.ti] };
      const v = absolute ?? (t.hours || 0) + delta;
      t.hours = Math.min(200, Math.max(0.25, Math.round(v * 4) / 4));
      mods[p.mi].topics[p.ti] = t;
      return mods;
    });
  };
  const move = (id: string, dir: -1 | 1) => {
    const p = find(id);
    if (!p) return;
    commit((mods) => {
      const arr: unknown[] = p.ti < 0 ? mods : mods[p.mi].topics;
      const i = p.ti < 0 ? p.mi : p.ti;
      const j = i + dir;
      if (j < 0 || j >= arr.length) return mods;
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
      return mods;
    });
  };

  const finishEdit = (cancel = false) => {
    const id = editing;
    setEditing(null);
    if (!id) return;
    const text = draft.trim();
    if (id === "root") {
      if (!cancel && text) onRootTitle?.(text.slice(0, 120));
      return;
    }
    const p = find(id);
    if (!p) return;
    const current = p.ti < 0 ? tree.modules[p.mi].title : tree.modules[p.mi].topics[p.ti].title;
    if (cancel || !text) {
      if (!current) remove(id); // abandoned new node
      return;
    }
    commit((mods) => {
      if (p.ti < 0) mods[p.mi] = { ...mods[p.mi], title: text.slice(0, 120) };
      else mods[p.mi].topics[p.ti] = { ...mods[p.mi].topics[p.ti], title: text.slice(0, 200) };
      return mods;
    });
    outer.current?.focus();
  };

  const visibleOrder = boxes.map((b) => b.id);

  const onKey = (e: React.KeyboardEvent) => {
    if (editing) return;
    const id = selected;
    if (!id) {
      if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Tab", "Enter"].includes(e.key)) {
        e.preventDefault();
        setSelected("root");
      }
      return;
    }
    const b = byId.get(id);
    const p = id === "root" ? null : find(id);
    if (e.key === "Escape") return setSelected(null);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (e.altKey && edit) return move(id, e.key === "ArrowDown" ? 1 : -1);
      const i = visibleOrder.indexOf(id);
      const j = Math.min(visibleOrder.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)));
      return setSelected(visibleOrder[j]);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const outward = (e.key === "ArrowRight" ? 1 : -1) === (b?.side ?? 1);
      if (id === "root") {
        const target = boxes.find((x) => x.kind === "module" && x.side === (e.key === "ArrowRight" ? 1 : -1));
        if (target) setSelected(target.id);
        return;
      }
      if (!p) return;
      if (outward) {
        if (p.ti < 0) {
          const m = tree.modules[p.mi];
          if (collapsed.has(m.id)) toggle(m.id);
          else if (m.topics[0]) setSelected(m.topics[0].id);
        }
      } else setSelected(p.ti < 0 ? "root" : tree.modules[p.mi].id);
      return;
    }
    if (e.key === " " && !edit && p && p.ti >= 0) {
      e.preventDefault();
      return onTopicOpen?.(id);
    }
    if (!edit) {
      if (e.key === "Enter" && p && p.ti >= 0) onTopicOpen?.(id);
      else if (e.key === "Enter" && p && p.ti < 0) toggle(id);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      if (id === "root") return addModule();
      if (!p) return;
      return p.ti < 0 ? addTopic(p.mi) : addTopic(p.mi, p.ti);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (id === "root") return addModule();
      if (!p) return;
      return p.ti < 0 ? addModule(p.mi) : addTopic(p.mi, p.ti);
    }
    if ((e.key === "Delete" || e.key === "Backspace") && id !== "root") {
      e.preventDefault();
      return remove(id);
    }
    if (e.key === "F2") {
      e.preventDefault();
      return startEdit(id);
    }
    if ((e.key === "+" || e.key === "=") && p && p.ti >= 0) return setHours(id, 0.5);
    if ((e.key === "-" || e.key === "_") && p && p.ti >= 0) return setHours(id, -0.5);
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && /[^\s+=_-]/.test(e.key)) {
      e.preventDefault();
      startEdit(id, e.key);
    }
  };

  const toggle = (id: string) =>
    setCollapsed((c) => {
      const n = new Set(c);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  /* ---------- pan ---------- */
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-node],[data-ui]")) return;
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }));
  };
  const onPointerUp = () => {
    if (drag.current && !drag.current.moved) setSelected(null);
    drag.current = null;
  };

  const modTotals = useMemo(
    () =>
      new Map(
        tree.modules.map((m) => [
          m.id,
          { hours: m.topics.reduce((s, t) => s + (t.hours || 0), 0), done: m.topics.filter((t) => statuses?.[t.id] === "done").length, count: m.topics.length },
        ]),
      ),
    [tree, statuses],
  );
  const allCollapsed = tree.modules.length > 0 && tree.modules.every((m) => collapsed.has(m.id));

  const btn = "grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-fg/10 hover:text-fg disabled:opacity-40";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-fg/10 bg-ground",
        full && "!fixed inset-0 z-[80] !rounded-none border-0",
        className,
      )}
      style={full ? undefined : { height }}
    >
      <div
        ref={outer}
        tabIndex={0}
        role="application"
        aria-roledescription="mind map"
        aria-label={`${rootTitle} mind map. Arrow keys move between nodes.${edit ? " Tab adds a child, Enter adds a sibling, Delete removes, F2 renames, plus and minus change hours." : " Enter opens a topic."}`}
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="mm-canvas absolute inset-0 cursor-grab outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue/50"
        style={{ touchAction: full ? "none" : "pan-y", backgroundPosition: `${view.x}px ${view.y}px`, backgroundSize: `${22 * view.k}px ${22 * view.k}px` }}
      >
        <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}>
          <svg className="pointer-events-none absolute overflow-visible" style={{ left: 0, top: 0 }} width="1" height="1" aria-hidden>
            {edges.map((e) => (
              <path key={e.id} d={e.d} fill="none" stroke={e.color} strokeWidth={e.root ? 3 : 2} strokeLinecap="round" opacity={e.root ? 0.9 : 0.7} />
            ))}
          </svg>
          {boxes.map((b) => {
            const isSel = selected === b.id;
            const isEditing = editing === b.id;
            const common = {
              "data-node": true,
              ref: (el: HTMLElement | null) => {
                if (el) nodeEls.current.set(b.id, el);
                else nodeEls.current.delete(b.id);
              },
              style: { left: b.x, top: b.y, ...(isEditing ? { width: Math.max(b.w, 200) } : {}) },
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                setSelected(b.id);
                outer.current?.focus({ preventScroll: true });
                if (!edit && b.kind === "topic") onTopicOpen?.(b.id);
                if (!edit && b.kind === "module") toggle(b.id);
              },
              onDoubleClick: () => startEdit(b.id),
            } as const;
            const editor = isEditing && (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => finishEdit()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") finishEdit();
                  if (e.key === "Escape") finishEdit(true);
                  if (e.key === "Tab") {
                    e.preventDefault();
                    finishEdit();
                  }
                }}
                placeholder={b.kind === "module" ? "Module name" : b.kind === "topic" ? "Topic" : "Plan name"}
                className="w-full min-w-0 bg-transparent outline-none placeholder:text-quiet"
                aria-label="Node text"
              />
            );

            if (b.kind === "root")
              return (
                <div
                  key="root"
                  {...common}
                  className={cn(
                    "absolute w-max max-w-[260px] cursor-pointer select-none rounded-2xl bg-blue-fill px-5 py-3 text-white shadow-[0_12px_40px_-12px_rgba(10,132,255,.7)]",
                    isSel && "ring-4 ring-blue/40",
                  )}
                >
                  <div className="font-display text-[17px] font-bold leading-snug">{editor || rootTitle || "Untitled plan"}</div>
                  {rootMeta && <div className="mt-0.5 text-xs text-white/80">{rootMeta}</div>}
                </div>
              );

            if (b.kind === "module") {
              const m = tree.modules[b.mi];
              const tot = modTotals.get(m.id)!;
              const isCol = collapsed.has(m.id);
              return (
                <div
                  key={b.id}
                  {...common}
                  className={cn("absolute w-max min-w-[150px] max-w-[220px] cursor-pointer select-none rounded-xl border-2 px-3.5 py-2", isSel && "ring-4 ring-blue/30")}
                  style={{ ...common.style, borderColor: b.color, background: `color-mix(in oklab, ${b.color} 13%, var(--color-card))` }}
                >
                  <div className="text-[14px] font-bold leading-snug text-fg">{editor || m.title || <span className="text-quiet">Untitled module</span>}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                    <span>{tot.count} topics · {fmtHours(tot.hours)}</span>
                    {statuses && tot.count > 0 && <span className="font-bold text-fg">{tot.done}/{tot.count}</span>}
                  </div>
                  {statuses && tot.count > 0 && (
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-fg/10">
                      <div className="h-full rounded-full" style={{ width: `${(tot.done / tot.count) * 100}%`, background: b.color }} />
                    </div>
                  )}
                  {m.topics.length > 0 && (
                    <button
                      type="button"
                      data-ui
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(m.id);
                      }}
                      aria-label={isCol ? `Expand ${m.title}` : `Collapse ${m.title}`}
                      className={cn(
                        "absolute top-1/2 grid h-6 min-w-6 -translate-y-1/2 place-items-center rounded-full border-2 bg-card px-1 text-[11px] font-bold text-fg",
                        b.side > 0 ? "-right-3.5" : "-left-3.5",
                      )}
                      style={{ borderColor: b.color }}
                    >
                      {isCol ? m.topics.length : "–"}
                    </button>
                  )}
                </div>
              );
            }

            const m = tree.modules[b.mi];
            const t = m.topics[b.ti];
            const st = statuses?.[t.id];
            return (
              <div
                key={b.id}
                {...common}
                className={cn(
                  "group absolute flex w-max max-w-[260px] cursor-pointer select-none items-start gap-2 rounded-lg border bg-card px-2.5 py-1.5 text-[13px] leading-snug shadow-sm transition-shadow hover:shadow-md",
                  st === "overdue" ? "border-warn/60" : st === "now" ? "border-blue/60" : "border-fg/12",
                  isSel && "ring-4 ring-blue/30",
                )}
              >
                {st === "done" ? (
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-blue-fill text-white"><Check size={11} strokeWidth={3.5} aria-hidden /></span>
                ) : (
                  <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full" style={{ background: b.color }} aria-hidden />
                )}
                <span className={cn("min-w-0 flex-1 text-fg", st === "done" && "text-quiet line-through")}>{editor || t.title || <span className="text-quiet">Untitled topic</span>}</span>
                {!isEditing && (topicMeta?.[t.id] ?? (t.subtopics?.length ? String(t.subtopics.length) : null)) && (
                  <span className="mt-px inline-flex shrink-0 items-center gap-0.5 rounded-md bg-fg/[.06] px-1.5 py-px text-[11px] font-semibold text-muted" title="Subtopics">
                    <ListChecks size={10} aria-hidden />
                    {topicMeta?.[t.id] ?? t.subtopics!.length}
                  </span>
                )}
                {!isEditing && (
                  <span className="mt-px inline-flex shrink-0 items-center gap-0.5 rounded-md bg-fg/[.06] px-1.5 py-px text-[11px] font-semibold text-muted">
                    <Clock size={10} aria-hidden />
                    {fmtHours(t.hours)}
                  </span>
                )}
                {st && <span className="sr-only">{st === "done" ? "Done" : st === "overdue" ? "Overdue" : "In progress"}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div data-ui className="absolute left-3 top-3 flex flex-wrap items-center gap-1 rounded-xl border border-fg/10 bg-card/95 p-1 shadow-lg backdrop-blur">
        {edit && (
          <>
            <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-bold text-fg hover:bg-fg/10" onClick={() => addModule()}>
              <Plus size={15} aria-hidden /> Module
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-bold text-fg hover:bg-fg/10 disabled:opacity-40"
              disabled={tree.modules.length === 0}
              onClick={() => {
                const p = selected && selected !== "root" ? find(selected) : null;
                addTopic(p ? p.mi : tree.modules.length - 1, p && p.ti >= 0 ? p.ti : undefined);
              }}
            >
              <Plus size={15} aria-hidden /> Topic
            </button>
            {selected && selected !== "root" && find(selected)?.ti !== -1 && (
              <span className="flex items-center gap-0.5 border-l border-fg/10 pl-1">
                <button type="button" className={btn} onClick={() => setHours(selected, -0.5)} aria-label="Less time"><Minus size={14} aria-hidden /></button>
                <span className="w-12 text-center text-xs font-bold">{fmtHours(tree.modules[find(selected)!.mi].topics[find(selected)!.ti]?.hours ?? 0)}</span>
                <button type="button" className={btn} onClick={() => setHours(selected, 0.5)} aria-label="More time"><Plus size={14} aria-hidden /></button>
              </span>
            )}
            {selected && selected !== "root" && (
              <button type="button" className={cn(btn, "hover:text-danger")} onClick={() => remove(selected)} aria-label="Delete selected">
                <Trash2 size={15} aria-hidden />
              </button>
            )}
            <span className="mx-0.5 h-6 w-px bg-fg/10" />
          </>
        )}
        <button type="button" className={btn} onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(tree.modules.map((m) => m.id)))} aria-label={allCollapsed ? "Expand all" : "Collapse all"} title={allCollapsed ? "Expand all" : "Collapse all"}>
          {allCollapsed ? <ChevronsUpDown size={16} aria-hidden /> : <ChevronsDownUp size={16} aria-hidden />}
        </button>
      </div>
      <div data-ui className="absolute right-3 top-3 flex items-center gap-0.5 rounded-xl border border-fg/10 bg-card/95 p-1 shadow-lg backdrop-blur">
        <button type="button" className={btn} onClick={() => zoomBy(1 / 1.2)} aria-label="Zoom out"><Minus size={16} aria-hidden /></button>
        <span className="w-11 text-center text-xs font-semibold tabular-nums text-muted">{Math.round(view.k * 100)}%</span>
        <button type="button" className={btn} onClick={() => zoomBy(1.2)} aria-label="Zoom in"><Plus size={16} aria-hidden /></button>
        <button type="button" className={btn} onClick={fit} aria-label="Fit to screen" title="Fit to screen"><Scan size={16} aria-hidden /></button>
        <button type="button" className={btn} onClick={() => setFull((f) => !f)} aria-label={full ? "Exit full screen" : "Full screen"} title={full ? "Exit full screen" : "Full screen"}>
          {full ? <Minimize2 size={16} aria-hidden /> : <Maximize2 size={16} aria-hidden />}
        </button>
      </div>
      <div data-ui className="pointer-events-none absolute bottom-3 left-3 hidden max-w-[calc(100%-24px)] rounded-lg bg-card/90 px-2 py-1 text-[11px] text-quiet backdrop-blur md:block">
        {edit ? (
          <>
            <Kbd>Tab</Kbd> child · <Kbd>Enter</Kbd> sibling · <Kbd>Del</Kbd> delete · <Kbd>F2</Kbd> or type to rename · <Kbd>+</Kbd>/<Kbd>−</Kbd> hours · <Kbd>Alt</Kbd>+<Kbd>↑↓</Kbd> reorder · drag to pan · <Kbd>Ctrl</Kbd>+scroll to zoom
          </>
        ) : (
          <>
            Click a module to fold it{onTopicOpen ? ", a topic to open it" : ""} · drag to pan · <Kbd>Ctrl</Kbd>+scroll to zoom
          </>
        )}
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded border border-fg/15 bg-card px-1 py-px font-mono text-[11px] text-muted">{children}</kbd>;
}
