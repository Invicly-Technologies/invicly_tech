"use client";
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  return <motion.div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-blue" style={{ scaleX }} />;
}
