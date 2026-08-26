import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Hero } from "@/components/site/hero";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceCard } from "@/components/site/service-card";
import { ProductCard } from "@/components/site/product-card";
import { StatsCounter } from "@/components/site/stats-counter";
import { TestimonialCarousel } from "@/components/site/testimonial-carousel";
import { Reveal } from "@/components/site/reveal";
import {
  getHero,
  getAbout,
  getServices,
  getProducts,
  getTestimonials,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [hero, about, services, products, testimonials] = await Promise.all([
    getHero(),
    getAbout(),
    getServices(),
    getProducts(),
    getTestimonials(),
  ]);

  const featuredServices = services.filter((s) => s.featured).slice(0, 3);
  const services3 = (featuredServices.length ? featuredServices : services).slice(0, 3);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 3);
  const products3 = (featuredProducts.length ? featuredProducts : products).slice(0, 3);

  return (
    <>
      <Hero hero={hero} />

      {about?.stats?.length > 0 && (
        <section className="border-b border-border py-14">
          <div className="container-page">
            <StatsCounter stats={about.stats} />
          </div>
        </section>
      )}

      <section className="py-20 sm:py-28">
        <div className="container-page">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <span className="mb-3 inline-block rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                Who we are
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                A technology partner that ships
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                {about?.story}
              </p>
              <ul className="mt-6 space-y-3">
                {(about?.values || []).slice(0, 4).map((v) => (
                  <li key={v.title} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
                    <span className="text-foreground/90">
                      <strong className="font-semibold">{v.title}.</strong>{" "}
                      <span className="text-muted-foreground">{v.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/about"
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
              >
                More about us <ArrowRight size={15} />
              </Link>
            </Reveal>
            <Reveal delay={0.1} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
              {about?.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={about.imageUrl} alt="Invicly Technologies team" className="h-full w-full object-cover" />
              )}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we do"
            title="Services built for growth"
            description="From product engineering to cloud and AI, we cover the full technology stack so you don't have to juggle vendors."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services3.map((service, i) => (
              <ServiceCard key={service._id} service={service} delay={i * 0.08} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/services"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground hover:bg-muted"
            >
              View all services <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we build"
            title="Products designed to scale"
            description="Ready-to-deploy platforms our clients use to run and grow their business."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products3.map((product, i) => (
              <ProductCard key={product._id} product={product} delay={i * 0.08} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground hover:bg-muted"
            >
              View all products <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {testimonials?.length > 0 && (
        <section className="border-t border-border bg-muted/30 py-20 sm:py-28">
          <div className="container-page">
            <SectionHeading eyebrow="Testimonials" title="Trusted by teams who ship" />
            <div className="mt-14">
              <TestimonialCarousel testimonials={testimonials} />
            </div>
          </div>
        </section>
      )}

      <section className="py-20 sm:py-28">
        <div className="container-page">
          <Reveal className="gradient-bg card-surface flex flex-col items-center gap-6 p-10 text-center sm:p-16">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to build something great?
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Tell us about your project and we&apos;ll get back to you within one business day.
            </p>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
            >
              Get in touch <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
