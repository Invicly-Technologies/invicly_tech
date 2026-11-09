import type { ExtraContent, ExtraMap } from "./types";
import devopsWithPython from "./devops-with-python";
import githubActions from "./github-actions";
import backendJava from "./backend-java";
import interviewPreparation from "./interview-preparation";
import pythonFromZero from "./python-from-zero";
import frontendReactNextjs from "./frontend-react-nextjs";
import awsSolutionsArchitect from "./aws-solutions-architect";
import kubernetesCka from "./kubernetes-cka";
import sqlPostgresql from "./sql-postgresql";
import aiEngineeringPython from "./ai-engineering-python";
import systemDesign from "./system-design";
import cyberSecurityFundamentals from "./cyber-security-fundamentals";
import ethicalHacking from "./ethical-hacking";
import linuxSystemProgramming from "./linux-system-programming";
import linuxAdministration from "./linux-administration";
import dataStructuresAlgorithms from "./data-structures-algorithms";
import computerNetworking from "./computer-networking";

export type { ExtraContent } from "./types";

/** Extra teaching content per path slug. */
const registry: Record<string, ExtraMap> = {
  "devops-with-python": devopsWithPython,
  "github-actions": githubActions,
  "backend-java": backendJava,
  "interview-preparation": interviewPreparation,
  "python-from-zero": pythonFromZero,
  "frontend-react-nextjs": frontendReactNextjs,
  "aws-solutions-architect": awsSolutionsArchitect,
  "kubernetes-cka": kubernetesCka,
  "sql-postgresql": sqlPostgresql,
  "ai-engineering-python": aiEngineeringPython,
  "system-design": systemDesign,
  "cyber-security-fundamentals": cyberSecurityFundamentals,
  "ethical-hacking": ethicalHacking,
  "linux-system-programming": linuxSystemProgramming,
  "linux-administration": linuxAdministration,
  "data-structures-algorithms": dataStructuresAlgorithms,
  "computer-networking": computerNetworking,
};

export function getExtra(pathSlug: string, topicKey: string): ExtraContent | undefined {
  return registry[pathSlug]?.[topicKey];
}

export const hasExtra = (pathSlug: string, topicKey: string) => Boolean(getExtra(pathSlug, topicKey));
