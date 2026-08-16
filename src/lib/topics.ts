import { Topic } from "@/types/question";

export interface TopicInfo {
  key: Topic;
  displayName: string;
  color: string;
  keywords: string[];
}

export const TOPICS: TopicInfo[] = [
  {
    key: "responsible_ai",
    displayName: "Responsible AI",
    color: "#0066CC",
    keywords: [
      "responsible",
      "fairness",
      "transparency",
      "accountability",
      "inclusiveness",
      "reliability",
      "privacy",
    ],
  },
  {
    key: "ml_fundamentals",
    displayName: "ML Fundamentals",
    color: "#7C3AED",
    keywords: [
      "machine learning",
      "training",
      "model",
      "regression",
      "classification",
      "clustering",
      "features",
      "labels",
    ],
  },
  {
    key: "computer_vision",
    displayName: "Computer Vision",
    color: "#0284C7",
    keywords: [
      "image",
      "vision",
      "face",
      "object detection",
      "ocr",
      "spatial analysis",
    ],
  },
  {
    key: "nlp",
    displayName: "Natural Language Processing",
    color: "#059669",
    keywords: [
      "language",
      "nlp",
      "sentiment",
      "key phrase",
      "text analytics",
      "translation",
      "speech",
    ],
  },
  {
    key: "conversational_ai",
    displayName: "Conversational AI & Bots",
    color: "#D97706",
    keywords: ["bot", "qna maker", "luis", "conversational", "intent"],
  },
  {
    key: "azure_cognitive",
    displayName: "Azure Cognitive Services",
    color: "#DC2626",
    keywords: [
      "cognitive services",
      "azure ai",
      "form recognizer",
      "personalizer",
    ],
  },
  {
    key: "azure_ml",
    displayName: "Azure Machine Learning",
    color: "#1E7D4E",
    keywords: [
      "azure machine learning",
      "automated ml",
      "pipeline",
      "compute",
    ],
  },
  {
    key: "cloud_concepts",
    displayName: "Cloud Concepts",
    color: "#0078D4",
    keywords: [
      "iaas",
      "paas",
      "saas",
      "public cloud",
      "private cloud",
      "hybrid",
      "capex",
      "opex",
      "scalability",
      "elasticity",
    ],
  },
  {
    key: "core_services",
    displayName: "Core Azure Services",
    color: "#005BA1",
    keywords: [
      "virtual machine",
      "app service",
      "azure functions",
      "blob storage",
      "virtual network",
      "azure sql",
      "container",
      "kubernetes",
    ],
  },
  {
    key: "security_identity",
    displayName: "Security & Identity",
    color: "#D13438",
    keywords: [
      "entra",
      "active directory",
      "rbac",
      "mfa",
      "defender",
      "firewall",
      "encryption",
      "identity",
    ],
  },
  {
    key: "governance",
    displayName: "Governance & Compliance",
    color: "#6B69D6",
    keywords: [
      "policy",
      "blueprint",
      "resource lock",
      "tags",
      "compliance",
      "governance",
      "management group",
    ],
  },
  {
    key: "pricing_sla",
    displayName: "Pricing & SLA",
    color: "#107C10",
    keywords: [
      "pricing",
      "cost",
      "sla",
      "support plan",
      "total cost of ownership",
      "tco",
      "calculator",
    ],
  },
  {
    key: "version_control",
    displayName: "Version Control & Git",
    color: "#181717",
    keywords: ["git commit", "git remote", "branch", "merge", "clone", "repository", "commit"],
  },
  {
    key: "pull_requests",
    displayName: "Pull Requests",
    color: "#2DA44E",
    keywords: ["pull request", "merge conflict", "review", "github flow"],
  },
  {
    key: "administration",
    displayName: "Administration",
    color: "#57606A",
    keywords: ["organization", "enterprise", "billing", "permissions", "roles", "template"],
  },
  {
    key: "security",
    displayName: "Security",
    color: "#CF222E",
    keywords: ["dependabot", "secret scanning", "code scanning", "vulnerability", "advisory"],
  },
  {
    key: "collaboration",
    displayName: "Collaboration",
    color: "#8250DF",
    keywords: ["discussion", "notification", "star", "follow", "profile", "achievements"],
  },
  {
    key: "codespaces",
    displayName: "Codespaces",
    color: "#0969DA",
    keywords: ["codespace", "devcontainer", "dotfiles"],
  },
  {
    key: "issues",
    displayName: "Issues",
    color: "#BF3989",
    keywords: ["issue", "label", "milestone", "assignee"],
  },
  {
    key: "projects",
    displayName: "Projects",
    color: "#9A6700",
    keywords: ["github projects", "roadmap", "board", "insight chart"],
  },
  {
    key: "markdown",
    displayName: "Markdown",
    color: "#1F883D",
    keywords: ["markdown", "readme"],
  },
  {
    key: "copilot",
    displayName: "Copilot",
    color: "#6E40C9",
    keywords: ["copilot"],
  },
  {
    key: "gists_wikis",
    displayName: "Gists & Wikis",
    color: "#B35900",
    keywords: ["gist", "wiki"],
  },
  {
    key: "actions",
    displayName: "Actions",
    color: "#218BFF",
    keywords: ["github actions", "workflow", "runner", "ci/cd"],
  },
];

export function assignTopic(text: string, explanation: string): Topic {
  const combined = (text + " " + explanation).toLowerCase();
  for (const topic of TOPICS) {
    if (topic.keywords.some((kw) => combined.includes(kw))) {
      return topic.key;
    }
  }
  return "unknown";
}
