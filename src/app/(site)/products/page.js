import { SectionHeading } from "@/components/site/section-heading";
import { ProductCard } from "@/components/site/product-card";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products",
  description: "Explore the products built by Invicly Technologies — ready-to-deploy platforms for growing businesses.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our products"
          title="Platforms built to run your business"
          description="Ready-made software, built and maintained by our team, so you can focus on growth instead of infrastructure."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <ProductCard key={product._id} product={product} delay={i * 0.06} />
          ))}
        </div>
        {products.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">
            Products will appear here once added from the admin dashboard.
          </p>
        )}
      </div>
    </section>
  );
}
