import type { NextConfig } from "next";

// The marketing pages are still statically prerendered at build time.
// `output: "export"` was removed so /learn can use server actions, auth cookies and the database.
const nextConfig: NextConfig = {
  trailingSlash: true,
  // Always render <title>/<meta> inside <head> (no streamed metadata), so every crawler and link-preview bot sees it.
  htmlLimitedBots: /.*/,
  images: { unoptimized: true },
  // Tree-shake big UI libraries so less JavaScript ships and pages respond to taps sooner.
  experimental: { optimizePackageImports: ["framer-motion", "lucide-react"] },
  // Addresses from the previous version of invicly.com that search engines still list. Each goes to the
  // closest page that exists now (308 permanent, so Google updates its index).
  async redirects() {
    const oldServices: Record<string, string> = {
      "software-development": "web",
      "ui-ux-design": "web",
      "cloud-devops-solutions": "cloud",
      "cybersecurity-services": "servers",
      "it-consulting-strategy": "consulting",
      "ai-machine-learning": "automation",
    };
    return [
      ...Object.entries(oldServices).map(([from, to]) => ({ source: `/services/${from}`, destination: `/services/#${to}`, permanent: true })),
      // any other old /services/<name> page (the current Services page has no sub-pages)
      { source: "/services/:slug", destination: "/services/", permanent: true },
      ...["invicly-cloud", "invicly-crm", "invicly-desk", "invicly-guard"].map((slug) => ({ source: `/products/${slug}`, destination: "/products/", permanent: true })),
      { source: "/careers", destination: "/contact/", permanent: true },
      { source: "/careers/:path*", destination: "/contact/", permanent: true },
      { source: "/admin", destination: "/", permanent: true },
      { source: "/admin/:path*", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
