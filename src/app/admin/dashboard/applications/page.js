"use client";

import { useEffect, useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";

const STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
];

const STATUS_STYLES = {
  submitted: "bg-muted text-muted-foreground border-border",
  under_review: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
  shortlisted: "bg-primary/10 text-primary border-primary/30",
  rejected: "bg-red-500/10 text-red-500 border-red-500/30",
  hired: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
};

export default function ApplicationsAdminPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/applications");
    if (res.ok) setApplications(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function updateStatus(id, status) {
    setApplications((apps) => apps.map((a) => (a._id === id ? { ...a, status } : a)));
    await fetch(`/api/admin/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Applications</h1>
      <p className="mt-1 text-sm text-muted-foreground">Every application submitted through the Careers page.</p>

      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        ) : applications.length === 0 ? (
          <Card className="py-10 text-center text-sm text-muted-foreground">No applications yet.</Card>
        ) : (
          applications.map((app) => (
            <Card key={app._id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{app.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {app.email} {app.phone && `· ${app.phone}`}
                  </p>
                  <p className="mt-1 text-sm">
                    Applied for <span className="font-medium text-foreground">{app.job?.title || "a role"}</span>
                    {app.job?.type && <Badge className="ml-2">{app.job.type}</Badge>}
                  </p>
                </div>
                <select
                  value={app.status}
                  onChange={(e) => updateStatus(app._id, e.target.value)}
                  className={`h-9 rounded-full border px-3 text-xs font-medium capitalize outline-none ${STATUS_STYLES[app.status] || ""}`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Education</p>
                  <p className="text-foreground/90">
                    {[app.education?.degree, app.education?.institution, app.education?.graduationYear]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resume</p>
                  {app.resumeUrl ? (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      View link <ExternalLink size={13} />
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Applied on</p>
                  <p className="text-foreground/90">{new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {app.coverLetter && (
                <p className="mt-4 whitespace-pre-line text-sm text-foreground/90">{app.coverLetter}</p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
