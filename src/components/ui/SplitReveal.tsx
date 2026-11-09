"use client";
import { motion } from "framer-motion";
import { Fragment } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

type Props = {
  text: string;
  className?: string;
  /** "words" slides each word up from a mask; "chars" flips each letter in 3D. */
  mode?: "words" | "chars";
  delay?: number;
  /** Animate on mount (hero) instead of when scrolled into view. */
  onMount?: boolean;
  /** Extra class on every letter or word (e.g. gradient text, which must sit on the moving element). */
  pieceClassName?: string;
};

export function SplitReveal({ text, className, mode = "words", delay = 0, onMount, pieceClassName }: Props) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const trigger = onMount ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-40px" } };
  let i = 0;

  return (
    <span className={cn("inline", className)}>
      <span className="sr-only">{text}</span>
      <motion.span aria-hidden="true" initial="hidden" {...trigger} className="inline">
        {words.map((w, wi) => (
          <Fragment key={wi}>
          <span className="inline-block whitespace-nowrap">
            {mode === "words" ? (
              <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  className={cn("inline-block", pieceClassName)}
                  variants={{
                    hidden: { y: reduced ? 0 : "110%", opacity: reduced ? 0 : 1 },
                    show: { y: "0%", opacity: 1, transition: { duration: 0.75, ease: [0.2, 0.8, 0.2, 1], delay: delay + wi * 0.07 } },
                  }}
                >
                  {w}
                </motion.span>
              </span>
            ) : (
              <span className="inline-block" style={{ perspective: 600 }}>
                {[...w].map((ch, ci) => {
                  const n = i++;
                  return (
                    <motion.span
                      key={ci}
                      className={cn("inline-block origin-bottom", pieceClassName)}
                      variants={{
                        hidden: reduced ? { opacity: 1 } : { opacity: 1, rotateX: -90, y: "0.35em" },
                        show: { opacity: 1, rotateX: 0, y: 0, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay: delay + n * 0.035 } },
                      }}
                    >
                      {ch}
                    </motion.span>
                  );
                })}
              </span>
            )}
          </span>
          {wi < words.length - 1 && " "}
          </Fragment>
        ))}
      </motion.span>
    </span>
  );
}
