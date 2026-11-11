import Link from "next/link";
import { nav, site, socials } from "@/data/site";
import { products } from "@/data/products";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { FooterWordmark } from "./FooterWordmark";

export function Footer() {
  const links = socials.filter((s) => s.url);
  return (
    <footer className="relative border-t border-line bg-ground pb-8 pt-16">
      <div className="wrap">
        <div className="flex flex-wrap justify-between gap-12">
          <div className="flex-[1_1_300px]">
            <div className="flex items-center gap-2.5">
              <LogoMark size={40} />
              <Wordmark />
            </div>
            <p className="mt-4 max-w-[320px] leading-relaxed text-soft">
              {site.tagline}
              <br />
              Software products and engineering services.
            </p>
            {links.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-4 text-sm">
                {links.map((s) => (
                  <a key={s.label} className="nl" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="flex-[0_1_160px]">
            <h2 className="text-sm text-fg">Navigate</h2>
            <ul className="mt-4 flex flex-col gap-3 text-[14.5px]">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link className="nl" href={n.href}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-[0_1_160px]">
            <h2 className="text-sm text-fg">Products</h2>
            <ul className="mt-4 flex flex-col gap-3 text-[14.5px]">
              {products.map((p) => (
                <li key={p.slug}>
                  <Link className="nl" href={`/products/${p.slug}/`}>
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-[0_1_240px]">
            <h2 className="text-sm text-fg">Contact</h2>
            <div className="mt-4 flex flex-col gap-3 text-[14.5px]">
              <a className="nl" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              <span className="text-soft">Replies within one business day</span>
            </div>
          </div>
        </div>
        <FooterWordmark />
        <div className="border-t border-line pt-6 text-[13px] text-quiet">© {new Date().getFullYear()} Invicly Tech. All rights reserved.</div>
      </div>
    </footer>
  );
}
