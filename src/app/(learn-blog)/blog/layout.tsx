import type { Metadata } from "next";
import { LearnShell } from "@/components/learn/LearnShell";

export const metadata: Metadata = {
  title: { default: "Invicly Blog: visual guides to DevOps, security, Linux, DSA and more", template: "%s | Invicly Blog" },
};

/** The blog is part of Invicly Learn: same header (with blog search), footer and theme. */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <LearnShell>{children}</LearnShell>;
}
