import type { ReactNode } from "react";

/**
 * Sections render in place. The site keeps one entrance moment (the home hero); fading and sliding every
 * section in on scroll read as template motion and hid content from first-frame screenshots.
 * The components stay so pages can keep their structure.
 */
type Props = { children: ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" };

export function Reveal({ children, className }: Props) {
  return <div className={className}>{children}</div>;
}

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
