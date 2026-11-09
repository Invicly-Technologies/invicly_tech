"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LogoScene = dynamic(() => import("./LogoScene"), { ssr: false, loading: () => null });

function canUseWebGL() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Layered CSS version: 14 stacked copies of the mark give it real thickness as it sways. */
function CssLogo3D() {
  const layers = 14;
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 900 }} aria-hidden="true">
      <div className="relative h-[159px] w-[220px]" style={{ transformStyle: "preserve-3d", animation: "logo-sway 7s ease-in-out infinite" }}>
        {Array.from({ length: layers }, (_, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src="/brand/invicly-mark.png"
            alt=""
            width={220}
            height={159}
            className="absolute inset-0"
            style={{
              transform: `translateZ(${(i - layers / 2) * 1.6}px)`,
              filter: i === layers - 1 ? "drop-shadow(0 0 30px rgba(10,132,255,.6))" : `brightness(${0.35 + (i / layers) * 0.4})`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function LogoVisual() {
  const [mode, setMode] = useState<"pending" | "webgl" | "css">("pending");
  useEffect(() => setMode(canUseWebGL() ? "webgl" : "css"), []);
  return (
    <div className="relative h-[340px] w-full md:h-[440px]">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/20 blur-[90px]" />
      {mode === "webgl" && <LogoScene />}
      {mode === "css" && <CssLogo3D />}
    </div>
  );
}
