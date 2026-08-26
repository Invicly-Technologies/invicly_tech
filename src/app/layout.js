import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteSettings } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return {
    title: {
      default: settings?.siteName || "Invicly Technologies",
      template: `%s | ${settings?.siteName || "Invicly Technologies"}`,
    },
    description:
      settings?.seoDescription ||
      "Invicly Technologies builds software, cloud, and AI solutions that help businesses move faster.",
  };
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
