import type { Visual } from "../explainers/types";

/**
 * Extra teaching content for one topic, shown on its blog/explainer page in addition to the Explainer.
 * Plain text only (no HTML/Markdown). Simple, friendly English: short sentences, everyday words,
 * explain any jargon the first time it appears.
 */
export type ExtraContent = {
  /** "Explained simply": 2–4 short paragraphs (each ≤ 90 words) a beginner can follow. */
  plain: string[];
  /** 0–1 extra diagram that shows the idea from a different angle than the existing visuals. */
  moreVisuals?: Visual[];
  /** 1–2 worked examples: a concrete scenario walked through step by step. Code optional (≤ 15 lines). */
  examples: { title: string; explanation: string; code?: { lang: string; code: string } }[];
  /** Exactly 3 multiple-choice questions, 4 options each, `answer` = index of the correct option, `why` = one-sentence reason. */
  quiz: { q: string; options: string[]; answer: number; why: string }[];
  /** 2–3 hands-on exercises, increasing difficulty. Solution ≤ 10 lines (text or code). */
  practice: { level: "easy" | "medium" | "hard"; task: string; hint: string; solution: string }[];
};

/** Keyed by "moduleKey/topicKey", exactly as in the path data. */
export type ExtraMap = Record<string, ExtraContent>;
