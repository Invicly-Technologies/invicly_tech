import { cn } from "@/lib/utils";
import { Reveal } from "@/components/site/reveal";

export function SectionHeading({ eyebrow, title, description, align = "center", className }) {
  return (
    <Reveal className={cn("mx-auto max-w-2xl", align === "center" && "text-center", className)}>
      {eyebrow && (
        <span className="mb-3 inline-block rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base text-muted-foreground">{description}</p>}
    </Reveal>
  );
}
