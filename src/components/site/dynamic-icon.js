import * as icons from "lucide-react";

export function DynamicIcon({ name, className, size = 24 }) {
  const Icon = icons[name] || icons.Sparkles;
  return <Icon className={className} size={size} />;
}
