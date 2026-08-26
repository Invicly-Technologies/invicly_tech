"use client";

import { useEffect, useState } from "react";
import { Loader2, Ban, CheckCircle2, Trash2 } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";

export function CandidatesManager({ isSuperAdmin }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/candidates");
    if (res.ok) setCandidates(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function toggleDisabled(candidate) {
    await fetch(`/api/admin/candidates/${candidate._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabled: !candidate.disabled }),
    });
    load();
  }

  async function remove(candidate) {
    if (!confirm(`Delete the account for ${candidate.email}? This can't be undone.`)) return;
    await fetch(`/api/admin/candidates/${candidate._id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Candidates</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everyone who has signed up to apply through the Careers page.</p>

      <Card className="mt-8 overflow-x-auto p-0">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        ) : candidates.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No candidate accounts yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Status</th>
                {isSuperAdmin && <th className="px-5 py-3 text-right font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c._id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5 text-foreground/90">{c.name}</td>
                  <td className="px-5 py-3.5 text-foreground/90">{c.email}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={c.disabled ? "border-red-500/30 text-red-500" : !c.emailVerified ? "border-amber-500/30 text-amber-600" : ""}>
                      {c.disabled ? "Disabled" : c.emailVerified ? "Active" : "Unverified"}
                    </Badge>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => toggleDisabled(c)}
                        className="mr-2 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-primary"
                        aria-label={c.disabled ? "Enable" : "Disable"}
                        title={c.disabled ? "Enable account" : "Disable account"}
                      >
                        {c.disabled ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                      </button>
                      <button
                        onClick={() => remove(c)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
