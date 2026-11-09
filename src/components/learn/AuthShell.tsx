import { CalendarRange, Flame, LineChart } from "lucide-react";

export function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="wrap grid grid-cols-1 items-center gap-12 py-12 md:py-20 lg:grid-cols-2">
      <div className="hidden lg:block">
        <span className="eyebrow">Invicly Learn</span>
        <h2 className="mt-4 text-[40px] font-extrabold leading-[1.08] tracking-[-1.5px]">
          Your plan, your pace, <span className="text-shimmer">your progress.</span>
        </h2>
        <ul className="mt-8 space-y-5 text-muted">
          {[
            [CalendarRange, "Every topic scheduled on a real date"],
            [LineChart, "See if you are ahead or behind, at a glance"],
            [Flame, "Streaks and a heatmap of every study day"],
          ].map(([I, t], i) => {
            const Icon = I as typeof Flame;
            return (
              <li key={i} className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue/10 text-blue-light">
                  <Icon size={20} aria-hidden />
                </span>
                {t as string}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="surface mx-auto w-full max-w-md rounded-3xl p-7 md:p-9">
        <h1 className="text-[30px] font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted">{sub}</p>
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
