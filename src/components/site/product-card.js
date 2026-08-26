import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Reveal } from "@/components/site/reveal";

export function ProductCard({ product, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/products/${product.slug}`}
        className="card-surface group flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <Badge className="mb-3 w-fit">{product.category}</Badge>
          <h3 className="text-lg font-semibold text-foreground">{product.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground/80">{product.priceLabel}</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Details
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
