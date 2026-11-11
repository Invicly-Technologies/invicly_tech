"use client";
import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { process } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";
import { SplitReveal } from "@/components/ui/SplitReveal";

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const scale = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  return (
    <section className="border-t border-line bg-deep py-20">
      <div className="wrap">
        <h2 className="mt-3 text-[36px] font-bold leading-[1.1] tracking-[-1.5px] md:text-[48px]"><SplitReveal text="Think. Build. Invicly." /></h2>
        <div ref={ref} className="relative mt-16">
          {/* horizontal on desktop, vertical on mobile */}
          <motion.div
            aria-hidden="true"
            className="absolute left-0 right-0 top-[19px] hidden h-0.5 origin-left bg-gradient-to-r from-blue to-blue-deep md:block"
            style={{ scaleX: scale }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute bottom-0 left-[19px] top-0 w-0.5 origin-top bg-gradient-to-b from-blue to-blue-deep md:hidden"
            style={{ scaleY: scale }}
          />
          <ol className="relative grid gap-10 md:grid-cols-3">
            {process.map((p, i) => (
              <li key={p.title} className="relative pl-16 md:pl-0">
                <Reveal delay={i * 0.12}>
                  <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-fill font-extrabold text-white md:relative">
                    {i + 1}
                  </div>
                  <h3 className="text-[26px] md:mt-6">{p.title}</h3>
                  <p className="mt-2.5 leading-relaxed text-soft">{p.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
