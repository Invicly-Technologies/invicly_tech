import { BlueprintField } from "@/components/ui/BlueprintField";

/**
 * The site-wide background: one fixed blueprint field behind every page (marketing site, Learn, blog).
 * It sits just above the page colour on <html>; sections with their own panels simply cover it.
 */
export function SiteBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 print:hidden">
      <BlueprintField quiet className="absolute inset-0" />
    </div>
  );
}
