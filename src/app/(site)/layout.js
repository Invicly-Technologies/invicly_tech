import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getSiteSettings } from "@/lib/data";

export default async function SiteLayout({ children }) {
  const settings = await getSiteSettings();

  return (
    <>
      <Header siteName={settings?.siteName || "Invicly Technologies"} logoUrl={settings?.logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
