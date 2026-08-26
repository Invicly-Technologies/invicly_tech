"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { SingletonForm } from "@/components/admin/singleton-form";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SETTINGS_FIELDS = [
  { name: "siteName", label: "Site name", placeholder: "Invicly Technologies" },
  { name: "tagline", label: "Tagline", placeholder: "Engineering Tomorrow's Technology, Today" },
  { name: "logoUrl", label: "Logo URL", placeholder: "https://..." },
  { name: "email", label: "Contact email", placeholder: "hello@invictechnologies.com" },
  { name: "phone", label: "Contact phone", placeholder: "+1 (555) 013-4477" },
  { name: "address", label: "Office address", type: "textarea" },
  { name: "socials.linkedin", label: "LinkedIn URL" },
  { name: "socials.twitter", label: "Twitter/X URL" },
  { name: "socials.github", label: "GitHub URL" },
  { name: "socials.instagram", label: "Instagram URL" },
  { name: "seoDescription", label: "SEO description", type: "textarea", hint: "Shown in search results and social previews." },
];

function ChangePasswordCard() {
  const [values, setValues] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/admin/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong");
      return;
    }

    setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setSaved(true);
  }

  return (
    <Card className="mt-8">
      <h2 className="text-lg font-semibold text-foreground">Change admin password</h2>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <Label htmlFor="currentPassword">Current password</Label>
          <Input
            id="currentPassword"
            type="password"
            required
            value={values.currentPassword}
            onChange={(e) => setValues((v) => ({ ...v, currentPassword: e.target.value }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              required
              value={values.newPassword}
              onChange={(e) => setValues((v) => ({ ...v, newPassword: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={values.confirmPassword}
              onChange={(e) => setValues((v) => ({ ...v, confirmPassword: e.target.value }))}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            Update password
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-500">
              <CheckCircle2 size={16} /> Updated
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}

export default function SettingsAdminPage() {
  return (
    <div>
      <SingletonForm
        title="Site settings"
        description="Global information used across the whole site."
        endpoint="/api/admin/settings"
        fields={SETTINGS_FIELDS}
      />
      <ChangePasswordCard />
    </div>
  );
}
