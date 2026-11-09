/** Static, decorative app mockups used on the product pages. */

function Task({ label, pri, done, ring }: { label: string; pri?: { t: string; c: string }; done?: boolean; ring?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-white/[.08] p-3 text-sm">
      <span
        className="h-4 w-4 flex-none rounded-full"
        style={done ? { background: "#0A84FF" } : { border: `2px solid ${ring ?? "#0A84FF"}` }}
      />
      <span className={done ? "text-[#6F7F9E] line-through" : ""}>{label}</span>
      {pri && (
        <span className="ml-auto text-[11px]" style={{ color: pri.c }}>
          {pri.t}
        </span>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-[10px] bg-[#101A31] p-3 text-xs text-soft">
      {label}
      <div className="mt-1 text-[15px] font-bold text-white">{value}</div>
    </div>
  );
}

export function FlowDay({ goals = 2 }: { goals?: 1 | 2 }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="font-display text-xl font-bold">My day</div>
      <div className="h-1.5 rounded bg-[#16203A]">
        <div className="h-1.5 w-[55%] rounded bg-blue" />
      </div>
      <Task label="Review sprint board" pri={{ t: "P1", c: "#FF7A7A" }} />
      <Task label="Pay electricity bill" pri={{ t: "P2", c: "#FFB454" }} ring="#5A6A8A" />
      <Task label="Plan the week" done />
      <div className="mt-1 flex gap-2.5">
        <Stat label="Read 20 pages" value="18 day streak" />
        {goals === 2 && <Stat label="Water" value="6 of 8 glasses" />}
      </div>
    </div>
  );
}

export function FlowWindow({ url = "flow.invicly.com" }: { url?: string }) {
  return (
    <div className="overflow-hidden rounded-[18px] force-dark border border-white/[.14] bg-panel shadow-[0_50px_90px_-30px_rgba(10,132,255,.5)]">
      <div className="flex items-center gap-2 border-b border-white/[.08] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#3A4560]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3A4560]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3A4560]" />
        <span className="ml-3.5 font-mono text-xs text-quiet">{url}</span>
      </div>
      <div className="flex">
        <div className="hidden w-[150px] flex-none flex-col gap-1.5 border-r border-white/[.08] px-3.5 py-[18px] text-[13px] text-soft sm:flex">
          <div className="rounded-lg bg-blue/[.18] px-3 py-[9px] font-semibold text-white">My day</div>
          {["Inbox", "Plan", "Daily goals", "Projects"].map((s) => (
            <div key={s} className="px-3 py-[9px]">
              {s}
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1 px-6 py-5">
          <FlowDay />
        </div>
      </div>
    </div>
  );
}

export function FlowCard() {
  return (
    <div className="w-[380px] max-w-full rounded-[18px] force-dark border border-white/[.14] bg-panel p-[22px] shadow-[0_40px_80px_-30px_rgba(10,132,255,.5)]">
      <FlowDay goals={1} />
    </div>
  );
}

export function SpendlyCard() {
  return (
    <div className="w-[300px] max-w-full rounded-[28px] force-dark border border-white/[.14] bg-panel p-[22px] shadow-[0_40px_80px_-30px_rgba(52,211,153,.4)]">
      <div className="text-xs text-quiet">Spendly chat</div>
      <div className="ml-auto mt-3 w-max rounded-[14px_14px_4px_14px] bg-[#0F3B2E] px-3.5 py-2.5 text-sm text-[#C6F6E4]">swiggy 450 upi</div>
      <div className="mt-2.5 w-max rounded-[14px_14px_14px_4px] bg-[#141E36] px-3.5 py-2.5 text-sm">Added ₹450 to Food</div>
      <div className="mt-[18px] border-t border-white/[.08] pt-3.5 text-xs text-quiet">Due soon</div>
      <div className="mt-2.5 flex justify-between text-sm">
        <span>Credit card</span>
        <span className="text-[#FFB454]">in 3 days</span>
      </div>
      <div className="mt-2 flex justify-between text-sm">
        <span>Home loan EMI</span>
        <span className="text-quiet">in 9 days</span>
      </div>
    </div>
  );
}

export function KivoCard() {
  return (
    <div className="w-[390px] max-w-full rounded-[18px] force-dark border border-white/[.14] bg-panel p-[22px] shadow-[0_40px_80px_-30px_rgba(167,139,250,.4)]">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg font-bold">Kivo Lifetime</span>
        <span className="rounded-full border border-[rgba(126,226,176,.4)] px-2.5 py-[3px] text-xs text-[#7EE2B0]">Active</span>
      </div>
      <div className="mt-2.5 font-mono text-xs text-quiet">KIVO-LT-****-****-****-X91Q</div>
      <div className="mt-4 text-[13px] text-soft">Installations · 2 of 3</div>
      <div className="mt-2.5 rounded-[10px] border border-white/[.08] p-3 text-[13px]">
        <b>Production</b>
        <div className="mt-1 text-quiet">time.acme.example · v1.19.2 · 38 users</div>
      </div>
      <div className="mt-2 rounded-[10px] border border-white/[.08] p-3 text-[13px]">
        <b>Staging</b>
        <div className="mt-1 text-quiet">staging.acme.example · v1.19.2 · 4 users</div>
      </div>
    </div>
  );
}

export function UnreelCard() {
  return (
    <div className="flex h-[330px] w-[230px] flex-col items-center rounded-[34px] border border-white/[.18] bg-[#0A100B] px-5 py-[26px] text-center shadow-[0_40px_80px_-30px_rgba(163,230,53,.35)]">
      <svg className="sway" width="96" height="110" viewBox="0 0 96 110" fill="none" stroke="#A3E635" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M48 104V56" />
        <path d="M48 58C48 32 66 20 90 22 90 46 74 58 48 58Z" />
        <path d="M48 74C48 54 34 44 8 46 8 66 22 74 48 74Z" />
      </svg>
      <div className="mt-3.5 font-display text-[64px] font-extrabold leading-none">0</div>
      <div className="mt-1.5 text-xs text-[#9FB0A0]">reels and shorts today</div>
      <div className="mt-[18px] inline-block rounded-full border border-[rgba(163,230,53,.35)] px-3 py-[5px] text-xs text-[#C8F08A]">Sprout is thriving</div>
    </div>
  );
}

export const productMocks = { flow: FlowCard, spendly: SpendlyCard, kivo: KivoCard, unreel: UnreelCard };
