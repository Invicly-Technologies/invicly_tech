import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Invicly Blog: visual guides to DevOps, security, Linux, DSA and more", template: "%s | Invicly Blog" },
};

/** The blog lives on the main Invicly Tech site; this only clears the fixed site header. */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <div className="pt-20 md:pt-24">{children}</div>;
}
