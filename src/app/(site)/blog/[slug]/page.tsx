import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, posts, postHref } from "@/data/learn/blog";
import { ExplainerArticle } from "@/components/learn/ExplainerArticle";

export const dynamicParams = false;
const BUILT = new Date().toISOString().slice(0, 10);

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const url = postHref(post.slug);
  const title = `${post.title}: explained visually`;
  return {
    title,
    description: post.summary.slice(0, 300),
    keywords: post.keywords,
    alternates: { canonical: url, types: { "application/rss+xml": "/blog/rss.xml" } },
    openGraph: {
      url,
      type: "article",
      siteName: "Invicly Learn",
      title: `${title} | Invicly`,
      description: post.summary,
      section: post.pathTitle,
      publishedTime: "2026-11-10",
      modifiedTime: BUILT,
      authors: ["Invicly Tech"],
      tags: post.keywords,
      images: [{ url: `${url}og.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title: `${title} | Invicly`, description: post.summary, images: [`${url}og.png`] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return <ExplainerArticle post={post} modified={BUILT} />;
}
