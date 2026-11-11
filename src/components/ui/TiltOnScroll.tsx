import type { ReactNode } from "react";

/**
 * Product screenshots sit flat. (This used to rotate them into place on scroll; that read as template motion.)
 * Kept as a wrapper so existing pages need no change; `from` is accepted and ignored.
 */
export function TiltOnScroll({ children, className }: { children: ReactNode; className?: string; from?: { x: number; y: number; z: number } }) {
  return (
    <div className={className}>
      <div className="relative">{children}</div>
    </div>
  );
}
