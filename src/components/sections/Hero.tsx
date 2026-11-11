"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { HeroVisual } from "@/components/three/HeroVisual";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { products } from "@/data/products";
import { useReducedMotion } from "@/lib/hooks";

// Start at 0.01, not 0: Chrome ignores fully transparent elements for Largest Contentful Paint,
// so a 0 start delays LCP until the animation ends. 0.01 looks the same.
const fadeUp = (delay: number) => ({
  initial: { opacity: 0.01, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] as const, delay },
});

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-28 md:pt-36">

      <div className="wrap relative flex flex-wrap items-center gap-8">
        <motion.div className="min-w-0 flex-[1_1_520px]" style={reduced ? undefined : { y: textY, opacity: fade }}>
          <h1 className="text-[60px] font-extrabold leading-none tracking-[-2px] md:text-[92px] md:tracking-[-3px]">
            <SplitReveal text="Think." mode="chars" onMount delay={0.1} />
            <br />
            <SplitReveal text="Build." mode="chars" onMount delay={0.3} />
            <br />
            <SplitReveal text="Invicly." mode="chars" onMount delay={0.5} pieceClassName="brand-shimmer" />
          </h1>
          <motion.p {...fadeUp(0.8)} className="mt-7 max-w-[520px] text-[19px] leading-relaxed text-muted">
            We make software people use every day, and we build websites, apps and cloud setups for businesses that want the same quality.
          </motion.p>
          <motion.div {...fadeUp(0.95)} className="mt-9 flex flex-wrap gap-3.5">
            <Button href="/products/">Explore products</Button>
            <Button href="/contact/" variant="ghost">
              Start a project
            </Button>
          </motion.div>
          <motion.div {...fadeUp(1.1)} className="mt-7 text-sm text-quiet">
            Our apps are free on the web, Android, Windows and Linux.
          </motion.div>
        </motion.div>
        <motion.div
          className="min-w-0 flex-[1_1_440px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 }}
        >
          <motion.div style={reduced ? undefined : { y: visualY, scale: visualScale }}>
            <HeroVisual />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        aria-hidden="true"
        className="relative mx-auto mt-6 hidden h-10 w-6 justify-center rounded-full border border-fg/25 pt-2 md:flex"
        style={reduced ? undefined : { opacity: fade }}
      >
        <span className="scroll-dot h-2 w-1 rounded-full bg-blue-light" />
      </motion.div>
    </section>
  );
}
