import { Binary, Boxes, Brain, Bug, Cpu, Shield, Wifi, CheckCircle2, CircleDashed, Cloud, Code2, Coffee, Database, GitBranch, LayoutTemplate, Network, PauseCircle, Rocket, Server, Target, Terminal, TrendingDown, TrendingUp } from "lucide-react";
import type { LearningPath } from "@/data/learn/paths";
import type { PlanStatus } from "@/lib/learn/analytics";
import { cn } from "@/lib/cn";

const ICONS = {
  server: Server,
  git: GitBranch,
  coffee: Coffee,
  target: Target,
  code: Code2,
  layout: LayoutTemplate,
  cloud: Cloud,
  boxes: Boxes,
  database: Database,
  brain: Brain,
  network: Network,
  terminal: Terminal,
  shield: Shield,
  bug: Bug,
  cpu: Cpu,
  binary: Binary,
  wifi: Wifi,
} as const;

export function PathIcon({ icon, size = 22, className }: { icon: LearningPath["icon"]; size?: number; className?: string }) {
  const I = ICONS[icon];
  return (
    <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-blue/40 bg-blue/10 text-blue-light", className)}>
      <I size={size} aria-hidden />
    </span>
  );
}

const STATUS: Record<PlanStatus, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  completed: { label: "Completed", cls: "border-[#30D158]/40 bg-[#30D158]/10 text-ok", Icon: CheckCircle2 },
  ahead: { label: "Ahead of plan", cls: "border-[#30D158]/40 bg-[#30D158]/10 text-ok", Icon: TrendingUp },
  "on-track": { label: "On track", cls: "border-blue/40 bg-blue/10 text-blue-light", Icon: Rocket },
  behind: { label: "Behind", cls: "border-[#FF9F0A]/45 bg-[#FF9F0A]/10 text-warn", Icon: TrendingDown },
  paused: { label: "Paused", cls: "border-fg/20 bg-fg/5 text-muted", Icon: PauseCircle },
  "not-started": { label: "Starts soon", cls: "border-fg/20 bg-fg/5 text-muted", Icon: CircleDashed },
};

export function StatusBadge({ status, detail }: { status: PlanStatus; detail?: string }) {
  const s = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold", s.cls)}>
      <s.Icon size={14} aria-hidden />
      {s.label}
      {detail && <span className="font-semibold opacity-80">· {detail}</span>}
    </span>
  );
}

export function ProgressRing({ pct, size = 112, stroke = 10, label }: { pct: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${pct}% complete`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: "var(--ring-track)" }} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#0A84FF"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(100, pct) / 100)}
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-[26px] font-bold leading-none">{pct}%</div>
          {label && <div className="mt-1 text-[11px] text-quiet">{label}</div>}
        </div>
      </div>
    </div>
  );
}

export function Bar({ pct, className }: { pct: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-fg/[.07]", className)} aria-hidden>
      <div className="h-full rounded-full bg-blue transition-[width] duration-700" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="surface rounded-2xl p-5">
      <div className="text-[13px] font-semibold text-quiet">{label}</div>
      <div className="mt-2 font-display text-[28px] font-bold leading-none tracking-tight">{value}</div>
      {hint && <div className="mt-2 text-[13px] text-soft">{hint}</div>}
    </div>
  );
}
