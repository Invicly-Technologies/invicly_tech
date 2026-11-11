import { services } from "@/data/services";
import { Card3D } from "@/components/ui/Card3D";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";

export function ServicesGrid() {
  return (
    <section className="wrap pb-24 pt-20">
      <SectionHeading
        eyebrow="Services"
        title={["Built for your business,", "not just ours."]}
        link={{ href: "/services/", label: "All services" }}
      />
      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <StaggerItem key={s.slug} className="flex">
            <Card3D href={`/services/#${s.slug}`} className="w-full rounded-[20px] p-[26px]">
              <h3 className="text-xl font-semibold">{s.homeTitle}</h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-soft">{s.short}</p>
            </Card3D>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
