import { Topic } from "@/types/question";

const TOPIC_COLORS: Record<Topic, string> = {
  responsible_ai:    "bg-blue-50 text-blue-700 border-blue-100",
  ml_fundamentals:   "bg-indigo-50 text-indigo-700 border-indigo-100",
  computer_vision:   "bg-purple-50 text-purple-700 border-purple-100",
  nlp:               "bg-sky-50 text-sky-700 border-sky-100",
  conversational_ai: "bg-amber-50 text-amber-700 border-amber-100",
  azure_cognitive:   "bg-violet-50 text-violet-700 border-violet-100",
  azure_ml:          "bg-teal-50 text-teal-700 border-teal-100",
  unknown:           "bg-cream-100 text-ink-muted border-cream-200",
};

const TOPIC_LABELS: Record<Topic, string> = {
  responsible_ai:    "Responsible AI",
  ml_fundamentals:   "ML Fundamentals",
  computer_vision:   "Computer Vision",
  nlp:               "NLP",
  conversational_ai: "Conversational AI",
  azure_cognitive:   "Azure Cognitive",
  azure_ml:          "Azure ML",
  unknown:           "General",
};

export function TopicBadge({ topic }: { topic: Topic }) {
  return (
    <span className={`font-mono text-[9px] font-medium tracking-[0.15em] px-2 py-0.5 rounded-full uppercase border ${TOPIC_COLORS[topic]}`}>
      {TOPIC_LABELS[topic]}
    </span>
  );
}
