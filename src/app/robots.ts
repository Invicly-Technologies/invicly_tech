import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Personal and account pages: nothing useful for search, and they require login.
        disallow: ["/learn/dashboard/", "/learn/plans/", "/learn-export/", "/learn/login/", "/learn/signup/", "/learn/verify/", "/learn/forgot/", "/learn/reset/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
