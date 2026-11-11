import { Button } from "@/components/ui/Button";
import { FlowWindow } from "@/components/ui/AppMocks";
import { Reveal } from "@/components/ui/Reveal";
import { TiltOnScroll } from "@/components/ui/TiltOnScroll";
import { SplitReveal } from "@/components/ui/SplitReveal";

export function Showcase() {
  return (
    <section className="wrap py-24">
      <div className="flex flex-wrap items-center gap-12">
        <Reveal className="min-w-0 flex-[1_1_380px]">
          <h2 className="mt-3 text-[34px] font-bold leading-[1.1] tracking-[-1.5px] md:text-[44px]"><SplitReveal text="We use what we build." /></h2>
          <p className="mt-5 text-[17px] leading-relaxed text-muted">
            Flow, Spendly, Kivo and Unreel started as tools we wanted ourselves. That is the standard we bring to client work: software that holds up in daily use.
          </p>
          <div className="mt-8">
            <Button href="/products/flow/">See Flow in detail</Button>
          </div>
        </Reveal>
        <TiltOnScroll className="min-w-0 flex-[1_1_560px]">
          <FlowWindow />
          <div className="absolute -bottom-8 right-2 md:-right-5" style={{ transform: "translateZ(80px)" }}>
            <div className="floaty rounded-[14px] border border-[rgba(90,176,255,.5)] bg-card px-[18px] py-3.5 text-[13px] shadow-[0_20px_40px_-12px_rgba(10,132,255,.5)]">
              <div className="font-mono text-[11px] text-blue-light">NEW IN FLOW</div>
              <div className="mt-1 font-bold">Daily goals with streaks</div>
            </div>
          </div>
        </TiltOnScroll>
      </div>
    </section>
  );
}
