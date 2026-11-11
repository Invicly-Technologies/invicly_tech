import type { ReactNode } from "react";

/** Closing call-to-action band. Static on purpose: the hero carries the site's one interactive moment. */
export function CtaBand({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <section className="wrap pb-24 pt-10">
      <div className="relative overflow-hidden rounded-[32px] border border-blue/40 bg-deep px-6 py-14 text-center md:px-12 md:py-[72px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-[640px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(10,132,255,.35), transparent)" }}
        />
        <h2 className="relative text-[34px] font-extrabold leading-[1.08] tracking-[-1.5px] md:text-[52px]">{title}</h2>
        <p className="relative mx-auto mt-5 max-w-[560px] text-lg leading-relaxed text-muted">{body}</p>
        <div className="relative mt-9 flex flex-wrap justify-center gap-3.5">{children}</div>
      </div>
    </section>
  );
}
