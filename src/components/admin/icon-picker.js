"use client";

import { ICON_OPTIONS } from "@/lib/icon-options";
import { DynamicIcon } from "@/components/site/dynamic-icon";
import { cn } from "@/lib/utils";

export function IconPicker({ value, onChange, className }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-primary">
        <DynamicIcon name={value} size={20} />
      </span>
      <select
        value={value || ICON_OPTIONS[0]}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-border bg-card px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {ICON_OPTIONS.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
