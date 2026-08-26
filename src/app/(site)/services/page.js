import { SectionHeading } from "@/components/site/section-heading";
import { ServiceCard } from "@/components/site/service-card";
import { getServices } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Services",
  description: "Software development, cloud & DevOps, AI/ML, cybersecurity, and IT consulting services from Invicly Technologies.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our services"
          title="Everything you need to build, ship, and scale"
          description="Whichever stage you're at, we plug in as the engineering team that gets it done."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <ServiceCard key={service._id} service={service} delay={i * 0.06} />
          ))}
        </div>
        {services.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">
            Services will appear here once added from the admin dashboard.
          </p>
        )}
      </div>
    </section>
  );
}
