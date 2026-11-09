"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/hooks";

/** Rotates from rotateX(16deg) rotateY(-14deg) to flat as the element reaches the viewport centre. */
export function TiltOnScroll({ children, className, from = { x: 16, y: -14, z: 2 } }: { children: ReactNode; className?: string; from?: { x: number; y: number; z: number } }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rx = useTransform(scrollYProgress, [0, 1], [from.x, 0]);
  const ry = useTransform(scrollYProgress, [0, 1], [from.y, 0]);
  const rz = useTransform(scrollYProgress, [0, 1], [from.z, 0]);
  return (
    <div ref={ref} className={className} style={{ perspective: 1800 }}>
      <motion.div style={reduced ? undefined : { rotateX: rx, rotateY: ry, rotateZ: rz, transformStyle: "preserve-3d" }} className="relative">
        {children}
      </motion.div>
    </div>
  );
}
