"use client";
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { useRef, useState } from "react";
import { marquee } from "@/data/site";
import { useReducedMotion } from "@/lib/hooks";

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

function Row({ items, base, outline }: { items: string[]; base: number; outline?: boolean }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-1500, 0, 1500], [-4, 0, 4], { clamp: false });
  const dir = useRef(1);
  const [paused, setPaused] = useState(false);
  const pct = useTransform(x, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced || paused) return;
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    x.set(x.get() + dir.current * base * (delta / 1000) * (1 + Math.abs(f)));
  });

  const list = [...items, ...items];
  return (
    <div className="overflow-hidden" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <motion.div className="flex w-max gap-14 whitespace-nowrap" style={{ x: pct }}>
        {list.map((m, i) => (
          <span key={i} className="flex gap-14" aria-hidden={outline || i >= items.length}>
            <span
              className={outline ? "font-display text-[28px] font-extrabold tracking-tight text-transparent md:text-[40px]" : "font-mono text-sm text-quiet"}
              style={outline ? { WebkitTextStroke: "1px var(--color-blue-light)" } : undefined}
            >
              {m}
            </span>
            <span className={outline ? "self-center text-blue" : "text-quiet"}>{outline ? "✦" : "·"}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function Marquee() {
  return (
    <section aria-label="What we do" className="flex flex-col gap-4 border-y border-line py-[22px]">
      <Row items={marquee} base={-2.2} />
      <Row items={["Flow", "Spendly", "Kivo", "Unreel", "Think. Build. Invicly."]} base={1.4} outline />
    </section>
  );
}
