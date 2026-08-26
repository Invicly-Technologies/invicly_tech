import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { Reveal } from "@/components/site/reveal";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact",
  description: "Get in touch with Invicly Technologies to discuss your next project.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <section className="py-20 sm:py-28">
      <div className="container-page grid gap-14 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <span className="mb-3 inline-block rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Contact us
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Let&apos;s talk about your project
          </h1>
          <p className="mt-4 text-muted-foreground">
            Fill out the form and our team will get back to you within one business day, or reach us
            directly using the details below.
          </p>

          <div className="mt-10 space-y-5">
            {settings?.email && (
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail size={17} />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <a href={`mailto:${settings.email}`} className="text-sm text-muted-foreground hover:text-primary">
                    {settings.email}
                  </a>
                </div>
              </div>
            )}
            {settings?.phone && (
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone size={17} />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">Phone</p>
                  <p className="text-sm text-muted-foreground">{settings.phone}</p>
                </div>
              </div>
            )}
            {settings?.address && (
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin size={17} />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">Office</p>
                  <p className="text-sm text-muted-foreground">{settings.address}</p>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
