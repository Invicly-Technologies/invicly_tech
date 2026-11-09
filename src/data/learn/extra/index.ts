import type { ExtraContent, ExtraMap } from "./types";

export type { ExtraContent } from "./types";

/** Extra teaching content per path slug (filled in as content files are added). */
const registry: Record<string, ExtraMap> = {};

export function getExtra(pathSlug: string, topicKey: string): ExtraContent | undefined {
  return registry[pathSlug]?.[topicKey];
}
