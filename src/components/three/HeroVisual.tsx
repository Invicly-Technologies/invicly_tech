"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/ui/Logo";
import { ProductIcon } from "@/components/ui/ProductIcon";
import type { ProductSlug } from "@/data/products";

/**
 * Hero "product orbit": the four products ride one elliptical orbit around the Invicly core.
 * Plain DOM (no WebGL) so text stays crisp, cards are real links, and the orbit is sized from the
 * container so nothing is ever clipped. Positions update in a rAF loop via refs (no re-render per frame).
 */

const PRODUCTS: { slug: ProductSlug; name: string; sub: string; accent: string }[] = [
  { slug: "flow", name: "Flow", sub: "Tasks & focus", accent: "#3D9BFF" },
  { slug: "spendly", name: "Spendly", sub: "Money tracker", accent: "#34D399" },
  { slug: "kivo", name: "Kivo", sub: "Time tracking", accent: "#A78BFA" },
  { slug: "unreel", name: "Unreel", sub: "Mindful media", accent: "#A3E635" },
];

const BASE_SPEED = 0.16; // rad/s

export function HeroVisual() {
  const box = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const [size, setSize] = useState({ w: 560, h: 520 });
  const [reduced, setReduced] = useState(false);
  const state = useRef({ a: -Math.PI / 4, v: BASE_SPEED, hover: false, drag: null as null | { x: number; a: number; last: number; lt: number } });

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const narrow = size.w < 480;
  const cardW = narrow ? 112 : 156;
  const cardH = narrow ? 44 : 58;
  // Sized so the largest (front) card never leaves the box, cards 90° apart never overlap,
  // and no card reaches the core.
  const rx = Math.max(96, size.w / 2 - (cardW * 1.06) / 2 - 6);
  const ry = Math.min(size.h * 0.34, rx * (narrow ? 1 : 0.78));
  const cx = size.w / 2;
  const cy = size.h / 2;

  useEffect(() => {
    const place = () => {
      const s = state.current;
      PRODUCTS.forEach((_, i) => {
        const el = cards.current[i];
        if (!el) return;
        const ang = s.a + (i * Math.PI * 2) / PRODUCTS.length;
        const depth = (Math.sin(ang) + 1) / 2; // 0 = back (top), 1 = front (bottom)
        const sc = 0.84 + 0.22 * depth;
        const x = cx + rx * Math.cos(ang) - cardW / 2;
        const y = cy + ry * Math.sin(ang) - cardH / 2;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${sc})`;
        el.style.opacity = String(0.55 + 0.45 * depth);
        el.style.zIndex = String(depth > 0.5 ? 30 + Math.round(depth * 10) : 5 + Math.round(depth * 10));
        el.style.filter = depth < 0.25 ? "blur(0.6px) saturate(.8)" : "none";
      });
    };
    place();
    if (reduced) return;
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const s = state.current;
      if (!s.drag) {
        const target = s.hover ? 0 : BASE_SPEED;
        s.v += (target - s.v) * Math.min(1, dt * 3);
        s.a += s.v * dt;
      }
      place();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cx, cy, rx, ry, cardW, cardH, reduced]);

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a")) return;
    state.current.drag = { x: e.clientX, a: state.current.a, last: e.clientX, lt: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = state.current.drag;
    if (!d) return;
    const now = performance.now();
    state.current.a = d.a + (e.clientX - d.x) * 0.006;
    state.current.v = ((e.clientX - d.last) * 0.006) / Math.max(0.016, (now - d.lt) / 1000);
    d.last = e.clientX;
    d.lt = now;
  };
  const onUp = () => {
    state.current.drag = null;
  };

  return (
    <div
      ref={box}
      className="relative h-[380px] w-full touch-pan-y select-none md:h-[520px]"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ cursor: "grab" }}
    >
      {/* soft glow + orbit lines */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(10,132,255,.28),transparent_65%)] blur-2xl" />
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="orbit-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(90,176,255,.10)" />
            <stop offset="100%" stopColor="rgba(90,176,255,.55)" />
          </linearGradient>
        </defs>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="url(#orbit-fade)" strokeWidth="1.2" />
        <ellipse cx={cx} cy={cy} rx={rx * 0.62} ry={ry * 0.62} fill="none" stroke="rgba(90,176,255,.16)" strokeWidth="1" strokeDasharray="2 7" />
        <ellipse cx={cx} cy={cy} rx={Math.min(rx * 1.14, size.w / 2 - 2)} ry={ry * 1.14} fill="none" stroke="rgba(90,176,255,.07)" strokeWidth="1" />
      </svg>

      {/* core */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2" aria-hidden>
        <div className={`relative grid place-items-center ${narrow ? "h-[70px] w-[70px] rounded-[22px]" : "h-[118px] w-[118px] rounded-[32px]"}`}>
          <span
            className="absolute -inset-px rounded-[inherit] opacity-90"
            style={{ background: "conic-gradient(from var(--angle), #0A84FF, #A78BFA, #34D399, #5AB0FF, #0A84FF)", animation: "border-spin 7s linear infinite" }}
          />
          <span className="absolute inset-[2px] rounded-[inherit] bg-[linear-gradient(160deg,#0b1a33,#050b18_60%)] shadow-[inset_0_1px_0_rgba(255,255,255,.12)]" />
          <span className="absolute -inset-6 rounded-full bg-blue/25 blur-2xl" style={{ animation: "pulse-soft 3.2s ease-in-out infinite" }} />
          <span className="relative">
            <LogoMark size={narrow ? 38 : 62} />
          </span>
        </div>
      </div>

      {/* product cards */}
      <ul aria-label="Invicly products">
        {PRODUCTS.map((p, i) => (
          <li key={p.slug}>
            <Link
              href={`/products/${p.slug}/`}
              ref={(el) => {
                cards.current[i] = el;
              }}
              onPointerEnter={() => (state.current.hover = true)}
              onPointerLeave={() => (state.current.hover = false)}
              onFocus={() => (state.current.hover = true)}
              onBlur={() => (state.current.hover = false)}
              className="group absolute left-0 top-0 flex origin-center items-center gap-2.5 rounded-2xl border bg-card/90 px-3 backdrop-blur-md transition-[box-shadow,border-color] will-change-transform hover:!opacity-100 focus-visible:!opacity-100"
              style={{
                width: cardW,
                height: cardH,
                borderColor: `color-mix(in srgb, ${p.accent} 45%, transparent)`,
                boxShadow: `0 14px 40px -18px ${p.accent}`,
              }}
            >
              <ProductIcon slug={p.slug} accent={p.accent} size={narrow ? 28 : 34} />
              <span className="min-w-0">
                <span className={`block font-display font-bold leading-tight text-fg ${narrow ? "text-[13px]" : "text-[15px]"}`}>{p.name}</span>
                {!narrow && <span className="block truncate text-[11.5px] text-quiet">{p.sub}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
