import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const ogSize = { width: 1200, height: 630 };

let logo: string | null = null;
const mark = () => (logo ??= `data:image/png;base64,${readFileSync(join(process.cwd(), "public/brand/invicly-mark-256.png")).toString("base64")}`);

/** Branded 1200×630 share image used by every Learn page. */
export function ogImage({ eyebrow, title, subtitle, chips = [] }: { eyebrow: string; title: string; subtitle?: string; chips?: string[] }) {
  const size = title.length > 60 ? 54 : title.length > 36 ? 64 : 76;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#03060c",
          backgroundImage: "radial-gradient(circle at 85% 15%, rgba(10,132,255,.45), transparent 45%), radial-gradient(circle at 10% 110%, rgba(22,80,160,.6), transparent 50%)",
          color: "#f5f8ff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark()} width={64} height={46} alt="" />
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
            Invicly<span style={{ color: "#0A84FF" }}>Learn</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, color: "#5AB0FF", letterSpacing: 4, textTransform: "uppercase", marginBottom: 18 }}>{eyebrow}</div>
          <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1050 }}>{title}</div>
          {subtitle && <div style={{ marginTop: 22, fontSize: 30, color: "#b4c0d8", lineHeight: 1.35, maxWidth: 1000 }}>{subtitle.length > 140 ? `${subtitle.slice(0, 137)}…` : subtitle}</div>}
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {chips.slice(0, 4).map((c) => (
            <div key={c} style={{ display: "flex", padding: "10px 20px", borderRadius: 999, border: "2px solid rgba(10,132,255,.55)", background: "rgba(10,132,255,.12)", color: "#cfe0ff", fontSize: 24 }}>
              {c}
            </div>
          ))}
          <div style={{ display: "flex", marginLeft: "auto", fontSize: 24, color: "#8fa0bd", alignItems: "center" }}>invicly.com/learn</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
