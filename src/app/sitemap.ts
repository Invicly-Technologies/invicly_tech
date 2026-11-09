import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { site } from "@/data/site";
import { paths } from "@/data/learn/paths";
import { explainerKeys, topicSlug } from "@/data/learn/explainers";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    entry("/", 1, "weekly"),
    entry("/learn/", 0.9, "weekly"),
    entry("/products/", 0.8),
    entry("/services/", 0.8),
    entry("/about/", 0.6),
    entry("/contact/", 0.6),
    ...products.map((p) => entry(`/products/${p.slug}/`, 0.7)),
    ...paths.map((p) => entry(`/learn/paths/${p.slug}/`, 0.8, "weekly")),
    ...paths.flatMap((p) => explainerKeys(p.slug).map((k) => entry(`/learn/paths/${p.slug}/learn/${topicSlug(k)}/`, 0.6))),
  ];
}
