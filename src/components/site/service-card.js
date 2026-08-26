import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DynamicIcon } from "@/components/site/dynamic-icon";
import { Reveal } from "@/components/site/reveal";

export function ServiceCard({ service, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/services/${service.slug}`}
        className="card-surface group flex h-full flex-col p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
      >
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <DynamicIcon name={service.icon} size={24} />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {service.shortDescription}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          Learn more
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </Reveal>
  );
}
