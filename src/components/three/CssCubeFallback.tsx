import { LogoMark } from "@/components/ui/Logo";

const faces = [
  { label: "Flow", t: "translateZ(var(--h))" },
  { label: "Spendly", t: "rotateY(90deg) translateZ(var(--h))" },
  { label: "Kivo", t: "rotateY(180deg) translateZ(var(--h))" },
  { label: "Unreel", t: "rotateY(-90deg) translateZ(var(--h))" },
  { label: "mark", t: "rotateX(90deg) translateZ(var(--h))" },
  { label: "", t: "rotateX(-90deg) translateZ(var(--h))" },
];

/** CSS 3D cube used when WebGL is unavailable, the device is low-power or the screen is narrow. */
export function CssCubeFallback({ size = 200 }: { size?: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 1200 }}>
      <div
        className="relative"
        style={
          {
            width: size,
            height: size,
            transformStyle: "preserve-3d",
            animation: "css-cube 20s linear infinite",
            transform: "rotateX(-22deg)",
            "--h": `${size / 2}px`,
          } as React.CSSProperties
        }
      >
        {faces.map((f, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center border border-[rgba(90,176,255,.55)] bg-[rgba(10,132,255,.1)] font-display font-bold text-white"
            style={{ transform: f.t, backfaceVisibility: "hidden", fontSize: size * 0.13, boxShadow: "inset 0 0 30px rgba(10,132,255,.25)" }}
          >
            {f.label === "mark" ? <LogoMark size={size * 0.5} /> : f.label}
          </div>
        ))}
      </div>
    </div>
  );
}
