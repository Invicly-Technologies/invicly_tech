"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function setPath(obj, path, value) {
  const keys = path.split(".");
  const next = { ...obj };
  let cursor = next;
  keys.forEach((key, i) => {
    if (i === keys.length - 1) {
      cursor[key] = value;
    } else {
      cursor[key] = { ...(cursor[key] || {}) };
      cursor = cursor[key];
    }
  });
  return next;
}

export function SingletonForm({ title, description, endpoint, fields }) {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setValues(data))
      .finally(() => setLoading(false));
  }, [endpoint]);

  function update(name, value) {
    setSaved(false);
    setValues((v) => setPath(v, name, value));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(endpoint, {
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
    setValues(await res.json());
    setSaved(true);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}

      <Card className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {fields.map((field) => (
              <div key={field.name}>
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    value={getPath(values, field.name) ?? ""}
                    onChange={(e) => update(field.name, e.target.value)}
                  />
                ) : (
                  <Input
                    id={field.name}
                    placeholder={field.placeholder}
                    value={getPath(values, field.name) ?? ""}
                    onChange={(e) => update(field.name, e.target.value)}
                  />
                )}
                {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
              </div>
            ))}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex items-center gap-3 pt-2">
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
        )}
      </Card>
    </div>
  );
}
