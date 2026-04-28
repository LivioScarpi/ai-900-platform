import Link from "next/link";
import { getAllQuestions } from "@/lib/questions";

// ── Illustrations ──────────────────────────────────────────────────────────

function IllustrationStudy() {
  return (
    <svg viewBox="0 0 96 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Book cover */}
      <rect x="14" y="12" width="40" height="54" rx="4" fill="#1e3a5f" />
      <rect x="14" y="12" width="6" height="54" rx="2" fill="#0078D4" />
      {/* Pages */}
      <rect x="20" y="18" width="28" height="3" rx="1.5" fill="#60a5fa" opacity="0.7" />
      <rect x="20" y="26" width="24" height="3" rx="1.5" fill="#60a5fa" opacity="0.5" />
      <rect x="20" y="34" width="26" height="3" rx="1.5" fill="#60a5fa" opacity="0.5" />
      <rect x="20" y="42" width="20" height="3" rx="1.5" fill="#60a5fa" opacity="0.4" />
      <rect x="20" y="50" width="22" height="3" rx="1.5" fill="#60a5fa" opacity="0.4" />
      {/* Checkmark badge */}
      <circle cx="70" cy="28" r="18" fill="#0078D4" />
      <path d="M61 28l6 7 12-14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sparkle */}
      <circle cx="76" cy="58" r="3" fill="#60a5fa" opacity="0.6" />
      <circle cx="84" cy="48" r="2" fill="#93c5fd" opacity="0.5" />
    </svg>
  );
}

function IllustrationExam() {
  return (
    <svg viewBox="0 0 96 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Clock face */}
      <circle cx="48" cy="42" r="32" fill="#1e1a2e" />
      <circle cx="48" cy="42" r="32" stroke="#7c3aed" strokeWidth="2.5" />
      {/* Tick marks */}
      <line x1="48" y1="13" x2="48" y2="18" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="48" y1="66" x2="48" y2="71" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="17" y1="42" x2="22" y2="42" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="74" y1="42" x2="79" y2="42" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Minute hand */}
      <line x1="48" y1="42" x2="48" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Hour hand — pointing to ~10 */}
      <line x1="48" y1="42" x2="34" y2="30" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
      {/* Center dot */}
      <circle cx="48" cy="42" r="3.5" fill="#ef4444" />
      {/* 70% arc highlight */}
      <path d="M48 10 A32 32 0 0 1 75.7 58" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" opacity="0.6"/>
    </svg>
  );
}

function IllustrationFlashcards() {
  return (
    <svg viewBox="0 0 96 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Card 3 (back) */}
      <rect x="26" y="22" width="52" height="36" rx="6" fill="#431407" transform="rotate(-6 26 22)" />
      {/* Card 2 (middle) */}
      <rect x="22" y="20" width="52" height="36" rx="6" fill="#7c2d12" transform="rotate(-2 22 20)" />
      {/* Card 1 (front) */}
      <rect x="18" y="18" width="52" height="36" rx="6" fill="#f97316" />
      {/* Front card content */}
      <rect x="26" y="26" width="32" height="3" rx="1.5" fill="white" opacity="0.9" />
      <rect x="26" y="33" width="24" height="3" rx="1.5" fill="white" opacity="0.6" />
      <rect x="26" y="40" width="28" height="3" rx="1.5" fill="white" opacity="0.5" />
      {/* Question mark */}
      <circle cx="72" cy="26" r="14" fill="#f97316" />
      <text x="72" y="31" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">?</text>
    </svg>
  );
}

function IllustrationRandom() {
  return (
    <svg viewBox="0 0 96 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background */}
      <rect x="8" y="8" width="80" height="64" rx="10" fill="#1e1a2e" />
      {/* Shuffle arrows */}
      <polyline points="36 28 48 28 48 36" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="24" y1="48" x2="48" y2="28" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
      <polyline points="60 44 48 44 48 52" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="72" y1="28" x2="48" y2="44" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Dots */}
      <circle cx="24" cy="48" r="4" fill="#7c3aed"/>
      <circle cx="72" cy="28" r="4" fill="#7c3aed"/>
      <circle cx="48" cy="64" r="3" fill="#a78bfa" opacity="0.5"/>
      <circle cx="80" cy="60" r="2.5" fill="#c4b5fd" opacity="0.4"/>
      <circle cx="16" cy="22" r="2" fill="#c4b5fd" opacity="0.4"/>
    </svg>
  );
}

