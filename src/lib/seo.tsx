import { site } from "@/data/site";

/** Absolute URL for a site path (paths keep the trailing slash used across the site). */
export const abs = (path: string) => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;

export const ORG_ID = `${site.url}/#organization`;

export const organizationRef = { "@type": "Organization", "@id": ORG_ID, name: site.name, url: site.url };

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

/** Renders one or more schema.org objects as a JSON-LD script. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const graph = Array.isArray(data) ? { "@context": "https://schema.org", "@graph": data } : { "@context": "https://schema.org", ...data };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />;
}

/** Open Graph block for marketing pages. A page-level openGraph replaces the parent's, so always include image + site name. */
export function siteOg(path: string, extra: { title?: string; description?: string } = {}) {
  return {
    type: "website" as const,
    siteName: site.name,
    url: path,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Invicly Tech: Think. Build. Invicly." }],
    ...extra,
  };
}
