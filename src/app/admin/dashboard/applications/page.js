"use client";

import { useEffect, useState } from "react";
import { Loader2, ExternalLink, Mail, ShieldCheck, ShieldAlert, Eye } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { MailComposeModal } from "@/components/admin/mail-compose-modal";

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

function DetailRow({ label, children }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-sm text-foreground/90">{children}</div>
    </div>
  );
}

export default function ApplicationsAdminPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailApp, setDetailApp] = useState(null);
  const [mailTarget, setMailTarget] = useState(null);

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
    setDetailApp((d) => (d && d._id === id ? { ...d, status } : d));
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
                  <p className="text-sm text-muted-foreground break-all">
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

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setDetailApp(app)}>
                  <Eye size={14} /> View full application
                </Button>
                <Button variant="outline" size="sm" onClick={() => setMailTarget(app)}>
                  <Mail size={14} /> Email applicant
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        open={Boolean(detailApp)}
        onClose={() => setDetailApp(null)}
        title="Application details"
        className="max-w-2xl"
      >
        {detailApp && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-foreground">{detailApp.fullName}</p>
                <p className="break-all text-sm text-muted-foreground">{detailApp.email}</p>
              </div>
              <select
                value={detailApp.status}
                onChange={(e) => updateStatus(detailApp._id, e.target.value)}
                className={`h-9 rounded-full border px-3 text-xs font-medium capitalize outline-none ${STATUS_STYLES[detailApp.status] || ""}`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="Phone">{detailApp.phone || "-"}</DetailRow>
              <DetailRow label="Applying for">
                {detailApp.job?.title || "Role removed"}
                {detailApp.job?.type && <Badge className="ml-2">{detailApp.job.type}</Badge>}
              </DetailRow>
              <DetailRow label="Location / Department">
                {[detailApp.job?.location, detailApp.job?.department].filter(Boolean).join(" · ") || "-"}
              </DetailRow>
              <DetailRow label="Applied on">{new Date(detailApp.createdAt).toLocaleString()}</DetailRow>
              <DetailRow label="Last updated">{new Date(detailApp.updatedAt).toLocaleString()}</DetailRow>
              <DetailRow label="Candidate account">
                {detailApp.candidate ? (
                  <span className="inline-flex items-center gap-1.5">
                    {detailApp.candidate.disabled ? (
                      <>
                        <ShieldAlert size={13} className="text-red-500" /> Disabled
                      </>
                    ) : detailApp.candidate.emailVerified ? (
                      <>
                        <ShieldCheck size={13} className="text-emerald-500" /> Verified
                      </>
                    ) : (
                      "Unverified"
                    )}
                    <span className="text-muted-foreground">
                      · joined {new Date(detailApp.candidate.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                ) : (
                  "Account deleted"
                )}
              </DetailRow>
            </div>

            <DetailRow label="Education">
              {[detailApp.education?.degree, detailApp.education?.institution, detailApp.education?.graduationYear]
                .filter(Boolean)
                .join(", ") || "-"}
            </DetailRow>

            <DetailRow label="Resume">
              {detailApp.resumeUrl ? (
                <a
                  href={detailApp.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Open resume <ExternalLink size={13} />
                </a>
              ) : (
                "-"
              )}
            </DetailRow>

            <DetailRow label="Cover letter">
              <p className="whitespace-pre-line rounded-lg bg-muted p-3 text-sm text-foreground/90">
                {detailApp.coverLetter || "No cover letter submitted."}
              </p>
            </DetailRow>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDetailApp(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setMailTarget(detailApp);
                  setDetailApp(null);
                }}
              >
                <Mail size={15} /> Email applicant
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <MailComposeModal
        key={mailTarget?._id || "closed"}
        open={Boolean(mailTarget)}
        onClose={() => setMailTarget(null)}
        to={mailTarget?.email}
        recipientName={mailTarget?.fullName}
        defaultSubject={mailTarget?.job?.title ? `Regarding your application for ${mailTarget.job.title}` : ""}
      />
    </div>
  );
}
