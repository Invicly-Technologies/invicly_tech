import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Poppins } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import { themeBootScript } from "@/lib/learn/theme";
import { ScrollbarAutoHide } from "@/components/layout/ScrollbarAutoHide";

const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-poppins", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Invicly Tech | Think. Build. Invicly.", template: "%s | Invicly Tech" },
  description: site.description,
  applicationName: site.name,
  // No site-wide canonical here: each page declares its own, otherwise every page would point at the home page.
  keywords: [
    "Invicly",
    "Invicly Tech",
    "Invicly Learn",
    "software company",
    "web development",
    "Android apps",
    "cloud management",
    "learning paths",
    "DevOps roadmap",
    "study planner",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "technology",
  formatDetection: { email: false, address: false, telephone: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined,
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    url: site.url,
    title: "Invicly Tech | Think. Build. Invicly.",
    description: site.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Invicly Tech: Think. Build. Invicly." }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
  ],
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.name,
  alternateName: ["Invicly", "Invicly Tech Global Softwares"],
  url: site.url,
  logo: `${site.url}/brand/invicly-mark.png`,
  email: site.email,
  slogan: site.tagline,
  contactPoint: [{ "@type": "ContactPoint", email: site.email, contactType: "customer support" }],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      alternateName: "Invicly",
      publisher: { "@id": `${site.url}/#organization` },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the boot script sets data-theme on <html> before React hydrates.
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${poppins.variable} ${manrope.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-blue-fill px-5 py-3 font-bold text-white transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
        <ScrollbarAutoHide />
      </body>
    </html>
  );
}
