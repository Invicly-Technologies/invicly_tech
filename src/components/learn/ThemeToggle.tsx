"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { THEME_KEY } from "@/lib/learn/theme";
import { cn } from "@/lib/cn";

type Theme = "light" | "dark";

/** Simple Sun / Moon switch used in both the Invicly Tech and Invicly Learn headers. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
    // Keep several toggles (desktop + mobile, or other tabs) in sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_KEY) return;
      const t: Theme = e.newValue === "light" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", t);
      setTheme(t);
    };
    const onLocal = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener("storage", onStorage);
    window.addEventListener("il-theme", onLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("il-theme", onLocal);
    };
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    window.dispatchEvent(new CustomEvent("il-theme", { detail: next }));
    setTheme(next);
  };

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={toggle}
      data-tour="theme"
      aria-label={label}
      title={label}
      className={cn(
        "relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-fg/15 text-fg transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-blue/70 hover:shadow-[0_10px_28px_-12px_rgba(10,132,255,.8)]",
        className,
      )}
    >
      {/* Shows the mode you will switch to: sun in dark mode, moon in light mode. */}
      <Sun size={18} aria-hidden className={cn("absolute transition-[rotate,scale,opacity] duration-500", theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0")} />
      <Moon size={18} aria-hidden className={cn("absolute transition-[rotate,scale,opacity] duration-500", theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0")} />
    </button>
  );
}
