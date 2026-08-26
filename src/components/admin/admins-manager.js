"use client";

import { useEffect, useState } from "react";
import { Ban, CheckCircle2, Crown, Loader2, Plus, Trash2 } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, PasswordInput, Label } from "@/components/ui/input";

export function AdminsManager() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/admins");
    if (res.ok) setAdmins(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong");
      return;
    }

    setModalOpen(false);
    setForm({ name: "", email: "", password: "" });
    load();
  }

  async function toggleDisabled(admin) {
    await fetch(`/api/admin/admins/${admin._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabled: !admin.disabled }),
    });
    load();
  }

  async function remove(admin) {
    if (!confirm(`Delete admin ${admin.email}? This can't be undone.`)) return;
    await fetch(`/api/admin/admins/${admin._id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Super admin only. The default admin account can&apos;t be disabled or deleted.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add admin
        </Button>
      </div>

      <Card className="mt-8 overflow-x-auto p-0">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5 text-foreground/90">{admin.name}</td>
                  <td className="px-5 py-3.5 text-foreground/90">{admin.email}</td>
                  <td className="px-5 py-3.5">
                    {admin.isSuperAdmin ? (
                      <Badge className="border-primary/30 text-primary">
                        <Crown size={12} className="mr-1" /> Super admin
                      </Badge>
                    ) : (
                      <Badge className={admin.disabled ? "border-red-500/30 text-red-500" : ""}>
                        {admin.disabled ? "Disabled" : "Admin"}
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {!admin.isSuperAdmin && (
                      <>
                        <button
                          onClick={() => toggleDisabled(admin)}
                          className="mr-2 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-primary"
                          aria-label={admin.disabled ? "Enable" : "Disable"}
                        >
                          {admin.disabled ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                        </button>
                        <button
                          onClick={() => remove(admin)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add admin">
        <form onSubmit={onCreate} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="password">Temporary password</Label>
            <PasswordInput
              id="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
