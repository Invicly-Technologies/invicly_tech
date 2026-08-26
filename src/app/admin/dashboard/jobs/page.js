"use client";

import { ResourceManager } from "@/components/admin/resource-manager";

const FIELDS = [
  { name: "title", label: "Title", type: "text", required: true, placeholder: "Frontend Engineer" },
  { name: "slug", label: "Slug (URL)", type: "text", required: true, placeholder: "frontend-engineer" },
  { name: "department", label: "Department", type: "text", placeholder: "Engineering" },
  { name: "location", label: "Location", type: "text", placeholder: "Remote / Pune, India" },
  {
    name: "type",
    label: "Type",
    type: "select",
    required: true,
    options: [
      { value: "full-time", label: "Full-time" },
      { value: "part-time", label: "Part-time" },
      { value: "internship", label: "Internship" },
      { value: "contract", label: "Contract" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "open", label: "Open" },
      { value: "closed", label: "Closed" },
    ],
  },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "responsibilities", label: "Responsibilities (one per line)", type: "lines" },
  { name: "requirements", label: "Requirements (one per line)", type: "lines" },
  { name: "applyDeadline", label: "Apply deadline", type: "date" },
  { name: "order", label: "Sort order", type: "number", placeholder: "0" },
];

const COLUMNS = [
  { name: "title", label: "Title" },
  { name: "department", label: "Department" },
  { name: "type", label: "Type" },
  { name: "status", label: "Status" },
];

export default function JobsAdminPage() {
  return (
    <ResourceManager
      title="Job postings"
      description="Manage open roles and internships shown on the Careers page."
      endpoint="/api/admin/jobs"
      fields={FIELDS}
      columns={COLUMNS}
      slugFrom="title"
    />
  );
}
