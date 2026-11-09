import { postFor, postHref } from "@/data/learn/blog";
import { topicKeyFromSlug } from "@/data/learn/explainers";

/** Topic explainers moved to the blog: old URLs permanently redirect to /blog/<slug>/. */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string; topic: string }> }) {
  const { slug, topic } = await params;
  const post = postFor(slug, topicKeyFromSlug(topic));
  const to = new URL(post ? postHref(post.slug) : `/learn/paths/${slug}/`, req.url);
  return Response.redirect(to, 308);
}
