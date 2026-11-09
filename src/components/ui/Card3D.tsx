"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const MotionLink = motion.create(Link);

type Props = { children: ReactNode; className?: string; href?: string; max?: number };

/** A card that tilts toward the pointer (max 6deg) with a moving highlight. */
export function Card3D({ children, className, href, max = 6 }: Props) {
  const ref = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const active = fine && !reduced;
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });
  const lift = useSpring(0, { stiffness: 200, damping: 20 });

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${nx * 100}%`);
    el.style.setProperty("--my", `${ny * 100}%`);
    if (!active) return;
    px.set(nx);
    py.set(ny);
    lift.set(-8);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    lift.set(0);
  };

  const style = active ? { rotateX: rx, rotateY: ry, y: lift, transformPerspective: 900 } : undefined;
  const cls = cn("card3d surface group block", className);

  if (href) {
    const external = href.startsWith("http");
    const MotionTag = external ? motion.a : MotionLink;
    return (
      <MotionTag
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cls}
        style={style}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </MotionTag>
    );
  }
  return (
    <motion.div ref={ref as React.Ref<HTMLDivElement>} className={cls} style={style} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </motion.div>
  );
}
