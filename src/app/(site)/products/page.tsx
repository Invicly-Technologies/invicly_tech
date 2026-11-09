import type { Metadata } from "next";
import { siteOg } from "@/lib/seo";
import Link from "next/link";
import { products } from "@/data/products";
import { productMocks } from "@/components/ui/AppMocks";
import { Button } from "@/components/ui/Button";
import { CtaBand } from "@/components/ui/CtaBand";
import { GooglePlayBadge } from "@/components/ui/GooglePlayBadge";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitReveal } from "@/components/ui/SplitReveal";

export const metadata: Metadata = {
  title: "Products",
  description: "Flow, Spendly, Kivo and Unreel: four free products from Invicly Tech for tasks, personal finance, self-hosted time tracking and digital wellbeing.",
  alternates: { canonical: "/products/" },
  openGraph: siteOg("/products/"),
};

export default function ProductsPage() {
  return (
    <>
      <section className="wrap pb-10 pt-32 md:pt-40">
        <Reveal>
          <Eyebrow>Products</Eyebrow>
          <h1 className="mt-4 text-[42px] font-extrabold leading-[1.05] tracking-[-2px] md:text-[64px]">
            <SplitReveal text="Software we built" onMount delay={0.1} />
            <br />
            <SplitReveal text="for ourselves." onMount delay={0.25} /> <SplitReveal text="Free for you." onMount delay={0.45} pieceClassName="text-shimmer" />
          </h1>
          <p className="mt-6 max-w-[640px] text-[19px] leading-relaxed text-muted">
            Four products, each made to do one job well. Open them in your browser or download the apps.
          </p>
        </Reveal>
      </section>

      {products.map((p, i) => {
        const Mock = productMocks[p.slug];
        const flip = i % 2 === 1;
        return (
          <section key={p.slug} id={p.slug} className="wrap py-12">
            <div className={cn("flex flex-wrap items-center gap-10 md:gap-16", flip && "flex-wrap-reverse")}>
              {flip && (
                <Reveal className="min-w-0 flex-[1_1_480px]">
                  <div className="stage">
                    <div className="stage-tilt flip">
                      <Mock />
                    </div>
                  </div>
                </Reveal>
              )}
              <Reveal className="min-w-0 flex-[1_1_420px]" delay={0.1}>
                <div className="font-mono text-xs tracking-[2px]" style={{ color: p.accent }}>
                  {p.category.toUpperCase()}
                </div>
                <h2 className="mt-2.5 text-[40px] font-bold tracking-[-1.5px] md:text-[46px]"><SplitReveal text={p.name} /></h2>
                <p className="mt-2 text-xl font-semibold text-fg">{p.tagline}</p>
                <p className="mt-4 text-[16.5px] leading-relaxed text-muted">{p.listText}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.pills.map((x) => (
                    <span key={x} className="pill">
                      {x}
                    </span>
                  ))}
                </div>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button href={p.url}>{p.slug === "kivo" ? "Open Kivo Control" : p.linkLabel} ↗</Button>
                  <Link href={`/products/${p.slug}/`} className="inline-flex min-h-12 items-center px-2 font-bold text-blue-light hover:text-fg">
                    Details →
                  </Link>
                  {p.googlePlaySoon && <GooglePlayBadge playStoreUrl={p.playStoreUrl} />}
                </div>
              </Reveal>
              {!flip && (
                <Reveal className="min-w-0 flex-[1_1_480px]">
                  <div className="stage">
                    <div className="stage-tilt">
                      <Mock />
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </section>
        );
      })}

      <div className="pt-14">
        <CtaBand title="Need something like this for your business?" body="We build custom products and apps for clients too.">
          <Button href="/services/">See our services</Button>
        </CtaBand>
      </div>
    </>
  );
}
