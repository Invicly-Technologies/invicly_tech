import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full h-11 rounded-lg border border-border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full min-h-32 rounded-lg border border-border bg-card px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-foreground/90", className)}
      {...props}
    />
  );
}
