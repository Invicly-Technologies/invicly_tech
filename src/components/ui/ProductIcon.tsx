import type { ProductSlug } from "@/data/products";

const paths: Record<ProductSlug, React.ReactNode> = {
  flow: (
    <>
      <path d="M4 6h16M4 12h10M4 18h7" />
      <path d="m16 16 2 2 4-4" />
    </>
  ),
  spendly: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 10h18M16 15h2" />
    </>
  ),
  kivo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  unreel: (
    <>
      <path d="M12 21v-8" />
      <path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6Z" />
      <path d="M12 15c0-3-2-5-6-5 0 3 2 5 6 5Z" />
    </>
  ),
};

export function ProductIcon({ slug, accent, size = 56 }: { slug: ProductSlug; accent: string; size?: number }) {
  return (
    <div
      className="flex flex-none items-center justify-center rounded-2xl"
      style={{ width: size, height: size, background: `color-mix(in srgb, ${accent} 15%, transparent)` }}
    >
      <svg width={size / 2} height={size / 2} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {paths[slug]}
      </svg>
    </div>
  );
}
