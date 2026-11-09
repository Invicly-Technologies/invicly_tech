import { products } from "@/data/products";
import { Card3D } from "@/components/ui/Card3D";
import { GooglePlayBadge } from "@/components/ui/GooglePlayBadge";
import { ProductIcon } from "@/components/ui/ProductIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";

export function ProductsGrid() {
  return (
    <section className="wrap pb-16 pt-24">
      <SectionHeading
        eyebrow="Products"
        title={["Four products.", "All free to use."]}
        link={{ href: "/products/", label: "View all products" }}
      />
      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <StaggerItem key={p.slug} className="flex">
            <Card3D href={p.url} className="flex w-full flex-col gap-3.5 rounded-3xl p-7">
              <div className="icon-wiggle self-start">
                <ProductIcon slug={p.slug} accent={p.accent} />
              </div>
              <h3 className="mt-2.5 text-[26px] font-bold">{p.name}</h3>
              <p className="flex-1 text-[15px] leading-relaxed text-muted">{p.cardText}</p>
              <div className="font-mono text-xs text-quiet">{p.platformLabel}</div>
              {p.googlePlaySoon ? (
                <GooglePlayBadge playStoreUrl={p.playStoreUrl} className="self-start !px-2.5 !py-1.5 !text-xs" />
              ) : (
                <span className="pill self-start !px-2.5 !py-1.5 !text-xs">{p.status}</span>
              )}
              <div className="text-[15px] font-bold text-blue-light">
                {p.linkLabel} <span className="arr">↗</span>
              </div>
            </Card3D>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
