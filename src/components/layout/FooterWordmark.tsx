"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";

/**
 * Oversized outlined wordmark at the foot of the page. It eases up and its outline brightens as the footer
 * scrolls in; the fill stays a faint tint so it reads as a signature, not a heavy block.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["24%", "0%"]);
  const strokeColor = useTransform(scrollYProgress, [0, 1], ["rgba(90,176,255,0.12)", "rgba(90,176,255,0.42)"]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none mt-14 select-none overflow-hidden pb-2">
      <motion.div className="relative text-center font-display font-extrabold leading-[0.9] tracking-[-0.02em]" style={reduced ? undefined : { y }}>
        <motion.span
          className="block text-[20vw] lg:text-[220px]"
          style={{
            color: "transparent",
            backgroundImage: "linear-gradient(180deg, color-mix(in oklab, var(--color-blue) 16%, transparent), transparent 80%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextStrokeWidth: "1px",
            WebkitTextStrokeColor: reduced ? "rgba(90,176,255,.35)" : strokeColor,
          }}
        >
          INVICLY
        </motion.span>
      </motion.div>
    </div>
  );
}
