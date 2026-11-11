import type { Metadata } from "next";
import { siteOg } from "@/lib/seo";
import { LogoCore } from "@/components/ui/LogoCore";
import Link from "next/link";
import { process, values } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Card3D } from "@/components/ui/Card3D";
import { CtaBand } from "@/components/ui/CtaBand";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SplitReveal } from "@/components/ui/SplitReveal";

export const metadata: Metadata = {
  title: "About",
  description: "Invicly Tech is a product and services company. We build our own software and use the same skills to build websites, apps and cloud setups for clients.",
  alternates: { canonical: "/about/" },
  openGraph: siteOg("/about/"),
};

export default function AboutPage() {
  return (
    <>
      <section className="wrap pb-20 pt-32 md:pt-40">
        <div className="flex flex-wrap items-center gap-12">
          <Reveal className="min-w-0 flex-[1_1_520px]">
            <h1 className="mt-4 text-[42px] font-extrabold leading-[1.05] tracking-[-2px] md:text-[64px]">
              <SplitReveal text="We build what" onMount delay={0.1} />
              <br />
              <SplitReveal text="we would want" onMount delay={0.25} />
              <br />
              <SplitReveal text="to use." onMount delay={0.4} pieceClassName="text-shimmer" />
            </h1>
            <p className="mt-6 max-w-[560px] text-lg leading-[1.7] text-muted">
              Invicly Tech is a product and services company. We make our own software, Flow, Spendly, Kivo and Unreel, and we use the same skills to build websites, apps and cloud setups for clients.
            </p>
          </Reveal>
          <Reveal className="min-w-0 flex-[1_1_380px]" delay={0.2}>
            <LogoCore />
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-deep py-[70px]">
        <Stagger className="wrap grid gap-5 md:grid-cols-2">
          <StaggerItem className="flex">
            <Card3D className="w-full rounded-3xl p-8 md:p-10">
              <h2 className="mt-3.5 text-[28px] leading-[1.2] md:text-[32px]"><SplitReveal text="Software for everyday use" /></h2>
              <p className="mt-4 leading-[1.7] text-muted">Task management, personal finance, time tracking and digital wellbeing. Each product does one job and is free to use.</p>
              <Link href="/products/" className="mt-5 inline-flex min-h-11 items-center font-bold text-blue-light hover:text-fg">
                See the products
              </Link>
            </Card3D>
          </StaggerItem>
          <StaggerItem className="flex">
            <Card3D className="w-full rounded-3xl p-8 md:p-10">
              <h2 className="mt-3.5 text-[28px] leading-[1.2] md:text-[32px]"><SplitReveal text="Engineering for your business" /></h2>
              <p className="mt-4 leading-[1.7] text-muted">Websites, Android apps, Windows and Linux software, cloud and server management, support and consulting.</p>
              <Link href="/services/" className="mt-5 inline-flex min-h-11 items-center font-bold text-blue-light hover:text-fg">
                See the services
              </Link>
            </Card3D>
          </StaggerItem>
        </Stagger>
      </section>

      <section className="wrap py-24">
        <h2 className="mt-3 text-[34px] font-bold tracking-[-1.5px] md:text-[44px]"><SplitReveal text="How we work." /></h2>
        <Stagger className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <StaggerItem key={v.title} className="flex">
              <Card3D className="w-full rounded-[20px] p-[30px]">
                <h3 className="text-[22px]">{v.title}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-soft">{v.body}</p>
              </Card3D>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-t border-line bg-deep py-20">
        <div className="wrap flex flex-wrap gap-14">
          <Reveal className="min-w-0 flex-[1_1_360px]">
            <h2 className="mt-3 text-[34px] font-bold leading-[1.1] tracking-[-1.5px] md:text-[44px]"><SplitReveal text="Think. Build. Invicly." /></h2>
          </Reveal>
          <div className="flex min-w-0 flex-[1_1_560px] flex-col">
            {process.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <div className={`flex flex-wrap gap-x-6 gap-y-2 py-[26px] ${i < process.length - 1 ? "border-b border-line" : ""}`}>
                  <div className="min-w-[110px] font-display text-[26px] font-extrabold text-blue">{p.title}</div>
                  <p className="min-w-0 flex-1 basis-[260px] leading-relaxed text-muted">{p.about}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="pt-20">
        <CtaBand title="Let us build something together." body="Tell us about your project. We reply within one business day.">
          <Button href="/contact/">Get in touch</Button>
        </CtaBand>
      </div>
    </>
  );
}
