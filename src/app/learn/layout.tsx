import type { Metadata } from "next";
import { LearnShell } from "@/components/learn/LearnShell";

export const metadata: Metadata = {
  title: { default: "Invicly Learn: free study plans and learning paths", template: "%s | Invicly Learn" },
  description:
    "Free learning paths for DevOps, cyber security, Linux, DSA, Java, React, AWS, Kubernetes, AI and interview prep, with visual explainers. Turn a path into a dated study plan and track your progress.",
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <LearnShell>{children}</LearnShell>;
}
