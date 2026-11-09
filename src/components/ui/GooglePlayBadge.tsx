import { cn } from "@/lib/cn";

type Props = { playStoreUrl?: string; className?: string; label?: string };

/** "Coming soon on Google Play" pill. Pass playStoreUrl to turn it into a real store link. */
export function GooglePlayBadge({ playStoreUrl, className, label = "Coming soon on Google Play" }: Props) {
  const icon = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#DCE6FA" aria-hidden="true">
      <path d="M5 3l15 9-15 9z" />
    </svg>
  );
  if (playStoreUrl) {
    return (
      <a href={playStoreUrl} target="_blank" rel="noopener noreferrer" className={cn("pill hover:border-blue-light", className)}>
        {icon}Get it on Google Play
      </a>
    );
  }
  return (
    <span className={cn("pill", className)}>
      {icon}
      {label}
    </span>
  );
}
