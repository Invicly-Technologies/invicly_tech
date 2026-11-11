import type { Metadata } from "next";
import { engagements, services } from "@/data/services";
import { site } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Card3D } from "@/components/ui/Card3D";
import { CtaBand } from "@/components/ui/CtaBand";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { JsonLd, abs, organizationRef, siteOg } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Services",
  description: "Website development, Android apps, Windows and Linux software, cloud management, Linux servers, support, IT consulting and automation from Invicly Tech.",
  alternates: { canonical: "/services/" },
  openGraph: siteOg("/services/"),
};

function Gyro() {
  const rings = [
    { size: 300, anim: "gyro-1 9s linear infinite", color: "rgba(90,176,255,.55)" },
    { size: 236, anim: "gyro-2 7s linear infinite", color: "rgba(90,176,255,.6)" },
    { size: 172, anim: "gyro-3 5.5s linear infinite", color: "rgba(10,132,255,.95)" },
  ];
  return (
    <div aria-hidden="true" className="relative mx-auto h-[300px] max-w-full scale-[.82] md:h-[360px] md:scale-100" style={{ perspective: 900 }}>
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {/* slow dashed halo */}
        <div className="absolute left-1/2 top-1/2 -ml-[170px] -mt-[170px] h-[340px] w-[340px]" style={{ transform: "rotateX(72deg)", transformStyle: "preserve-3d" }}>
          <div className="h-full w-full rounded-full border border-dashed border-[rgba(90,176,255,.35)]" style={{ animation: "spin 24s linear infinite" }} />
        </div>
        {rings.map((r) => (
          <div
            key={r.size}
            className="gyro-ring border-[1.5px]"
            style={{ width: r.size, height: r.size, marginLeft: -r.size / 2, marginTop: -r.size / 2, borderColor: r.color, animation: r.anim, boxShadow: `0 0 18px ${r.color}` }}
          >
            <span className="gyro-dot" />
          </div>
        ))}
        {/* electrons on a tilted elliptical orbit */}
        {[0, 1].map((n) => (
          <div key={n} className="absolute left-1/2 top-1/2 -ml-[150px] -mt-[150px] h-[300px] w-[300px]" style={{ transform: `rotateX(74deg) rotateZ(${n * 90}deg)`, transformStyle: "preserve-3d" }}>
            <div className="relative h-full w-full" style={{ animation: `spin ${n ? 3.2 : 4.4}s linear infinite${n ? " reverse" : ""}` }}>
              <span className="absolute left-1/2 top-0 -ml-1 h-2 w-2 rounded-full bg-white shadow-[0_0_12px_4px_rgba(156,203,255,.9)]" />
            </div>
          </div>
        ))}
      </div>
      {/* flat layer so the glow never intersects the 3D rings */}
      <div className="pointer-events-none absolute inset-0">
          {/* pulsing core with shockwave */}
          <div className="absolute left-1/2 top-1/2 -ml-[60px] -mt-[60px] h-[120px] w-[120px] rounded-full border border-blue/60" style={{ animation: "shockwave 2.4s ease-out infinite" }} />
          <div className="absolute left-1/2 top-1/2 -ml-[60px] -mt-[60px] h-[120px] w-[120px] rounded-full border border-blue/40" style={{ animation: "shockwave 2.4s ease-out 1.2s infinite" }} />
          <div className="absolute left-1/2 top-1/2 -ml-[11px] -mt-[11px] h-[22px] w-[22px] rounded-full bg-blue" style={{ animation: "core-pulse 2.4s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={{
          "@type": "ItemList",
          name: "Invicly Tech services",
          itemListElement: services.map((sv, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: { "@type": "Service", name: sv.title, description: sv.summary, provider: organizationRef, areaServed: "Worldwide", url: abs("/services/") },
          })),
        }}
      />
      <section className="wrap pb-16 pt-32 md:pt-40">
        <div className="flex flex-wrap items-center gap-10">
          <Reveal className="min-w-0 flex-[1_1_560px]">
            <h1 className="mt-4 text-[42px] font-extrabold leading-[1.05] tracking-[-2px] md:text-[64px]">
              <SplitReveal text="Build it. Run it." onMount delay={0.1} />
              <br />
              <SplitReveal text="Keep it running." onMount delay={0.35} pieceClassName="text-shimmer" />
            </h1>
            <p className="mt-6 max-w-[560px] text-[19px] leading-relaxed text-muted">
              One team for websites, apps, servers and cloud. You talk to the people who write the code and manage the servers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Button href="/contact/">Request a quote</Button>
              <Button href={`mailto:${site.email}`} variant="ghost">
                {site.email}
              </Button>
            </div>
          </Reveal>
          <Reveal className="min-w-0 flex-[1_1_360px]" delay={0.2}>
            <Gyro />
          </Reveal>
        </div>
      </section>

      <section className="wrap pb-20">
        <Stagger className="grid gap-5 lg:grid-cols-2">
          {services.map((s, i) => (
            <StaggerItem key={s.slug} className="flex">
              <Card3D className="flex w-full flex-col gap-3.5 rounded-3xl p-7 md:p-9">
                <h2 id={s.slug} className="scroll-mt-32 text-[26px] font-bold md:text-[28px]">{s.title}</h2>
                <p className="leading-relaxed text-muted">{s.summary}</p>
                <ul className="mt-1.5 list-disc pl-5 text-[15px] leading-[1.9] text-soft marker:text-blue">
                  {s.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <span key={t} className="chp">
                      {t}
                    </span>
                  ))}
                </div>
              </Card3D>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-t border-line bg-deep py-20">
        <div className="wrap">
          <h2 className="mt-3 text-[34px] font-bold tracking-[-1.5px] md:text-[44px]"><SplitReveal text="Pick how you want to work." /></h2>
          <p className="mt-4 max-w-[560px] text-muted">No fixed price list. You get a quote after a short call.</p>
          <Stagger className="mt-11 grid gap-5 md:grid-cols-3">
            {engagements.map((e) => (
              <StaggerItem key={e.title} className="flex">
                <div className={`w-full rounded-[20px] border p-[30px] ${e.featured ? "border-blue/50 bg-blue/\[.08\]" : "border-fg/10 bg-card"}`}>
                  <h3 className="text-[22px]">{e.title}</h3>
                  <p className="mt-3 leading-relaxed text-soft">{e.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <div className="pt-20">
        <CtaBand title="Not sure which service you need?" body="Describe the problem. We will tell you what it takes and what it costs.">
          <Button href="/contact/">Talk to us</Button>
        </CtaBand>
      </div>
    </>
  );
}
