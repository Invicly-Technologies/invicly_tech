import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Reveal } from "@/components/site/reveal";
import { getProductBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: product.title, description: product.description };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <section className="py-16 sm:py-24">
      <div className="container-page max-w-3xl">
        <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft size={15} /> All products
        </Link>

        <Reveal className="mt-6">
          <Badge className="mb-4">{product.category}</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{product.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>
        </Reveal>

        {product.imageUrl && (
          <Reveal delay={0.05} className="mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
          </Reveal>
        )}

        {product.fullDescription && (
          <Reveal delay={0.1} className="mt-10 whitespace-pre-line leading-relaxed text-foreground/90">
            {product.fullDescription}
          </Reveal>
        )}

        {product.features?.length > 0 && (
          <Reveal delay={0.15} className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">Key features</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <Reveal delay={0.2} className="mt-14 flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-foreground/80">{product.priceLabel}</span>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
          >
            Request a demo <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
