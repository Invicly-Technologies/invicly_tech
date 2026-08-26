"use client";

import { ResourceManager } from "@/components/admin/resource-manager";

const FIELDS = [
  { name: "clientName", label: "Client name", type: "text", required: true, placeholder: "Rahul Mehta" },
  { name: "company", label: "Company", type: "text", placeholder: "Northwind Retail" },
  { name: "quote", label: "Quote", type: "textarea", required: true },
  { name: "avatarUrl", label: "Avatar URL", type: "text", placeholder: "https://..." },
  { name: "rating", label: "Rating (1-5)", type: "number", placeholder: "5" },
  { name: "order", label: "Sort order", type: "number", placeholder: "0" },
];

const COLUMNS = [
  { name: "clientName", label: "Client" },
  { name: "company", label: "Company" },
  { name: "rating", label: "Rating" },
];

export default function TestimonialsAdminPage() {
  return (
    <ResourceManager
      title="Testimonials"
      description="Manage client testimonials shown on the homepage."
      endpoint="/api/admin/testimonials"
      fields={FIELDS}
      columns={COLUMNS}
    />
  );
}
