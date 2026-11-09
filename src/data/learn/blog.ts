import { paths, type LearningPath } from "./paths";
import { explainerKeys, getExplainer } from "./explainers";
import { getExtra } from "./extra";

/** First publication date of the blog (all topic posts went live together). */
export const BLOG_PUBLISHED = "2026-11-10";

export type BlogPost = {
  slug: string;
  pathSlug: string;
  pathTitle: string;
  category: string;
  moduleKey: string;
  moduleTitle: string;
  topicKey: string;
  title: string;
  summary: string;
  minutes: number;
  keywords: string[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/c\+\+/g, "cpp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70)
    .replace(/-$/, "");

function wordsOf(o: unknown): number {
  if (typeof o === "string") return o.split(/\s+/).filter(Boolean).length;
  if (Array.isArray(o)) return o.reduce((s, x) => s + wordsOf(x), 0);
  if (o && typeof o === "object") return Object.values(o).reduce((s: number, x) => s + wordsOf(x), 0);
  return 0;
}

function build(): BlogPost[] {
  const out: BlogPost[] = [];
  const used = new Set<string>();
  // Pass 1: base slugs; on collision use "<title>-<path>" so every URL is unique and stable.
  for (const p of paths) {
    const keys = new Set(explainerKeys(p.slug));
    for (const m of p.modules) {
      for (const t of m.topics) {
        const key = `${m.key}/${t.key}`;
        if (!keys.has(key)) continue;
        const ex = getExplainer(p.slug, key)!;
        let slug = slugify(t.title);
        if (used.has(slug)) slug = `${slug}-${slugify(p.title).split("-").slice(0, 3).join("-")}`;
        let n = 2;
        while (used.has(slug)) slug = `${slugify(t.title)}-${n++}`;
        used.add(slug);
        const words = wordsOf(ex) + wordsOf(getExtra(p.slug, key)) + wordsOf(t.subtopics);
        out.push({
          slug,
          pathSlug: p.slug,
          pathTitle: p.title,
          category: p.category,
          moduleKey: m.key,
          moduleTitle: m.title,
          topicKey: key,
          title: t.title,
          summary: ex.summary,
          minutes: Math.max(3, Math.round(words / 200)),
          keywords: [t.title, ...ex.terms.map((x) => x.term).slice(0, 5), p.title],
        });
      }
    }
  }
  return out;
}

export const posts: BlogPost[] = build();
const bySlug = new Map(posts.map((p) => [p.slug, p]));
const byTopic = new Map(posts.map((p) => [`${p.pathSlug}|${p.topicKey}`, p]));

export const getPost = (slug: string) => bySlug.get(slug);
export const postFor = (pathSlug: string, topicKey: string) => byTopic.get(`${pathSlug}|${topicKey}`);
export const postHref = (slug: string) => `/blog/${slug}/`;
/** Public URL of a topic's visual explainer (now a blog post), if it has one. */
export const visualHref = (pathSlug: string, topicKey: string) => {
  const p = postFor(pathSlug, topicKey);
  return p ? postHref(p.slug) : undefined;
};
export const postsForPath = (pathSlug: string) => posts.filter((p) => p.pathSlug === pathSlug);
export const seriesHref = (pathSlug: string) => `/blog/series/${pathSlug}/`;
export type { LearningPath };
