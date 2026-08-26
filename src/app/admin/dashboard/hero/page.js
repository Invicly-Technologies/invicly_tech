"use client";

import { SingletonForm } from "@/components/admin/singleton-form";

const FIELDS = [
  { name: "eyebrow", label: "Eyebrow text", placeholder: "Software · Cloud · AI" },
  { name: "headline", label: "Headline", type: "textarea" },
  { name: "subheadline", label: "Subheadline", type: "textarea" },
  { name: "ctaText", label: "Primary button text", placeholder: "Start a project" },
  { name: "ctaLink", label: "Primary button link", placeholder: "/contact" },
  { name: "secondaryCtaText", label: "Secondary button text", placeholder: "Explore services" },
  { name: "secondaryCtaLink", label: "Secondary button link", placeholder: "/services" },
  { name: "backgroundImageUrl", label: "Background image URL", placeholder: "https://..." },
];

export default function HeroAdminPage() {
  return (
    <SingletonForm
      title="Hero section"
      description="This is the first thing visitors see on the homepage."
      endpoint="/api/admin/hero"
      fields={FIELDS}
    />
  );
}
