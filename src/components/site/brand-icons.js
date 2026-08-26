export function GithubIcon({ size = 16, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.95.1-.74.4-1.25.72-1.54-2.56-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.7.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export function TwitterIcon({ size = 16, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.9 2H22l-7.2 8.2L23 22h-6.9l-5.4-7-6.2 7H1.3l7.7-8.8L1 2h7l4.9 6.4L18.9 2Zm-2.4 18h1.9L7.6 3.9H5.6L16.5 20Z" />
    </svg>
  );
}

export function LinkedinIcon({ size = 16, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5.001ZM.5 21.5h8.96V9H.5v12.5ZM19.02 9.4c-1.98 0-3.1.94-3.65 1.86h-.06V9H6.6v12.5h8.96v-6.44c0-1.62.31-3.2 2.32-3.2 1.98 0 2 1.87 2 3.3v6.34H28V14.5c0-4.55-2.44-6.6-5.98-6.6-2.76 0-3.98 1.51-4.7 2.58h-.02L19.02 9.4Z" transform="translate(-1 0)" />
    </svg>
  );
}

export function InstagramIcon({ size = 16, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
