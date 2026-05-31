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
