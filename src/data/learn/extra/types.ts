import type { Visual } from "../explainers/types";

/**
 * Extra teaching content for one topic, shown on its blog post in addition to the Explainer.
 * Plain text only (no HTML/Markdown). Simple, friendly English: short sentences, everyday words,
 * explain any jargon the first time it appears. Accurate and practical.
 */
export type ExtraContent = {
  /** "Explained simply": 3–5 short paragraphs (each ≤ 90 words) a complete beginner can follow. */
  plain: string[];
  /**
   * "In depth": 3–5 sections that explain how it really works. body ≤ 170 words; bullets 0–5 short items.
   * `visual`: optional diagram shown right under that section, only where a picture makes the idea clearer
   * (typically 1–2 sections per topic). Must show something the other diagrams don't.
   */
  deepDive: { heading: string; body: string; bullets?: string[]; visual?: Visual }[];
  /** 1–2 extra diagrams that show the idea from a different angle than the existing visuals. */
  moreVisuals: Visual[];
  /** Exactly 2 worked examples: a concrete scenario walked through step by step. Code optional (≤ 15 lines). */
  examples: { title: string; explanation: string; code?: { lang: string; code: string } }[];
  /** "Quick reference": 4–8 one-line facts, commands or rules of thumb. Each ≤ 120 characters. */
  cheatSheet: string[];
  /** 4–5 multiple-choice questions, exactly 4 options each, `answer` = index of the correct option, `why` = one sentence. */
  quiz: { q: string; options: string[]; answer: number; why: string }[];
  /** Exactly 3 hands-on exercises: easy, medium, hard. Solution ≤ 12 lines (text or code). */
  practice: { level: "easy" | "medium" | "hard"; task: string; hint: string; solution: string }[];
  /** 3–4 questions beginners actually search for, with 1–3 sentence answers. */
  faq: { q: string; a: string }[];
};

/** Keyed by "moduleKey/topicKey", exactly as in the path data. Partial maps are fine: missing topics just hide the sections. */
export type ExtraMap = Record<string, ExtraContent>;
