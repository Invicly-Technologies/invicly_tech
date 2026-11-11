"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";

/** Oversized outlined wordmark that rises and fills with blue as the footer scrolls in. */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);
  const clip = useTransform(scrollYProgress, [0.2, 1], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ["0.12em", "-0.02em"]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none mt-12 select-none overflow-hidden">
      <motion.div
        className="relative text-center font-display font-extrabold leading-[0.85]"
        style={reduced ? undefined : { y, letterSpacing }}
      >
        <span className="block text-[22vw] text-transparent lg:text-[260px]" style={{ WebkitTextStroke: "1px rgba(90,176,255,.25)" }}>
          INVICLY
        </span>
        <motion.span
          className="absolute inset-0 block text-[22vw] text-transparent lg:text-[260px]"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(10,132,255,.55), rgba(10,132,255,0) 85%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            clipPath: reduced ? undefined : clip,
          }}
        >
          INVICLY
        </motion.span>
      </motion.div>
    </div>
  );
}
