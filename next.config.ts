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
};

export default nextConfig;
