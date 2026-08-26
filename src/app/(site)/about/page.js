import { SectionHeading } from "@/components/site/section-heading";
import { StatsCounter } from "@/components/site/stats-counter";
import { Reveal } from "@/components/site/reveal";
import { DynamicIcon } from "@/components/site/dynamic-icon";
import { getAbout, getTeam } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About us",
  description: "Learn about Invicly Technologies — our story, mission, values, and the team behind the work.",
};

export default async function AboutPage() {
  const [about, team] = await Promise.all([getAbout(), getTeam()]);

  return (
    <>
      <section className="gradient-bg border-b border-border py-20 sm:py-28">
        <div className="container-page text-center">
          <Reveal>
            <span className="mb-4 inline-block rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              About us
            </span>
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              We&apos;re a technology partner obsessed with outcomes
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-page grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 className="text-2xl font-bold text-foreground">Our story</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{about?.story}</p>
          </Reveal>
          <Reveal delay={0.1} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
            {about?.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={about.imageUrl} alt="Invicly Technologies" className="h-full w-full object-cover" />
            )}
          </Reveal>
        </div>
      </section>

      {about?.stats?.length > 0 && (
        <section className="border-t border-border bg-muted/30 py-16">
          <div className="container-page">
            <StatsCounter stats={about.stats} />
          </div>
        </section>
      )}

      <section className="py-20 sm:py-24">
        <div className="container-page grid gap-8 sm:grid-cols-2">
          <Reveal className="card-surface p-8">
            <h3 className="text-lg font-semibold text-foreground">Our mission</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{about?.mission}</p>
          </Reveal>
          <Reveal delay={0.08} className="card-surface p-8">
            <h3 className="text-lg font-semibold text-foreground">Our vision</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{about?.vision}</p>
          </Reveal>
        </div>
      </section>

      {about?.values?.length > 0 && (
        <section className="border-t border-border bg-muted/30 py-20 sm:py-24">
          <div className="container-page">
            <SectionHeading eyebrow="What drives us" title="Our values" />
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {about.values.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.06} className="card-surface p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <DynamicIcon name={v.icon} size={22} />
                  </div>
                  <h4 className="font-semibold text-foreground">{v.title}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {team?.length > 0 && (
        <section className="py-20 sm:py-24">
          <div className="container-page">
            <SectionHeading eyebrow="Our people" title="Meet the team" />
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member, i) => (
                <Reveal key={member._id} delay={i * 0.06} className="text-center">
                  <div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border border-border bg-muted">
                    {member.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <h4 className="font-semibold text-foreground">{member.name}</h4>
                  <p className="text-sm text-primary">{member.role}</p>
                  {member.bio && <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
