import type { Metadata } from "next";
import Link from "next/link";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { TimerProvider } from "@/components/learn/timer";
import { LearnTours } from "@/components/learn/Tour";
import { LearnSessionProvider } from "@/components/learn/session";

export const metadata: Metadata = {
  title: { default: "Invicly Learn | Plan it. Track it. Finish it.", template: "%s | Invicly Learn" },
  description:
    "Free learning paths for DevOps, cyber security, Linux, DSA, Java, React, AWS, Kubernetes, AI and interview prep, with visual explainers. Turn a path into a dated study plan and track your progress.",
};

// No cookies or database here: signed-in state loads in the browser (LearnSessionProvider),
// so public Learn pages stay static and are served from the CDN.
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="learn-root flex min-h-dvh flex-col">
      <LearnSessionProvider>
        <TimerProvider>
          <LearnHeader />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <LearnTours />
        </TimerProvider>
      </LearnSessionProvider>
      <footer className="border-t border-fg/10 py-8 text-sm text-quiet">
        <div className="wrap flex flex-wrap items-center justify-between gap-4">
          <p>
            Invicly Learn is free and open to everyone. Built by{" "}
            <Link href="/" className="font-semibold text-muted hover:text-fg">
              Invicly Tech
            </Link>
            .
          </p>
          <div className="flex gap-5">
            <Link href="/learn/" className="hover:text-fg">Paths</Link>
            <Link href="/contact/" className="hover:text-fg">Suggest a path</Link>
            <Link href="/" className="hover:text-fg">invicly.com</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
