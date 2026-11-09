import { LogoMark } from "@/components/ui/Logo";

const ORBITS = [
  { name: "Flow", accent: "#3D9BFF", scale: 0.62, dur: 18, delay: 0 },
  { name: "Spendly", accent: "#34D399", scale: 0.8, dur: 26, delay: -9 },
  { name: "Kivo", accent: "#A78BFA", scale: 1, dur: 34, delay: -20 },
  { name: "Unreel", accent: "#A3E635", scale: 0.9, dur: 30, delay: -4 },
];
const TILT = 64;

/** CSS-only version of the hero orbit, used when WebGL is unavailable, the device is low-power, the screen is narrow or motion is reduced. */
export function CssOrbitFallback({ size = 360 }: { size?: number }) {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden" style={{ perspective: 1000 }} aria-hidden="true">
      <div className="relative" style={{ width: size, height: size, transformStyle: "preserve-3d", transform: `rotateX(${TILT}deg) rotateZ(-14deg)` }}>
        {ORBITS.map((o, i) => (
          <div
            key={o.name}
            className="absolute left-1/2 top-1/2 rounded-full border border-dashed"
            style={{
              width: size * o.scale,
              height: size * o.scale,
              marginLeft: (-size * o.scale) / 2,
              marginTop: (-size * o.scale) / 2,
              borderColor: `${o.accent}66`,
              animation: `orbit-spin ${o.dur}s linear infinite`,
              animationDelay: `${o.delay}s`,
              animationDirection: i % 2 ? "reverse" : "normal",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" style={{ transformStyle: "preserve-3d" }}>
              <div style={{ animation: `orbit-spin ${o.dur}s linear infinite`, animationDelay: `${o.delay}s`, animationDirection: i % 2 ? "normal" : "reverse", transformStyle: "preserve-3d" }}>
                <div style={{ transform: `rotateZ(14deg) rotateX(-${TILT}deg)` }}>
                  <span
                    className="flex items-center gap-2 whitespace-nowrap rounded-xl border bg-[rgba(8,14,28,.92)] px-3 py-1.5 font-display text-[13px] font-bold text-white"
                    style={{ borderColor: o.accent, boxShadow: `0 0 18px -4px ${o.accent}` }}
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-md text-[11px]" style={{ background: o.accent }}>{o.name[0]}</span>
                    {o.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* core */}
      <div className="absolute grid place-items-center" style={{ width: size * 0.34, height: size * 0.34 }}>
        <div className="absolute inset-0 rounded-[32%] opacity-90 blur-[2px]" style={{ background: "conic-gradient(from var(--angle), #0A84FF, #A78BFA, #34D399, #5AB0FF, #0A84FF)", animation: "border-spin 6s linear infinite" }} />
        <div className="absolute inset-[3px] rounded-[30%] bg-[#050b18]" />
        <div className="absolute inset-0 rounded-full bg-blue/30 blur-2xl" style={{ animation: "pulse-soft 3s ease-in-out infinite" }} />
        <div className="relative floaty"><LogoMark size={size * 0.17} /></div>
      </div>
    </div>
  );
}
