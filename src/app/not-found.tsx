import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <>
    <Header />
    <main id="main">
    <section className="wrap flex min-h-[80vh] flex-col items-center justify-center pb-20 pt-32 text-center">
      <div style={{ animation: "turn-y 8s linear infinite" }}>
        <LogoMark size={96} />
      </div>
      <Eyebrow className="mt-8">Error 404</Eyebrow>
      <h1 className="mt-4 text-[44px] font-extrabold leading-[1.05] tracking-[-2px] md:text-[72px]">
        <SplitReveal text="This page" onMount delay={0.1} /> <SplitReveal text="wandered off." onMount delay={0.3} pieceClassName="text-shimmer" />
      </h1>
      <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">The link may be old or mistyped. Try one of these instead.</p>
      <div className="mt-9 flex flex-wrap justify-center gap-3.5">
        <Button href="/">Back to home</Button>
        <Button href="/products/" variant="ghost">
          See products
        </Button>
      </div>
    </section>
    </main>
    <Footer />
    </>
  );
}
