import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("card-surface p-6", className)} {...props} />;
}

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}
