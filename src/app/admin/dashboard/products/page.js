"use client";

import { ResourceManager } from "@/components/admin/resource-manager";

const FIELDS = [
  { name: "title", label: "Title", type: "text", required: true, placeholder: "InviclyCRM" },
  { name: "slug", label: "Slug (URL)", type: "text", required: true, placeholder: "invicly-crm" },
  { name: "category", label: "Category", type: "text", placeholder: "Platform" },
  { name: "description", label: "Short description", type: "textarea", required: true },
  { name: "fullDescription", label: "Full description", type: "textarea" },
  { name: "imageUrl", label: "Image URL", type: "text", placeholder: "https://..." },
  { name: "features", label: "Features (one per line)", type: "lines" },
  { name: "priceLabel", label: "Price label", type: "text", placeholder: "Contact for pricing" },
  { name: "order", label: "Sort order", type: "number", placeholder: "0" },
  { name: "featured", label: "Feature on homepage", type: "checkbox" },
];

const COLUMNS = [
  { name: "title", label: "Title" },
  { name: "category", label: "Category" },
  { name: "featured", label: "Featured", render: (v) => (v ? "Yes" : "No") },
];

export default function ProductsAdminPage() {
  return (
    <ResourceManager
      title="Products"
      description="Manage the products shown on the public site."
      endpoint="/api/admin/products"
      fields={FIELDS}
      columns={COLUMNS}
      slugFrom="title"
    />
  );
}
