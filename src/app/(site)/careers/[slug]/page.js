import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, MapPin, Briefcase, Calendar } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/card";
import { ApplicationForm } from "@/components/site/application-form";
import { getJobPostingBySlug, hasCandidateApplied } from "@/lib/data";
import { getCurrentCandidate } from "@/lib/candidate-auth";

export const dynamic = "force-dynamic";

const TYPE_LABELS = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  internship: "Internship",
  contract: "Contract",
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const job = await getJobPostingBySlug(slug);
  if (!job) return {};
  return { title: job.title, description: job.description };
}

export default async function JobDetailPage({ params }) {
  const { slug } = await params;
  const job = await getJobPostingBySlug(slug);
  if (!job) notFound();

  const candidate = await getCurrentCandidate();
  const alreadyApplied = candidate ? await hasCandidateApplied(candidate._id, job._id) : false;

  return (
    <section className="py-16 sm:py-24">
      <div className="container-page max-w-3xl">
        <Link href="/careers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft size={15} /> All openings
        </Link>

        <Reveal className="mt-6">
          <Badge className="mb-4">{TYPE_LABELS[job.type] || job.type}</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{job.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {job.department && <span>{job.department}</span>}
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {job.location}
            </span>
            {job.applyDeadline && (
              <span className="flex items-center gap-1">
                <Calendar size={14} /> Apply by {new Date(job.applyDeadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.05} className="mt-8 whitespace-pre-line leading-relaxed text-foreground/90">
          {job.description}
        </Reveal>

        {job.responsibilities?.length > 0 && (
          <Reveal delay={0.1} className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">Responsibilities</h2>
            <ul className="mt-4 space-y-2.5">
              {job.responsibilities.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {job.requirements?.length > 0 && (
          <Reveal delay={0.15} className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">Requirements</h2>
            <ul className="mt-4 space-y-2.5">
              {job.requirements.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <Reveal delay={0.2} className="mt-12">
          <h2 className="mb-5 text-lg font-semibold text-foreground">Apply for this role</h2>
          {alreadyApplied ? (
            <div className="card-surface flex flex-col items-center gap-3 p-10 text-center">
              <CheckCircle2 className="text-primary" size={36} />
              <p className="text-sm text-muted-foreground">
                You&apos;ve already applied to this role.{" "}
                <Link href="/careers/applications" className="text-primary underline">
                  Track your application
                </Link>
              </p>
            </div>
          ) : candidate ? (
            <ApplicationForm
              jobId={job._id.toString()}
              defaultValues={{ name: candidate.name, email: candidate.email, phone: candidate.phone }}
            />
          ) : (
            <div className="card-surface flex flex-col items-center gap-4 p-10 text-center">
              <p className="text-sm text-muted-foreground">Sign in to your candidate account to apply.</p>
              <div className="flex gap-3">
                <Link
                  href={`/careers/login?next=/careers/${job.slug}`}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
                >
                  Log in
                </Link>
                <Link
                  href={`/careers/signup?next=/careers/${job.slug}`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Create account
                </Link>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
