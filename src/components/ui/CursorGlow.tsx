"use client";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";

/** Soft blue glow plus a ring that trails the cursor and grows over links and buttons. Desktop only. */
export function CursorGlow() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const gx = useSpring(mx, { stiffness: 120, damping: 20 });
  const gy = useSpring(my, { stiffness: 120, damping: 20 });
  const rx = useSpring(mx, { stiffness: 500, damping: 35 });
  const ry = useSpring(my, { stiffness: 500, damping: 35 });
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!fine) return;
    const move = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      const t = e.target as Element | null;
      setHover(!!t?.closest?.("a, button, select, input, textarea, [role=button]"));
    };
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
    };
  }, [fine, mx, my]);

  if (!fine || reduced) return null;
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[60] h-[420px] w-[420px] rounded-full"
        style={{ x: gx, y: gy, translateX: "-50%", translateY: "-50%", background: "radial-gradient(circle, rgba(10,132,255,0.13), transparent 60%)", mixBlendMode: "screen" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[61] rounded-full border border-blue-light/70"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: hover ? 54 : 28, height: hover ? 54 : 28, opacity: hover ? 1 : 0.6, scale: down ? 0.8 : 1, backgroundColor: hover ? "rgba(10,132,255,0.12)" : "rgba(10,132,255,0)" }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />
    </>
  );
}
