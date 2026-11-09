export const LINK_KINDS = ["doc", "video", "article", "course", "repo", "other"] as const;
export type LinkKind = (typeof LINK_KINDS)[number];

export const KIND_LABEL: Record<LinkKind, string> = {
  doc: "Docs",
  video: "Video",
  article: "Article",
  course: "Course",
  repo: "Repo",
  other: "Link",
};

/** Adds https:// when missing and accepts only http(s) URLs. Returns null when invalid. */
export function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw || raw.length > 2000 || /\s/.test(raw)) return null;
  const withProto = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function detectKind(url: string): LinkKind {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return "other";
  }
  const h = u.hostname.replace(/^www\./, "");
  const p = u.pathname.toLowerCase();
  if (/(^|\.)youtube\.com$|^youtu\.be$|vimeo\.com$|loom\.com$/.test(h)) return "video";
  if (/(^|\.)(github|gitlab|bitbucket)\.(com|org)$/.test(h)) return "repo";
  if (/(udemy|coursera|edx|pluralsight|frontendmasters|egghead|educative|kodekloud|acloudguru|datacamp)\./.test(h) || /\/(course|courses|learn|training)\b/.test(p)) return "course";
  if (/^(docs|developer|dev|learn|reference|api)\./.test(h) || /readthedocs|\.dev$/.test(h) || /\/(docs?|documentation|reference|manual|guide|guides|tutorial)\b/.test(p)) return "doc";
  if (/(medium\.com|dev\.to|substack\.com|hashnode|blog|freecodecamp\.org|stackoverflow\.com)/.test(h) || /\/(blog|posts?|articles?)\b/.test(p)) return "article";
  return "other";
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** A readable default title when the user leaves it blank: host + last path segment. */
export function defaultLabel(url: string) {
  try {
    const u = new URL(url);
    const seg = u.pathname.split("/").filter(Boolean).pop();
    const nice = seg ? decodeURIComponent(seg).replace(/[-_]+/g, " ").replace(/\.\w+$/, "") : "";
    return (nice ? `${hostOf(url)} · ${nice}` : hostOf(url)).slice(0, 200);
  } catch {
    return url.slice(0, 200);
  }
}
