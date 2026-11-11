"use client";
import dynamic from "next/dynamic";

/**
 * The rich-text editor (Tiptap) is the heaviest thing in Learn. Loading it on demand keeps it out of the
 * dashboard and plan pages until a note is actually opened.
 */
export const NotionEditor = dynamic(() => import("@/components/learn/NotionEditor").then((m) => m.NotionEditor), {
  ssr: false,
  loading: () => <div className="min-h-32 animate-pulse rounded-2xl bg-fg/[.04]" aria-label="Loading editor…" />,
});
