import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { PageTransition } from "@/components/layout/PageTransition";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <SmoothScroll />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
