import { Topic } from "@/types/question";

const TOPIC_COLORS: Record<Topic, string> = {
  responsible_ai: "bg-status-blue-bg text-status-blue border border-blue-200",
  ml_fundamentals: "bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]",
  computer_vision: "bg-[#f3e8ff] text-[#7c3aed] border border-[#e9d5ff]",
  nlp: "bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]",
  conversational_ai: "bg-status-orange-bg text-status-orange border border-amber-200",
  azure_cognitive: "bg-[#eef2ff] text-[#4338ca] border border-[#c7d2fe]",
  azure_ml: "bg-[#f0fdfa] text-[#0f766e] border border-[#99f6e4]",
  unknown: "bg-cream-100 text-ink-muted border border-cream-200",
};

const TOPIC_LABELS: Record<Topic, string> = {
  responsible_ai: "Responsible AI",
  ml_fundamentals: "ML Fundamentals",
  computer_vision: "Computer Vision",
  nlp: "NLP",
  conversational_ai: "Conversational AI",
  azure_cognitive: "Azure Cognitive",
  azure_ml: "Azure ML",
  unknown: "General",
};

export function TopicBadge({ topic }: { topic: Topic }) {
  return (
    <span
      className={`font-mono text-[10px] font-semibold tracking-[0.14em] px-2 py-0.5 rounded-full uppercase ${TOPIC_COLORS[topic]}`}
    >
      {TOPIC_LABELS[topic]}
    </span>
  );
}
