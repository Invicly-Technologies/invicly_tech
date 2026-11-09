import { LogoMark } from "@/components/ui/Logo";

/** Lightweight CSS logo visual (no WebGL), matching the hero's orbit core. */
export function LogoCore() {
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[420px] place-items-center overflow-hidden" aria-hidden="true">
      <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgba(10,132,255,.28),transparent_65%)] blur-2xl" />
      {[100, 76, 54].map((s, i) => (
        <div
          key={s}
          className="absolute rounded-full border"
          style={{
            width: `${s}%`,
            height: `${s}%`,
            borderColor: `rgba(90,176,255,${0.1 + i * 0.08})`,
            borderStyle: i === 1 ? "dashed" : "solid",
            animation: `orbit-spin ${40 - i * 10}s linear infinite${i % 2 ? " reverse" : ""}`,
          }}
        >
          <span
            className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: ["#3D9BFF", "#A78BFA", "#34D399"][i], boxShadow: `0 0 14px 3px ${["#3D9BFF", "#A78BFA", "#34D399"][i]}` }}
          />
        </div>
      ))}
      <div className="relative grid h-[38%] w-[38%] place-items-center rounded-[30%]">
        <span
          className="absolute -inset-px rounded-[inherit] opacity-90"
          style={{ background: "conic-gradient(from var(--angle), #0A84FF, #A78BFA, #34D399, #5AB0FF, #0A84FF)", animation: "border-spin 7s linear infinite" }}
        />
        <span className="absolute inset-[2px] rounded-[inherit] bg-[linear-gradient(160deg,#0b1a33,#050b18_60%)] shadow-[inset_0_1px_0_rgba(255,255,255,.12)]" />
        <span className="absolute -inset-6 rounded-full bg-blue/25 blur-2xl" style={{ animation: "pulse-soft 3.2s ease-in-out infinite" }} />
        <span className="relative floaty">
          <LogoMark size={92} />
        </span>
      </div>
    </div>
  );
}
