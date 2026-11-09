/**
 * Visual explainer content for one topic. Rendered by src/components/learn/visuals.tsx.
 * Keep every string plain text (no HTML, no Markdown), short, and accurate.
 */
export type Step = { label: string; detail?: string };

export type Visual =
  /** Ordered pipeline or process, left → right. 3–7 steps. */
  | { type: "flow"; title: string; steps: Step[] }
  /** Stack of layers, top → bottom (architecture, abstraction levels). 3–7 layers. */
  | { type: "layers"; title: string; layers: Step[] }
  /** Repeating loop (lifecycle, feedback loop). 3–6 steps. */
  | { type: "cycle"; title: string; steps: Step[] }
  /** Side-by-side comparison of 2–3 options. 3–5 points each. */
  | { type: "compare"; title: string; columns: { title: string; points: string[] }[] }
  /** Hierarchy: one root, 2–6 branches, each with 0–5 leaves. */
  | { type: "tree"; title: string; root: string; children: { label: string; children?: string[] }[] }
  /** Messages between 2–4 actors, in order. `from`/`to` are indexes into `actors`. 3–8 messages. */
  | { type: "sequence"; title: string; actors: string[]; messages: { from: number; to: number; label: string }[] };

export type Explainer = {
  /** 2–3 plain sentences: what it is and why it matters. */
  summary: string;
  /** Optional one-sentence everyday analogy. */
  analogy?: string;
  /** 1–2 diagrams that best explain the topic. Pick the type that fits the idea. */
  visuals: Visual[];
  /** 3–5 short takeaways. */
  keyPoints: string[];
  /** 3–6 terms with one-line meanings. */
  terms: { term: string; meaning: string }[];
  /** Optional short, runnable example (≤ 15 lines). */
  example?: { lang: string; code: string; caption?: string };
  /** Optional 2–3 common mistakes. */
  pitfalls?: string[];
  /** 2–3 self-check questions with short answers. */
  check: { q: string; a: string }[];
};

/** Keyed by "moduleKey/topicKey", exactly as in the path data. */
export type ExplainerMap = Record<string, Explainer>;
