import Link from "next/link";

type Props = { eyebrow?: string; title: string | string[]; link?: { href: string; label: string }; size?: "lg" | "md"; as?: "h1" | "h2" };

/** Section title with an optional link. `eyebrow` is accepted for older call sites but not shown: the title says it. */
export function SectionHeading({ title, link, size = "lg", as: Tag = "h2" }: Props) {
  const lines = Array.isArray(title) ? title : [title];
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <Tag className={`font-bold leading-[1.1] tracking-[-1.5px] ${size === "lg" ? "text-[36px] md:text-[48px]" : "text-[32px] md:text-[42px]"}`}>
        {lines.map((l, i) => (
          <span key={i} className="block">{l}</span>
        ))}
      </Tag>
      {link && (
        <Link href={link.href} className="nl inline-flex min-h-11 items-center font-bold !text-blue-light underline-offset-4 hover:underline">
          {link.label}
        </Link>
      )}
    </div>
  );
}
