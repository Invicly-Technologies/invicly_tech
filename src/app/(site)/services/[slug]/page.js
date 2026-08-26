import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { DynamicIcon } from "@/components/site/dynamic-icon";
import { Reveal } from "@/components/site/reveal";
import { getServiceBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return { title: service.title, description: service.shortDescription };
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <section className="py-16 sm:py-24">
      <div className="container-page max-w-3xl">
        <Link href="/services" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft size={15} /> All services
        </Link>

        <Reveal className="mt-6">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <DynamicIcon name={service.icon} size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{service.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{service.shortDescription}</p>
        </Reveal>

        {service.imageUrl && (
          <Reveal delay={0.05} className="mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={service.imageUrl} alt={service.title} className="h-full w-full object-cover" />
          </Reveal>
        )}

        <Reveal delay={0.1} className="mt-10 whitespace-pre-line leading-relaxed text-foreground/90">
          {service.fullDescription}
        </Reveal>

        {service.features?.length > 0 && (
          <Reveal delay={0.15} className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">What&apos;s included</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {service.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <Reveal delay={0.2} className="mt-14">
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
          >
            Discuss your project <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
