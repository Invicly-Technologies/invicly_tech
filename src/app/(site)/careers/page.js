import Link from "next/link";
import { ArrowRight, MapPin, Briefcase } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { getOpenJobPostings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Careers",
  description: "Open roles and internships at Invicly Technologies.",
};

const TYPE_LABELS = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  internship: "Internship",
  contract: "Contract",
};

export default async function CareersPage() {
  const jobs = await getOpenJobPostings();

  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Careers"
          title="Build the future with us"
          description="We're always looking for curious, driven people. Explore our open roles and internships below."
        />

        <div className="mx-auto mt-14 max-w-3xl space-y-4">
          {jobs.map((job, i) => (
            <Reveal key={job._id} delay={i * 0.05}>
              <Link
                href={`/careers/${job.slug}`}
                className="card-surface group flex flex-col gap-3 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {job.department && <span>{job.department}</span>}
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={13} /> {TYPE_LABELS[job.type] || job.type}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  View role <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {jobs.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">
            No open roles right now — check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
