"use client";

import { ResourceManager } from "@/components/admin/resource-manager";

const FIELDS = [
  { name: "name", label: "Name", type: "text", required: true, placeholder: "Ananya Rao" },
  { name: "role", label: "Role", type: "text", required: true, placeholder: "Co-founder & CEO" },
  { name: "bio", label: "Bio", type: "textarea" },
  { name: "photoUrl", label: "Photo URL", type: "text", placeholder: "https://..." },
  { name: "linkedin", label: "LinkedIn URL", type: "text" },
  { name: "twitter", label: "Twitter/X URL", type: "text" },
  { name: "order", label: "Sort order", type: "number", placeholder: "0" },
];

const COLUMNS = [
  { name: "name", label: "Name" },
  { name: "role", label: "Role" },
];

export default function TeamAdminPage() {
  return (
    <ResourceManager
      title="Team"
      description="Manage the people shown on the About page."
      endpoint="/api/admin/team"
      fields={FIELDS}
      columns={COLUMNS}
    />
  );
}
