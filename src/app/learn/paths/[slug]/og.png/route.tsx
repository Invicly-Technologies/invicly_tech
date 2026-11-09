import { ogImage } from "@/lib/og";
import { getPath, paths, pathHours, pathTopicCount } from "@/data/learn/paths";

export const dynamic = "force-static";

export function generateStaticParams() {
  return paths.map((p) => ({ slug: p.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const p = getPath((await params).slug)!;
  return ogImage({
    eyebrow: `Free roadmap · ${p.category}`,
    title: p.title,
    subtitle: p.tagline,
    chips: [`${Math.round(pathHours(p))}h`, `${pathTopicCount(p)} topics`, p.level],
  });
}
