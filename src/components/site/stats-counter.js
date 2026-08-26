"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

function Counter({ value }) {
  const match = String(value).match(/^([\d.,]+)(.*)$/);
  const numeric = match ? parseFloat(match[1].replace(/,/g, "")) : null;
  const suffix = match ? match[2] : "";
  const prefix = match ? "" : "";

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(numeric === null ? value : "0");

  useEffect(() => {
    if (!inView || numeric === null) return;
    const controls = animate(0, numeric, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Number.isInteger(numeric) ? Math.round(v).toString() : v.toFixed(1)),
    });
    return () => controls.stop();
  }, [inView, numeric]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export function StatsCounter({ stats }) {
  if (!stats?.length) return null;
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={i} className="text-center">
          <div className="gradient-text text-3xl font-bold sm:text-4xl">
            <Counter value={stat.value} />
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
