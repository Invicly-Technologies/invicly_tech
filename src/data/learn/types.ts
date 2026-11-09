export type Resource = { label: string; url: string };

export type Topic = {
  key: string;
  title: string;
  /** Estimated focused study hours, used by the scheduler. */
  hours: number;
  /** One sentence: what you can do once this topic is done. */
  goal: string;
  /** 3–6 short, concrete checklist items that make up the topic. */
  subtopics?: string[];
  links?: Resource[];
};

export type Module = {
  key: string;
  title: string;
  summary: string;
  topics: Topic[];
  links?: Resource[];
};

export const PATH_CATEGORIES = ["DevOps & Cloud", "Backend", "Frontend", "Data & AI", "Security", "Foundations", "Career"] as const;
export type PathCategory = (typeof PATH_CATEGORIES)[number];

export type PathIconName =
  | "server"
  | "git"
  | "coffee"
  | "target"
  | "code"
  | "layout"
  | "cloud"
  | "boxes"
  | "database"
  | "brain"
  | "network"
  | "terminal"
  | "shield"
  | "bug"
  | "cpu"
  | "binary"
  | "wifi";

export type LearningPath = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  level: "Beginner" | "Beginner → Intermediate" | "Intermediate" | "Intermediate → Advanced";
  category: PathCategory;
  icon: PathIconName;
  outcomes: string[];
  tools: string[];
  modules: Module[];
};
