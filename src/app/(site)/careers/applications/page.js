import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { CandidateLogoutButton } from "@/components/site/candidate-logout-button";
import { Badge } from "@/components/ui/card";
import { getCurrentCandidate } from "@/lib/candidate-auth";
import { connectDB } from "@/lib/db";
import Application from "@/models/Application";

export const dynamic = "force-dynamic";

export const metadata = { title: "My Applications" };

const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under review",
  shortlisted: "Shortlisted",
  rejected: "Not selected",
  hired: "Hired",
};

const STATUS_STYLES = {
  submitted: "",
  under_review: "border-amber-500/30 text-amber-600 dark:text-amber-400",
  shortlisted: "border-primary/30 text-primary",
  rejected: "border-red-500/30 text-red-500",
  hired: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
};

export default async function MyApplicationsPage() {
  const candidate = await getCurrentCandidate();
  if (!candidate) redirect("/careers/login?next=/careers/applications");

  await connectDB();
  const applications = await Application.find({ candidate: candidate._id })
    .sort({ createdAt: -1 })
    .populate("job", "title slug")
    .lean();

  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <div className="flex items-center justify-between">
          <SectionHeading align="left" eyebrow="Careers" title="My applications" className="mx-0" />
          <CandidateLogoutButton />
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {applications.map((app) => (
            <div key={app._id.toString()} className="card-surface flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold text-foreground">{app.job?.title || "Role removed"}</p>
                <p className="text-sm text-muted-foreground">
                  Applied on {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge className={STATUS_STYLES[app.status]}>
                {app.status === "hired" && <CheckCircle2 size={12} className="mr-1" />}
                {STATUS_LABELS[app.status] || app.status}
              </Badge>
            </div>
          ))}

          {applications.length === 0 && (
            <p className="text-center text-muted-foreground">
              You haven&apos;t applied to any roles yet.{" "}
              <Link href="/careers" className="text-primary underline">
                Browse open roles
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
