import { ogImage } from "@/lib/og";
import { getPath, paths } from "@/data/learn/paths";
import { explainerKeys, getExplainer, topicKeyFromSlug, topicSlug } from "@/data/learn/explainers";

export const dynamic = "force-static";

export function generateStaticParams() {
  return paths.flatMap((p) => explainerKeys(p.slug).map((k) => ({ slug: p.slug, topic: topicSlug(k) })));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string; topic: string }> }) {
  const { slug, topic } = await params;
  const path = getPath(slug)!;
  const key = topicKeyFromSlug(topic);
  const [mk, tk] = key.split("/");
  const t = path.modules.find((m) => m.key === mk)?.topics.find((x) => x.key === tk);
  const ex = getExplainer(slug, key);
  return ogImage({
    eyebrow: `Visual explainer · ${path.title}`,
    title: t?.title ?? "Visual explainer",
    subtitle: ex?.summary,
    chips: (ex?.visuals ?? []).map((v) => v.type.replace(/^./, (c) => c.toUpperCase())),
  });
}
