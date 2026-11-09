import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { site } from "@/data/site";
import { paths } from "@/data/learn/paths";
import { posts, postHref, seriesHref } from "@/data/learn/blog";

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
    entry("/blog/", 0.9, "weekly"),
    ...paths.map((p) => entry(seriesHref(p.slug), 0.7, "weekly")),
    ...posts.map((p) => entry(postHref(p.slug), 0.7)),
  ];
}
