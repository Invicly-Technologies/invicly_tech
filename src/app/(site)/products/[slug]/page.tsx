import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/data/products";
import { FlowWindow, productMocks } from "@/components/ui/AppMocks";
import { Button } from "@/components/ui/Button";
import { Card3D } from "@/components/ui/Card3D";
import { CtaBand } from "@/components/ui/CtaBand";
import { GooglePlayBadge } from "@/components/ui/GooglePlayBadge";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { TiltOnScroll } from "@/components/ui/TiltOnScroll";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { JsonLd, abs, breadcrumbLd, organizationRef, siteOg } from "@/lib/seo";

type Params = { slug: string };

export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return {
    title: `${p.name}: ${p.tagline}`,
    description: p.listText,
    alternates: { canonical: `/products/${p.slug}/` },
    openGraph: siteOg(`/products/${p.slug}/`, { title: `${p.name} | Invicly Tech`, description: p.tagline }),
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const Mock = productMocks[p.slug];

  return (
    <>
      <JsonLd
        data={[
          {
            "@type": "SoftwareApplication",
            name: p.name,
            description: p.listText,
            url: abs(`/products/${p.slug}/`),
            applicationCategory: p.slug === "spendly" ? "FinanceApplication" : p.slug === "unreel" ? "LifestyleApplication" : "BusinessApplication",
            operatingSystem: p.platforms.join(", "),
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            publisher: organizationRef,
            ...(p.playStoreUrl ? { installUrl: p.playStoreUrl } : {}),
          },
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products/" },
            { name: p.name, path: `/products/${p.slug}/` },
          ]),
        ]}
      />
      <section className="wrap pb-16 pt-28 md:pt-36">
        <nav aria-label="Breadcrumb" className="text-sm text-quiet">
          <Link className="nl" href="/products/">
            Products
          </Link>{" "}
          / <span className="text-fg">{p.name}</span>
        </nav>
        <div className="mt-9 flex flex-wrap items-center gap-14">
          <Reveal className="min-w-0 flex-[1_1_440px]">
            <h1 className="text-[44px] font-extrabold leading-[1.02] tracking-[-2px] md:text-[60px] xl:text-[68px] md:tracking-[-2.5px]">
              <SplitReveal text={p.heroLines[0]} onMount delay={0.1} />
              <br />
              <SplitReveal text={p.heroLines[1]} onMount delay={0.3} pieceClassName="text-shimmer" />
            </h1>
            <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-muted">{p.heroText}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href={p.primaryCta.href}>{p.primaryCta.label} ↗</Button>
              {p.secondaryCta && (
                <Button href={p.secondaryCta.href} variant="ghost">
                  {p.secondaryCta.label}
                </Button>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {p.pills.map((x) => (
                <span key={x} className="pill">
                  {x}
                </span>
              ))}
              {p.googlePlaySoon && <GooglePlayBadge playStoreUrl={p.playStoreUrl} label="Google Play coming soon" />}
            </div>
          </Reveal>
          <TiltOnScroll className="min-w-0 flex-[1_1_520px]" from={{ x: 14, y: -12, z: 1.5 }}>
            {p.slug === "flow" ? (
              <FlowWindow url="flow.invicly.com/app" />
            ) : (
              <div className="stage !border-fg/10">
                <Mock />
              </div>
            )}
            {p.slug === "flow" && (
              <div className="absolute -bottom-8 left-2 md:-left-6" style={{ transform: "translateZ(90px)" }}>
                <div className="floaty rounded-[14px] border border-[rgba(90,176,255,.5)] bg-card px-[18px] py-3.5 text-[13px] shadow-[0_20px_40px_-12px_rgba(10,132,255,.5)]">
                  <div className="font-mono text-[11px] text-blue-light">QUICK ADD</div>
                  <div className="mt-1 font-bold">Press Q anywhere</div>
                </div>
              </div>
            )}
          </TiltOnScroll>
        </div>
      </section>

      <section className="border-t border-line bg-deep py-20">
        <div className="wrap flex flex-wrap items-start gap-14">
          <Reveal className="min-w-0 flex-[1_1_400px]">
            <h2 className="mt-3 text-[34px] font-bold leading-[1.1] tracking-[-1.5px] md:text-[42px]"><SplitReveal text={p.highlight.title} /></h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">{p.highlight.body}</p>
          </Reveal>
          <Reveal className="min-w-0 flex-[1_1_560px]" delay={0.1}>
            <ul className="surface rounded-[20px] px-5 py-3 md:px-7">
              {p.highlight.rows.map((r, i) => (
                <li key={r.token} className={`flex flex-wrap items-center gap-x-[18px] gap-y-2 py-4 ${i ? "border-t border-fg/[.07]" : ""}`}>
                  <span className="tok sm:min-w-[150px]">{r.token}</span>
                  <span className="text-[15px] text-muted">{r.text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="wrap py-24">
        <h2 className="mt-3 text-[34px] font-bold tracking-[-1.5px] md:text-[42px]"><SplitReveal text={`What ${p.name} does.`} /></h2>
        <Stagger className="mt-11 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {p.features.map((f) => (
            <StaggerItem key={f.title} className="flex">
              <Card3D className="w-full rounded-[20px] p-7">
                <h3 className="text-xl">{f.title}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-soft">{f.body}</p>
              </Card3D>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-t border-line bg-deep py-20">
        <div className="wrap">
          <h2 className="mt-3 text-[34px] font-bold tracking-[-1.5px] md:text-[42px]"><SplitReveal text={p.platformsSection.title} /></h2>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {p.platformsSection.items.map((it) => (
              <StaggerItem key={it.name} className="flex">
                <Card3D href={it.href} className="w-full rounded-[18px] p-6">
                  <h3 className="text-xl">{it.name}</h3>
                  <p className="mt-2 text-[14.5px] leading-normal text-soft">{it.body}</p>
                  <div className="mt-3.5 text-sm font-bold text-blue-light">
                    {it.cta} <span className="arr">↗</span>
                  </div>
                  {it.soon && p.googlePlaySoon && <GooglePlayBadge className="mt-3 !text-xs" label="Google Play coming soon" playStoreUrl={undefined} />}
                </Card3D>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <div className="pt-20">
        <CtaBand title={p.cta.title} body={p.cta.body}>
          <Button href={p.cta.href}>{p.cta.label} ↗</Button>
        </CtaBand>
      </div>
    </>
  );
}
