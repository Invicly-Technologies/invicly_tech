"use client";
import { useEffect, useRef } from "react";

/**
 * Hero background: a fine blueprint dot grid. Near the pointer the dots brighten, lean toward it and
 * join their neighbours with short traces, like a circuit lighting up under your hand. A click sends a
 * ring through the grid; when the pointer rests, a slow ring passes now and then so the field never looks dead.
 *
 * Cheap by design: it only animates while something is happening (pointer energy or a ring), draws one static
 * frame otherwise, pauses off-screen and in background tabs, and stays still for reduced motion and touch.
 */
export function BlueprintField({ className, quiet = false }: { className?: string; quiet?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches;
    const GAP = 28; // grid pitch in CSS px
    const R = 210; // pointer reach
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0, h = 0, cols = 0, rows = 0, ox = 0, oy = 0;
    // lastIdleRing starts in the past so the first ring arrives ~1.5s after load, before anyone moves the mouse.
    let raf = 0, visible = true, energy = 0, lastMove = performance.now(), lastIdleRing = performance.now() - 7700;
    const target = { x: -1e4, y: -1e4 };
    const cur = { x: -1e4, y: -1e4 };
    // max: how far the ring travels before it has fully faded (hover pulses stay small, clicks travel further).
    type Ring = { x: number; y: number; t0: number; speed: number; strength: number; max: number };
    const rings: Ring[] = [];
    let lit = new Float32Array(0);

    const palette = () => {
      const light = document.documentElement.getAttribute("data-theme") === "light";
      // `quiet` is the site-wide background: dimmer at rest so long text stays easy to read.
      const k = quiet ? 0.4 : 1;
      return light ? { dot: "10,99,201", base: 0.3 * k, trace: "10,99,201" } : { dot: "90,176,255", base: 0.34 * k, trace: "120,190,255" };
    };
    let pal = palette();
    // How strongly the pointer and rings light the grid; the site-wide background keeps it soft.
    const glow = quiet ? 0.45 : 1;

    const resize = () => {
      const r = host.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / GAP) + 1;
      rows = Math.ceil(h / GAP) + 1;
      ox = (w - (cols - 1) * GAP) / 2;
      oy = (h - (rows - 1) * GAP) / 2;
      lit = new Float32Array(cols * rows);
      draw(performance.now());
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      cur.x += (target.x - cur.x) * 0.18;
      cur.y += (target.y - cur.y) * 0.18;
      for (let i = rings.length - 1; i >= 0; i--) if ((now - rings[i].t0) * rings[i].speed > rings[i].max) rings.splice(i, 1);

      // 1. how lit each dot is (pointer + rings), and where it sits after leaning toward the pointer
      const px = new Float32Array(cols * rows);
      const py = new Float32Array(cols * rows);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          const x = ox + i * GAP, y = oy + j * GAP;
          const dx = cur.x - x, dy = cur.y - y;
          const d = Math.hypot(dx, dy);
          let v = d < R ? (1 - d / R) ** 2 * energy : 0;
          let nx = x, ny = y;
          if (v > 0 && d > 0.001) {
            const pull = v * 9;
            nx += (dx / d) * pull;
            ny += (dy / d) * pull;
          }
          for (const rg of rings) {
            const radius = (now - rg.t0) * rg.speed;
            const band = Math.abs(Math.hypot(x - rg.x, y - rg.y) - radius);
            if (band < 36) v = Math.max(v, (1 - band / 36) * rg.strength * Math.max(0, 1 - radius / rg.max));
          }
          lit[k] = v;
          px[k] = nx;
          py[k] = ny;
        }
      }

      // 2. traces between lit neighbours (right and down), like a circuit lighting up
      ctx.lineWidth = 1;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          const a = lit[k];
          if (a < 0.12) continue;
          if (i + 1 < cols) {
            const b = lit[k + 1];
            if (b > 0.12) {
              ctx.strokeStyle = `rgba(${pal.trace},${Math.min(a, b) * 0.55 * glow})`;
              ctx.beginPath();
              ctx.moveTo(px[k], py[k]);
              ctx.lineTo(px[k + 1], py[k + 1]);
              ctx.stroke();
            }
          }
          if (j + 1 < rows) {
            const b = lit[k + cols];
            if (b > 0.12) {
              ctx.strokeStyle = `rgba(${pal.trace},${Math.min(a, b) * 0.55 * glow})`;
              ctx.beginPath();
              ctx.moveTo(px[k], py[k]);
              ctx.lineTo(px[k + cols], py[k + cols]);
              ctx.stroke();
            }
          }
        }
      }

      // 3. dots
      for (let k = 0; k < cols * rows; k++) {
        const v = lit[k];
        ctx.fillStyle = `rgba(${pal.dot},${pal.base + v * 0.8 * glow})`;
        const r = (quiet ? 0.85 : 1.05) + v * (quiet ? 0.9 : 1.5);
        ctx.fillRect(px[k] - r, py[k] - r, r * 2, r * 2);
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const resting = now - lastMove > 1200;
      energy += ((resting ? 0 : 1) - energy) * (resting ? 0.04 : 0.15);
      if (resting && now - lastIdleRing > 9000 && rings.length === 0) {
        lastIdleRing = now;
        rings.push({ x: w * (0.15 + Math.random() * 0.7), y: h * (0.2 + Math.random() * 0.6), t0: now, speed: 0.22, strength: 0.45, max: 900 });
      }
      draw(now);
      // keep running while anything is visibly moving; the idle ring timer restarts us via a timeout
      if (energy > 0.01 || rings.length || Math.hypot(target.x - cur.x, target.y - cur.y) > 0.5) raf = requestAnimationFrame(loop);
      else idleTimer = window.setTimeout(kick, 9100);
    };
    let idleTimer = 0;
    const kick = () => {
      window.clearTimeout(idleTimer);
      if (!raf && !still) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < -R || y < -R || x > r.width + R || y > r.height + R) return;
      if (cur.x < -1e3) { cur.x = x; cur.y = y; }
      target.x = x;
      target.y = y;
      lastMove = performance.now();
      kick();
    };
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      rings.push({ x, y, t0: performance.now(), speed: 0.55, strength: 0.9, max: 900 });
      kick();
    };
    // Rings started from page coordinates (viewport), capped so a busy page never stacks up dozens.
    const pulseAt = (cx: number, cy: number, strength: number, max: number) => {
      const r = canvas.getBoundingClientRect();
      const x = cx - r.left, y = cy - r.top;
      if (x < -max || y < -max || x > r.width + max || y > r.height + max) return;
      if (rings.length >= 4) rings.shift();
      rings.push({ x, y, t0: performance.now(), speed: 0.32, strength, max });
      kick();
    };
    // Hovering a button, link-card or other control sends a small ring out from it, so the background answers the UI.
    let lastTarget: Element | null = null;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest?.("a.surface, a.btn, button.btn, .btn, .card3d, [data-pulse]");
      if (!el || el === lastTarget) return;
      lastTarget = el;
      const b = el.getBoundingClientRect();
      pulseAt(b.left + b.width / 2, b.top + b.height / 2, 0.55, Math.max(160, Math.min(360, Math.max(b.width, b.height) * 1.1)));
    };
    const onOut = (e: PointerEvent) => {
      if (lastTarget && !lastTarget.contains(e.relatedTarget as Node | null)) lastTarget = null;
    };
    const onPulse = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number; strength?: number }>).detail;
      if (d) pulseAt(d.x, d.y, d.strength ?? 0.8, 520);
    };
    const onLeave = () => {
      lastMove = 0;
      kick();
    };

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) kick();
    });
    const ro = new ResizeObserver(resize);
    const mo = new MutationObserver(() => {
      pal = palette();
      draw(performance.now());
    });

    resize();
    ro.observe(host);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (!still) {
      io.observe(canvas);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      document.addEventListener("pointerover", onOver, { passive: true });
      document.addEventListener("pointerout", onOut, { passive: true });
      window.addEventListener("field:pulse", onPulse);
      document.documentElement.addEventListener("pointerleave", onLeave);
      document.addEventListener("visibilitychange", kick);
      idleTimer = window.setTimeout(kick, 1300);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("field:pulse", onPulse);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", kick);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      // Fade the grid out toward the edges so it reads as a field, not a sheet of graph paper.
      style={quiet ? undefined : { maskImage: "radial-gradient(130% 100% at 55% 40%, #000 45%, transparent 92%)", WebkitMaskImage: "radial-gradient(130% 100% at 55% 40%, #000 45%, transparent 92%)" }}
    />
  );
}
