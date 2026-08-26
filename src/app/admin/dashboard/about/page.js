"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconPicker } from "@/components/admin/icon-picker";
import { ICON_OPTIONS } from "@/lib/icon-options";

const EMPTY = {
  story: "",
  mission: "",
  vision: "",
  imageUrl: "",
  values: [],
  stats: [],
};

export default function AboutAdminPage() {
  const [values, setValues] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/about")
      .then((res) => res.json())
      .then((data) => setValues({ ...EMPTY, ...data }))
      .finally(() => setLoading(false));
  }, []);

  function updateField(name, value) {
    setSaved(false);
    setValues((v) => ({ ...v, [name]: value }));
  }

  function updateArrayItem(key, index, field, value) {
    setSaved(false);
    setValues((v) => {
      const arr = [...v[key]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...v, [key]: arr };
    });
  }

  function addArrayItem(key, template) {
    setValues((v) => ({ ...v, [key]: [...v[key], template] }));
  }

  function removeArrayItem(key, index) {
    setValues((v) => ({ ...v, [key]: v[key].filter((_, i) => i !== index) }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/about", {
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
    setValues({ ...EMPTY, ...(await res.json()) });
    setSaved(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
        <Loader2 size={16} className="animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">About page</h1>
      <p className="mt-1 text-sm text-muted-foreground">Story, mission, values, and stats shown on the About page.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-8">
        <Card className="space-y-5">
          <div>
            <Label htmlFor="story">Company story</Label>
            <Textarea id="story" className="min-h-32" value={values.story} onChange={(e) => updateField("story", e.target.value)} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="mission">Mission</Label>
              <Textarea id="mission" value={values.mission} onChange={(e) => updateField("mission", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="vision">Vision</Label>
              <Textarea id="vision" value={values.vision} onChange={(e) => updateField("vision", e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" placeholder="https://..." value={values.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <Label className="!mb-0">Company values</Label>
              <p className="text-xs text-muted-foreground">Shown as icon cards on the About page.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem("values", { title: "", description: "", icon: ICON_OPTIONS[0] })}
            >
              <Plus size={14} /> Add value
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {values.values.map((item, i) => (
              <div key={i} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Value {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem("values", i)}
                    aria-label="Remove value"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => updateArrayItem("values", i, "title", e.target.value)}
                  />
                  <IconPicker
                    value={item.icon}
                    onChange={(v) => updateArrayItem("values", i, "icon", v)}
                  />
                </div>
                <Textarea
                  className="mt-3"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateArrayItem("values", i, "description", e.target.value)}
                />
              </div>
            ))}
            {values.values.length === 0 && <p className="text-sm text-muted-foreground">No values yet.</p>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <Label className="!mb-0">Stats</Label>
              <p className="text-xs text-muted-foreground">The animated counters shown on the homepage and About page.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem("stats", { label: "", value: "" })}
            >
              <Plus size={14} /> Add stat
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {values.stats.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <Input
                  placeholder="Value (e.g. 120+)"
                  value={item.value}
                  onChange={(e) => updateArrayItem("stats", i, "value", e.target.value)}
                />
                <Input
                  placeholder="Label (e.g. Projects delivered)"
                  value={item.label}
                  onChange={(e) => updateArrayItem("stats", i, "label", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("stats", i)}
                  aria-label="Remove stat"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {values.stats.length === 0 && <p className="text-sm text-muted-foreground">No stats yet.</p>}
          </div>
        </Card>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save changes
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-500">
              <CheckCircle2 size={16} /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
