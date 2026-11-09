import type { Explainer, ExplainerMap } from "./types";

export type { Explainer, Visual, Step } from "./types";

import systemDesign from "./system-design";
import devopsWithPython from "./devops-with-python";
import githubActions from "./github-actions";
import backendJava from "./backend-java";
import interviewPreparation from "./interview-preparation";
import pythonFromZero from "./python-from-zero";
import sqlPostgresql from "./sql-postgresql";
import frontendReactNextjs from "./frontend-react-nextjs";
import aiEngineeringPython from "./ai-engineering-python";
import awsSolutionsArchitect from "./aws-solutions-architect";
import kubernetesCka from "./kubernetes-cka";
import cyberSecurityFundamentals from "./cyber-security-fundamentals";
import ethicalHacking from "./ethical-hacking";
import linuxSystemProgramming from "./linux-system-programming";
import linuxAdministration from "./linux-administration";
import dataStructuresAlgorithms from "./data-structures-algorithms";
import computerNetworking from "./computer-networking";

/** Explainer content per path slug. */
const registry: Record<string, ExplainerMap> = {
  "system-design": systemDesign,
  "devops-with-python": devopsWithPython,
  "github-actions": githubActions,
  "backend-java": backendJava,
  "interview-preparation": interviewPreparation,
  "python-from-zero": pythonFromZero,
  "sql-postgresql": sqlPostgresql,
  "frontend-react-nextjs": frontendReactNextjs,
  "ai-engineering-python": aiEngineeringPython,
  "aws-solutions-architect": awsSolutionsArchitect,
  "kubernetes-cka": kubernetesCka,
  "cyber-security-fundamentals": cyberSecurityFundamentals,
  "ethical-hacking": ethicalHacking,
  "linux-system-programming": linuxSystemProgramming,
  "linux-administration": linuxAdministration,
  "data-structures-algorithms": dataStructuresAlgorithms,
  "computer-networking": computerNetworking,
};

export const topicSlug = (topicKey: string) => topicKey.replace("/", "--");
export const topicKeyFromSlug = (slug: string) => slug.replace("--", "/");

export function getExplainer(pathSlug: string, topicKey: string): Explainer | undefined {
  return registry[pathSlug]?.[topicKey];
}


export function explainerKeys(pathSlug: string) {
  return Object.keys(registry[pathSlug] ?? {});
}
