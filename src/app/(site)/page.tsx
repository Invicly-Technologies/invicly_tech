import type { Metadata } from "next";
import { siteOg } from "@/lib/seo";
import { Hero } from "@/components/sections/Hero";
import { ProductsGrid } from "@/components/sections/ProductsGrid";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { Process } from "@/components/sections/Process";
import { Showcase } from "@/components/sections/Showcase";
import { CtaBand } from "@/components/ui/CtaBand";
import { Button } from "@/components/ui/Button";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: "Invicly Tech | Think. Build. Invicly." },
  description: "Invicly Tech builds Flow, Spendly, Kivo and Unreel, and builds websites, Android, Windows and Linux apps and cloud setups for businesses.",
  alternates: { canonical: "/" },
  openGraph: siteOg("/"),
};

export default function Home() {
  return (
    <>
      <Hero />
      <ProductsGrid />
      <ServicesGrid />
      <Process />
      <Showcase />
      <CtaBand title="Have a project in mind?" body="Tell us what you want to build. We reply within one business day.">
        <Button href="/contact/">Start a project</Button>
        <Button href={`mailto:${site.email}`} variant="ghost">
          {site.email}
        </Button>
      </CtaBand>
    </>
  );
}
