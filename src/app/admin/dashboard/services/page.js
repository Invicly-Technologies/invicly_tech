"use client";

import { ResourceManager } from "@/components/admin/resource-manager";
import { DynamicIcon } from "@/components/site/dynamic-icon";

const FIELDS = [
  { name: "title", label: "Title", type: "text", required: true, placeholder: "Cloud & DevOps Solutions" },
  { name: "slug", label: "Slug (URL)", type: "text", required: true, placeholder: "cloud-devops-solutions" },
  { name: "icon", label: "Icon", type: "icon" },
  { name: "shortDescription", label: "Short description", type: "textarea", required: true },
  { name: "fullDescription", label: "Full description", type: "textarea", required: true },
  { name: "imageUrl", label: "Image URL", type: "text", placeholder: "https://..." },
  { name: "features", label: "Features (one per line)", type: "lines" },
  { name: "order", label: "Sort order", type: "number", placeholder: "0" },
  { name: "featured", label: "Feature on homepage", type: "checkbox" },
];

const COLUMNS = [
  {
    name: "icon",
    label: "",
    render: (v) => (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <DynamicIcon name={v} size={16} />
      </span>
    ),
  },
  { name: "title", label: "Title" },
  { name: "slug", label: "Slug" },
  { name: "featured", label: "Featured", render: (v) => (v ? "Yes" : "No") },
];

export default function ServicesAdminPage() {
  return (
    <ResourceManager
      title="Services"
      description="Manage the services shown on the public site."
      endpoint="/api/admin/services"
      fields={FIELDS}
      columns={COLUMNS}
      slugFrom="title"
    />
  );
}
