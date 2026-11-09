"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { SplitReveal } from "./SplitReveal";
import { useReducedMotion } from "@/lib/hooks";

export function CtaBand({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [64, 32]);
  const glowY = useTransform(scrollYProgress, [0, 1], ["-80%", "-50%"]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--sx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--sy", `${e.clientY - r.top}px`);
  };

  return (
    <section className="wrap pb-24 pt-10">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        style={reduced ? { borderRadius: 32 } : { scale, borderRadius: radius }}
        className="group relative overflow-hidden border border-blue/40 bg-deep px-6 py-14 text-center md:px-12 md:py-[72px]"
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-[640px] max-w-full -translate-x-1/2 rounded-full"
          style={{ y: glowY, background: "radial-gradient(closest-side, rgba(10,132,255,.35), transparent)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(360px circle at var(--sx, 50%) var(--sy, 50%), rgba(90,176,255,.16), transparent 60%)" }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="floaty absolute left-[8%] top-[22%] h-2 w-2 rounded-full bg-blue-light/60" />
          <span className="floaty absolute right-[12%] top-[30%] h-3 w-3 rounded-full bg-blue/50" style={{ animationDelay: "-2s" }} />
          <span className="floaty absolute bottom-[18%] left-[18%] h-1.5 w-1.5 rounded-full bg-fg/50" style={{ animationDelay: "-3.5s" }} />
          <span className="floaty absolute bottom-[24%] right-[22%] h-2 w-2 rounded-full bg-blue-light/40" style={{ animationDelay: "-1s" }} />
        </div>
        <h2 className="relative text-[34px] font-extrabold leading-[1.08] tracking-[-1.5px] md:text-[52px]">
          <SplitReveal text={title} />
        </h2>
        <motion.p
          className="relative mx-auto mt-5 max-w-[560px] text-lg leading-relaxed text-muted"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {body}
        </motion.p>
        <motion.div
          className="relative mt-9 flex flex-wrap justify-center gap-3.5"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}
