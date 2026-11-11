"use client";
import { usePathname } from "next/navigation";
import { BlueprintField } from "@/components/ui/BlueprintField";

/**
 * The blueprint field is the site's one bold effect, so it only appears where it sets the scene:
 * the home page, the product showcase, the Learn landing page and the blog index (plus the 404 page).
 * Pages people read or work in (articles, services, about, contact, sign-in, dashboard, plans) stay calm.
 */
const SHOWCASE = new Set(["/", "/products", "/learn", "/blog"]);

export function SiteBackground({ always = false }: { always?: boolean }) {
  const path = (usePathname() ?? "/").replace(/\/+$/, "") || "/";
  if (!always && !SHOWCASE.has(path)) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 print:hidden">
      <BlueprintField quiet className="absolute inset-0" />
    </div>
  );
}
