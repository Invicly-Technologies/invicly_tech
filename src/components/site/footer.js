import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { GithubIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from "@/components/site/brand-icons";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function Footer({ settings }) {
  const year = new Date().getFullYear();
  const socials = settings?.socials || {};

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              {settings?.siteName?.[0] || "I"}
            </span>
            {settings?.siteName || "Invicly Technologies"}
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            {settings?.tagline || "Engineering Tomorrow's Technology, Today"}
          </p>
          <div className="mt-5 flex gap-3">
            {socials.linkedin && (
              <a href={socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-primary/10">
                <LinkedinIcon size={16} />
              </a>
            )}
            {socials.twitter && (
              <a href={socials.twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-primary/10">
                <TwitterIcon size={16} />
              </a>
            )}
            {socials.github && (
              <a href={socials.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-primary/10">
                <GithubIcon size={16} />
              </a>
            )}
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-primary/10">
                <InstagramIcon size={16} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-foreground">Navigate</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-foreground">Contact</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {settings?.email && (
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-0.5 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-primary break-all">
                  {settings.email}
                </a>
              </li>
            )}
            {settings?.phone && (
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-0.5 shrink-0" />
                <span>{settings.phone}</span>
              </li>
            )}
            {settings?.address && (
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>{settings.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex items-center justify-center py-5 text-xs text-muted-foreground">
          <p>
            © {year} {settings?.siteName || "Invicly Technologies"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