function IllustrationDashboard() {
  return (
    <svg viewBox="0 0 96 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background panel */}
      <rect x="8" y="8" width="80" height="64" rx="8" fill="#0f172a" />
      {/* Grid lines */}
      <line x1="8" y1="55" x2="88" y2="55" stroke="#1e293b" strokeWidth="1"/>
      <line x1="8" y1="40" x2="88" y2="40" stroke="#1e293b" strokeWidth="1"/>
      <line x1="8" y1="25" x2="88" y2="25" stroke="#1e293b" strokeWidth="1"/>
      {/* Bars */}
      <rect x="18" y="45" width="10" height="18" rx="3" fill="#334155" />
      <rect x="33" y="32" width="10" height="31" rx="3" fill="#0078D4" opacity="0.7" />
      <rect x="48" y="20" width="10" height="43" rx="3" fill="#0078D4" />
      <rect x="63" y="28" width="10" height="35" rx="3" fill="#0078D4" opacity="0.8" />
      {/* Trend line */}
      <polyline points="23,52 38,38 53,24 68,32" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="23" cy="52" r="3" fill="#60a5fa"/>
      <circle cx="38" cy="38" r="3" fill="#60a5fa"/>
      <circle cx="53" cy="24" r="3.5" fill="white"/>
      <circle cx="68" cy="32" r="3" fill="#60a5fa"/>
    </svg>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────

function getModes(totalQuestions: number) {
  return [
  {
    href: "/study/sequential",
    badge: "STUDY",
    badgeColor: "bg-status-blue-bg text-status-blue border border-blue-200",
    label: "Sequential Review",
    sub: "Work through all 132 questions one by one, in order. The best way to build a solid foundation before attempting a timed exam.",
    stat: String(totalQuestions),
    statColor: "text-brand",
    statLabel: "questions",
    accent: "from-brand/[0.07] to-transparent",
    accentBar: "bg-brand",
    cta: "Start studying",
    color: "#0078D4",
    illustration: <IllustrationStudy />,
  },
  {
    href: "/study/random",
    badge: "RANDOM",
    badgeColor: "bg-purple-100 text-purple-700 border border-purple-200",
    label: "Random Sequential",
    sub: "All questions shuffled into a random order decided at the start of the session. Same thorough coverage as sequential, but in a different sequence every time.",
    stat: String(totalQuestions),
    statColor: "text-purple-600",
    statLabel: "questions shuffled",
    accent: "from-purple-500/[0.07] to-transparent",
    accentBar: "bg-purple-500",
    cta: "Shuffle & start",
    color: "#7c3aed",
    illustration: <IllustrationRandom />,
  },
  {
    href: "/exam",
    badge: "TIMED",
    badgeColor: "bg-status-red-bg text-status-red border border-red-200",
    label: "Exam Simulator",
    sub: "50 randomly selected questions, 45 minutes on the clock. Mirrors the real AI-900 experience. Pass mark is 70%.",
    stat: "45'",
    statColor: "text-status-red",
    statLabel: "time limit",
    accent: "from-status-red/[0.06] to-transparent",
    accentBar: "bg-status-red",
    cta: "Start exam",
    color: "#ef4444",
    illustration: <IllustrationExam />,
  },
  {
    href: "/flashcards",
    badge: "RECALL",
    badgeColor: "bg-status-orange-bg text-status-orange border border-amber-200",
    label: "Flashcard Mode",
    sub: "Flip through concept cards and self-rate your knowledge. Ideal for spaced repetition and reinforcing weak areas.",
    stat: "∞",
    statColor: "text-status-orange",
    statLabel: "decks available",
    accent: "from-status-orange/[0.06] to-transparent",
    accentBar: "bg-status-orange",
    cta: "Start flipping",
    color: "#f97316",
    illustration: <IllustrationFlashcards />,
  },
  {
    href: "/dashboard",
    badge: "STATS",
    badgeColor: "bg-green-100 text-green-700 border border-green-200",
    label: "Dashboard",
    sub: "Track your accuracy over time, review past exam sessions, and spot topics that need more attention.",
    stat: "→",
    statColor: "text-green-600",
    statLabel: "view your stats",
    accent: "from-green-500/[0.06] to-transparent",
    accentBar: "bg-green-500",
    cta: "View dashboard",
    color: "#16a34a",
    illustration: <IllustrationDashboard />,
  },
  ];
}

export default function HomePage() {
  const MODES = getModes(getAllQuestions().length);
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-5 md:px-8 pt-6 md:pt-8 pb-4 md:pb-5 border-b border-cream-200 flex-shrink-0">
        <p className="label-caps text-ink-faint mb-1">Home</p>
        <div className="flex items-end justify-between">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">
            Study Modes
          </h1>
          <p className="font-mono text-[11px] text-ink-faint hidden sm:block">
            AI-900 · Azure AI Fundamentals
          </p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        {MODES.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className="group relative bg-card rounded-2xl border border-cream-200 overflow-hidden hover:-translate-y-0.5 transition-all duration-200"
            style={{ boxShadow: "var(--shadow-sm)", "--card-color": mode.color } as React.CSSProperties}
          >
            {/* Top accent bar */}
            <span className={`absolute top-0 left-0 right-0 h-[2px] ${mode.accentBar} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

            <div className="relative flex flex-col p-5 md:p-6 gap-4">
              {/* Top row: text + illustration */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                  <span className={`font-mono text-[10px] font-semibold tracking-[0.14em] px-2 py-0.5 rounded-full uppercase w-fit ${mode.badgeColor}`}>
                    {mode.badge}
                  </span>
                  <h2 className="font-display text-xl font-semibold text-ink group-hover:text-[var(--card-color)] transition-colors leading-tight">
                    {mode.label}
                  </h2>
                </div>

                {/* Illustration */}
                <div className="w-20 h-16 flex-shrink-0 transition-transform group-hover:scale-105 duration-200">
                  {mode.illustration}
                </div>
              </div>

              {/* Description */}
              <p className="text-[13px] md:text-[13.5px] text-ink-muted leading-relaxed">
                {mode.sub}
              </p>

              {/* Bottom row */}
              <div className="flex items-center justify-between border-t border-cream-200 pt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className={`font-display text-2xl font-bold tnum ${mode.statColor}`}>
                    {mode.stat}
                  </span>
                  <span className="font-mono text-[11px] text-ink-muted tracking-wide">
                    {mode.statLabel}
                  </span>
                </div>
                <span className="font-mono text-[12px] text-[var(--card-color)] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {mode.cta} →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}



