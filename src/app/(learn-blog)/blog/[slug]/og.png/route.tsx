import { ogImage } from "@/lib/og";
import { getPost, posts } from "@/data/learn/blog";
import { getExplainer } from "@/data/learn/explainers";

export const dynamic = "force-static";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug)!;
  const ex = getExplainer(post.pathSlug, post.topicKey);
  return ogImage({
    eyebrow: `Invicly Blog · ${post.pathTitle}`,
    title: post.title,
    subtitle: post.summary,
    chips: [`${post.minutes} min read`, ...(ex?.visuals ?? []).map((v) => v.type.replace(/^./, (c) => c.toUpperCase()))],
  });
}
