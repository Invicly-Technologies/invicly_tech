"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

// The first page renders without a fade so the server HTML paints immediately.
let hasNavigated = false;

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const animate = hasNavigated;
  useEffect(() => {
    hasNavigated = true;
  }, []);
  return (
    <motion.div
      key={pathname}
      initial={animate ? { opacity: 0.4, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
