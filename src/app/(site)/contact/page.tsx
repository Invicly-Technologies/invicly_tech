import type { Metadata } from "next";
import { siteOg } from "@/lib/seo";
import { Clock, Mail } from "lucide-react";
import { site } from "@/data/site";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitReveal } from "@/components/ui/SplitReveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell Invicly Tech what you want to build. Email inviclytech@gmail.com or use the form. We reply within one business day.",
  alternates: { canonical: "/contact/" },
  openGraph: siteOg("/contact/"),
};

const steps = [
  { title: "We read it", body: "An engineer reads your message, not a sales script." },
  { title: "We reply", body: "Within one business day, with questions or a suggested plan." },
  { title: "We scope it", body: "A short call, then a clear scope, timeline and price." },
];

export default function ContactPage() {
  return (
    <>
      <section className="wrap pb-20 pt-32 md:pt-40">
        <div className="flex flex-wrap items-start gap-12 md:gap-16">
          <Reveal className="min-w-0 flex-[1_1_420px]">
            <Eyebrow>Contact</Eyebrow>
            <h1 className="mt-4 text-[42px] font-extrabold leading-[1.05] tracking-[-2px] md:text-[60px]">
              <SplitReveal text="Tell us what you" onMount delay={0.1} />
              <br />
              <SplitReveal text="want to" onMount delay={0.3} /> <SplitReveal text="build." onMount delay={0.42} pieceClassName="text-shimmer" />
            </h1>
            <p className="mt-6 max-w-[480px] text-lg leading-relaxed text-muted">Share a few details and we will reply within one business day with questions or a plan.</p>
            <div className="surface mt-9 flex flex-col gap-[18px] rounded-[20px] p-[26px]">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-blue/15">
                  <Mail size={22} className="text-[#3D9BFF]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs text-quiet">Email</div>
                  <a href={`mailto:${site.email}`} className="-my-2 inline-block break-all py-2 text-[17px] font-bold hover:text-blue-light">
                    {site.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-blue/15">
                  <Clock size={22} className="text-[#3D9BFF]" aria-hidden="true" />
                </span>
                <div>
                  <div className="text-xs text-quiet">Response time</div>
                  <div className="text-[17px] font-bold">{site.replyTime}</div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-soft">
              <span className="pulse-dot inline-block h-2.5 w-2.5 rounded-full bg-[#34D399]" />
              Taking on new projects
            </div>
          </Reveal>
          <ContactForm />
        </div>
      </section>

      <section className="border-t border-line bg-deep pb-24 pt-20">
        <div className="wrap">
          <Eyebrow>What happens next</Eyebrow>
          <Stagger className="mt-9 grid gap-10 md:grid-cols-3">
            {steps.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue font-extrabold">{i + 1}</div>
                <h2 className="mt-5 text-[22px]">{s.title}</h2>
                <p className="mt-2.5 leading-relaxed text-soft">{s.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
