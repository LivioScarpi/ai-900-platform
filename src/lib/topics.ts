import { Topic } from "@/types/question";

export interface TopicInfo {
  key: Topic;
  displayName: string;
  keywords: string[];
}

export const TOPICS: TopicInfo[] = [
  {
    key: "responsible_ai",
    displayName: "Responsible AI",
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
    keywords: ["bot", "qna maker", "luis", "conversational", "intent"],
  },
  {
    key: "azure_cognitive",
    displayName: "Azure Cognitive Services",
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
