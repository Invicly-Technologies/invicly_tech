"use client";
import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/_-";

/** Small mono label that "decodes" from random glyphs when it scrolls into view. */
export function Eyebrow({ children, className, style }: { children: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [out, setOut] = useState(children);

  useEffect(() => {
    if (!inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = children.toUpperCase();
    let frame = 0;
    const total = target.length * 2 + 8;
    const id = window.setInterval(() => {
      frame++;
      const done = Math.floor((frame / total) * target.length);
      setOut(
        [...target].map((c, i) => (i < done || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(""),
      );
      if (frame >= total) {
        window.clearInterval(id);
        setOut(children);
      }
    }, 28);
    return () => window.clearInterval(id);
  }, [inView, children]);

  return (
    <div ref={ref} className={cn("eyebrow flex items-center gap-3", className)} style={style}>
      <span className="sr-only">{children}</span>
      <span
        aria-hidden="true"
        className={cn("h-px w-6 origin-left bg-current transition-transform duration-700 ease-out", inView ? "scale-x-100" : "scale-x-0")}
      />
      <span aria-hidden="true">{out}</span>
    </div>
  );
}
