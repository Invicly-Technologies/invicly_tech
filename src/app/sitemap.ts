import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { site } from "@/data/site";
import { paths } from "@/data/learn/paths";
import { posts, postHref, seriesHref, BLOG_MODIFIED } from "@/data/learn/blog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // A stable date (not the build time): Google ignores lastmod values that change on every deploy.
  const lastModified = new Date(`${BLOG_MODIFIED}T00:00:00Z`);
  const entry = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly", images?: string[]) => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
    ...(images ? { images } : {}),
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
    ...posts.map((p) => entry(postHref(p.slug), 0.8, "monthly", [`${site.url}${postHref(p.slug)}og.png`])),
  ];
}
