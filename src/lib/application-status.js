export const STATUS_ORDER = ["submitted", "under_review", "shortlisted", "rejected", "hired"];

export function statusRank(status) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export function isBackwardStatusChange(from, to) {
  return statusRank(to) < statusRank(from);
}
