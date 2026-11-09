import { ogImage } from "@/lib/og";
import { paths } from "@/data/learn/paths";

export const dynamic = "force-static";

export function GET() {
  return ogImage({
    eyebrow: "Free · open to everyone",
    title: "Study plans you will actually finish",
    subtitle: `${paths.length} learning paths with visual explainers, short subtopics, timers and a day-by-day study plan.`,
    chips: ["DevOps", "Java", "React", "AI"],
  });
}
