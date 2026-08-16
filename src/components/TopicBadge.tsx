import { Topic } from "@/types/question";

const TOPIC_COLORS: Record<Topic, string> = {
  responsible_ai:    "bg-blue-50 text-blue-700 border-blue-100",
  ml_fundamentals:   "bg-indigo-50 text-indigo-700 border-indigo-100",
  computer_vision:   "bg-purple-50 text-purple-700 border-purple-100",
  nlp:               "bg-sky-50 text-sky-700 border-sky-100",
  conversational_ai: "bg-amber-50 text-amber-700 border-amber-100",
  azure_cognitive:   "bg-violet-50 text-violet-700 border-violet-100",
  azure_ml:          "bg-teal-50 text-teal-700 border-teal-100",
  cloud_concepts:    "bg-blue-50 text-blue-700 border-blue-100",
  core_services:     "bg-sky-50 text-sky-700 border-sky-100",
  security_identity: "bg-red-50 text-red-700 border-red-100",
  governance:        "bg-indigo-50 text-indigo-700 border-indigo-100",
  pricing_sla:       "bg-green-50 text-green-700 border-green-100",
  version_control:   "bg-neutral-50 text-neutral-700 border-neutral-200",
  pull_requests:     "bg-emerald-50 text-emerald-700 border-emerald-100",
  administration:    "bg-slate-50 text-slate-700 border-slate-200",
  security:          "bg-red-50 text-red-700 border-red-100",
  collaboration:     "bg-purple-50 text-purple-700 border-purple-100",
  codespaces:        "bg-sky-50 text-sky-700 border-sky-100",
  issues:            "bg-pink-50 text-pink-700 border-pink-100",
  projects:          "bg-amber-50 text-amber-700 border-amber-100",
  markdown:          "bg-green-50 text-green-700 border-green-100",
  copilot:           "bg-violet-50 text-violet-700 border-violet-100",
  gists_wikis:       "bg-orange-50 text-orange-700 border-orange-100",
  actions:           "bg-blue-50 text-blue-700 border-blue-100",
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
  cloud_concepts:    "Cloud Concepts",
  core_services:     "Core Services",
  security_identity: "Security & Identity",
  governance:        "Governance",
  pricing_sla:       "Pricing & SLA",
  version_control:   "Version Control & Git",
  pull_requests:     "Pull Requests",
  administration:    "Administration",
  security:          "Security",
  collaboration:     "Collaboration",
  codespaces:        "Codespaces",
  issues:            "Issues",
  projects:          "Projects",
  markdown:          "Markdown",
  copilot:           "Copilot",
  gists_wikis:       "Gists & Wikis",
  actions:           "Actions",
  unknown:           "General",
};

export function TopicBadge({ topic }: { topic: Topic }) {
  return (
    <span className={`font-mono text-[9px] font-medium tracking-[0.15em] px-2 py-0.5 rounded-full uppercase border ${TOPIC_COLORS[topic]}`}>
      {TOPIC_LABELS[topic]}
    </span>
  );
}
