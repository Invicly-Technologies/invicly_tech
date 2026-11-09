import Link from "next/link";
import { Eyebrow } from "./Eyebrow";
import { SplitReveal } from "./SplitReveal";

type Props = { eyebrow: string; title: string | string[]; link?: { href: string; label: string }; size?: "lg" | "md"; as?: "h1" | "h2" };

export function SectionHeading({ eyebrow, title, link, size = "lg", as: Tag = "h2" }: Props) {
  const lines = Array.isArray(title) ? title : [title];
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Tag className={`mt-3 font-bold leading-[1.1] tracking-[-1.5px] ${size === "lg" ? "text-[36px] md:text-[48px]" : "text-[32px] md:text-[42px]"}`}>
          {lines.map((l, i) => (
            <span key={i} className="block">
              <SplitReveal text={l} delay={i * 0.15} />
            </span>
          ))}
        </Tag>
      </div>
      {link && (
        <Link href={link.href} className="group nl inline-flex min-h-11 items-center gap-1.5 font-bold !text-blue-light hover:!text-white">
          {link.label} <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </Link>
      )}
    </div>
  );
}
