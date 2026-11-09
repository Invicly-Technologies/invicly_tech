"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { nav } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/learn/ThemeToggle";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href.replace(/\/$/, ""));
}

export function Header() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > prev && y > 160 && !open);
  });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled ? "border-fg/10 bg-ground/70 backdrop-blur-xl" : "border-transparent bg-transparent",
        )}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="wrap flex items-center justify-between gap-4 py-3.5">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-7 text-[15px] font-semibold lg:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className={cn("nl relative py-2", isActive(pathname, n.href) && "!text-fg")}>
                {n.label}
                {isActive(pathname, n.href) && (
                  <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded bg-blue" />
                )}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle className="!h-11 !w-11" />
            <Button href="/contact/" size="sm">
              Get in touch
            </Button>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle className="!h-11 !w-11" />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-fg/15"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 bg-ground/95 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <nav aria-label="Mobile" className="wrap flex flex-col gap-1 pt-28">
              {nav.map((n, i) => (
                <motion.div key={n.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-14 items-center border-b border-fg/10 font-display text-3xl font-bold",
                      isActive(pathname, n.href) ? "text-blue" : "text-fg",
                    )}
                  >
                    {n.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-8" onClick={() => setOpen(false)}>
                <Button href="/contact/">Get in touch</Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
