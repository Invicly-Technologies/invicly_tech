"use client";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  size?: "md" | "sm";
  className?: string;
  external?: boolean;
};

const MotionLink = motion.create(Link);

export function Button({ href, children, variant = "primary", size = "md", className, external }: Props) {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });
  const magnetic = variant === "primary" && fine && !reduced;

  const onMove = (e: React.PointerEvent) => {
    if (!magnetic || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.18);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const cls = cn("btn", variant === "primary" ? "btn-primary" : "btn-ghost", size === "sm" && "btn-sm", className);
  const isExternal = external ?? /^(https?:|mailto:)/.test(href);
  const extra = isExternal && href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};

  if (isExternal) {
    return (
      <motion.a ref={ref} href={href} className={cls} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset} {...extra}>
        {children}
      </motion.a>
    );
  }
  return (
    <MotionLink ref={ref} href={href} className={cls} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </MotionLink>
  );
}
