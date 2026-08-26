import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

export function Hero({ hero }) {
  const {
    eyebrow,
    headline = "We build technology that moves your business forward",
    subheadline = "",
    ctaText = "Start a project",
    ctaLink = "/contact",
    secondaryCtaText = "Explore services",
    secondaryCtaLink = "/services",
    backgroundImageUrl,
  } = hero || {};

  return (
    <section className="gradient-bg relative overflow-hidden border-b border-border">
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 opacity-[0.05] blur-[1px] saturate-[0.4] dark:opacity-[0.09]"
          style={{
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      <div className="container-page relative flex flex-col items-center py-24 text-center sm:py-32">
        <Reveal>
          {eyebrow && (
            <span className="mb-5 inline-block rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              {eyebrow}
            </span>
          )}
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {headline}
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{subheadline}</p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={ctaLink}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
            >
              {ctaText}
              <ArrowRight size={16} />
            </Link>
            <Link
              href={secondaryCtaLink}
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-7 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {secondaryCtaText}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
