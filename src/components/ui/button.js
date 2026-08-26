import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20",
  outline:
    "border border-border bg-transparent hover:bg-muted text-foreground",
  ghost: "bg-transparent hover:bg-muted text-foreground",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className,
  ...props
}) {
  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
