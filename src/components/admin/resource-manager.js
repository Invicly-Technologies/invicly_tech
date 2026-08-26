"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { slugify } from "@/lib/utils";
import { IconPicker } from "@/components/admin/icon-picker";
import { ICON_OPTIONS } from "@/lib/icon-options";

function optionValue(option) {
  return typeof option === "string" ? option : option.value;
}

function optionLabel(option) {
  return typeof option === "string" ? option : option.label;
}

function emptyValuesFor(fields) {
  const values = {};
  for (const field of fields) {
    if (field.type === "checkbox") values[field.name] = false;
    else if (field.type === "icon") values[field.name] = ICON_OPTIONS[0];
    else if (field.type === "select") values[field.name] = optionValue(field.options[0]);
    else values[field.name] = "";
  }
  return values;
}

function toFormValues(item, fields) {
  const values = {};
  for (const field of fields) {
    const raw = item[field.name];
    if (field.type === "lines") values[field.name] = Array.isArray(raw) ? raw.join("\n") : "";
    else if (field.type === "checkbox") values[field.name] = Boolean(raw);
    else if (field.type === "date") values[field.name] = raw ? String(raw).slice(0, 10) : "";
    else values[field.name] = raw ?? "";
  }
  return values;
}

function toPayload(values, fields) {
  const payload = {};
  for (const field of fields) {
    const raw = values[field.name];
    if (field.type === "lines") {
      payload[field.name] = raw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (field.type === "number") {
      payload[field.name] = raw === "" ? 0 : Number(raw);
    } else if (field.type === "checkbox") {
      payload[field.name] = Boolean(raw);
    } else if (field.type === "date") {
      payload[field.name] = raw || null;
    } else {
      payload[field.name] = raw;
    }
  }
  return payload;
}

export function ResourceManager({ title, description, endpoint, fields, columns, slugFrom }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(emptyValuesFor(fields));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const hasSlug = useMemo(() => fields.some((f) => f.name === "slug"), [fields]);

  async function load() {
    setLoading(true);
    const res = await fetch(endpoint);
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setValues(emptyValuesFor(fields));
    setError("");
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setValues(toFormValues(item, fields));
    setError("");
    setModalOpen(true);
  }

  function updateField(name, value) {
    setValues((v) => {
      const next = { ...v, [name]: value };
      if (!editing && hasSlug && slugFrom && name === slugFrom) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = toPayload(values, fields);
    const url = editing ? `${endpoint}/${editing._id}` : endpoint;
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong");
      return;
    }

    setModalOpen(false);
    load();
  }

  async function onDelete(item) {
    if (!confirm(`Delete "${item.title || item.name || item.clientName}"? This can't be undone.`)) return;
    await fetch(`${endpoint}/${item._id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add new
        </Button>
      </div>

      <Card className="mt-8 overflow-x-auto p-0">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        ) : items.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            Nothing here yet. Click &quot;Add new&quot; to create the first one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                {columns.map((col) => (
                  <th key={col.name} className="px-5 py-3 font-medium">
                    {col.label}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-border last:border-0">
                  {columns.map((col) => (
                    <td key={col.name} className="max-w-xs truncate px-5 py-3.5 text-foreground/90">
                      {col.render ? col.render(item[col.name], item) : String(item[col.name] ?? "")}
                    </td>
                  ))}
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => openEdit(item)}
                      className="mr-2 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-primary"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit ${title}` : `Add ${title}`}>
        <form onSubmit={onSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              {field.type !== "checkbox" && <Label htmlFor={field.name}>{field.label}</Label>}
              {field.type === "textarea" || field.type === "lines" ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  required={field.required}
                  className={field.type === "lines" ? "min-h-24" : undefined}
                />
              ) : field.type === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={values[field.name]}
                    onChange={(e) => updateField(field.name, e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  {field.label}
                </label>
              ) : field.type === "icon" ? (
                <IconPicker value={values[field.name]} onChange={(v) => updateField(field.name, v)} />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  value={values[field.name]}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  required={field.required}
                  className="h-11 w-full rounded-lg border border-border bg-card px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {field.options.map((option) => (
                    <option key={optionValue(option)} value={optionValue(option)}>
                      {optionLabel(option)}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  required={field.required}
                />
              )}
              {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
            </div>
          ))}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editing ? "Save changes" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
