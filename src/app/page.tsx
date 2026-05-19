import Link from "next/link";
import type { CSSProperties } from "react";
import { getAllQuestions, getMicrosoftQuestions } from "@/lib/questions";

function getModes(totalQuestions: number) {
  return [
    {
      href: "/study/sequential",
      num: "01",
      label: "Sequential Review",
      sub: "Work through all questions one by one, in order. The most complete way to build a solid foundation before any timed attempt.",
      stat: String(totalQuestions),
      statLabel: "questions",
      cta: "Start studying",
      color: "#0066CC",
      tag: "Study",
    },
    {
      href: "/study/random",
      num: "02",
      label: "Random Shuffle",
      sub: "Same thorough coverage as sequential, but a fresh random order every session. Keeps recall sharp and avoids pattern memorisation.",
      stat: String(totalQuestions),
      statLabel: "shuffled",
      cta: "Shuffle & start",
      color: "#7C3AED",
      tag: "Study",
    },
    {
      href: "/study/microsoft",
      num: "03",
      label: "Microsoft Simulation",
      sub: "Domande tratte dalle simulazioni ufficiali Microsoft. Pool dedicato, ordine casuale. Ideali per chi si prepara sul sito Microsoft.",
      stat: String(getMicrosoftQuestions().length),
      statLabel: "official q.",
      cta: "Start",
      color: "#0284C7",
      tag: "Study",
    },
    {
      href: "/exam",
      num: "04",
      label: "Exam Simulator",
      sub: "50 random questions, 45 minutes on the clock. Mirrors the real AI-900 exam experience. Pass mark is 700/1000.",
      stat: "45′",
      statLabel: "time limit",
      cta: "Start exam",
      color: "#C62020",
      tag: "Practice",
    },
    {
      href: "/dashboard",
      num: "05",
      label: "Performance Dashboard",
      sub: "Track accuracy over time, review past exam sessions, and identify which topics need the most attention.",
      stat: "→",
      statLabel: "your stats",
      cta: "View",
      color: "#1E7D4E",
      tag: "Track",
    },
  ];
}

export default function HomePage() {
  const total = getAllQuestions().length;
  const modes = getModes(total);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-7 md:px-10 pt-10 md:pt-12 pb-8 border-b border-cream-200">
        <h1 className="font-display font-extrabold tracking-[-0.035em] leading-[0.95] text-ink">
          <span className="block text-[42px] md:text-[52px]">AI-900</span>
          <span className="block text-[42px] md:text-[52px] text-ink-faint">Study Platform</span>
        </h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {total} questions
          </span>
          <span className="font-mono text-[10px] text-ink-faint opacity-40">·</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Pass mark 70%
          </span>
          <span className="font-mono text-[10px] text-ink-faint opacity-40">·</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            45 min exam
          </span>
          <span className="font-mono text-[10px] text-ink-faint opacity-40">·</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            4 study modes
          </span>
        </div>
      </div>

      {/* Mode list */}
      <div className="flex flex-col">
        {modes.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className="group flex items-start gap-5 px-7 md:px-10 py-6 border-b border-cream-200 hover:bg-white transition-colors duration-150"
            style={{ "--mode-color": mode.color } as CSSProperties}
          >
            {/* Number badge */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: mode.color }}
            >
              <span className="font-mono text-[10px] font-semibold text-white leading-none">
                {mode.num}
              </span>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-6">
                <h2 className="font-display text-[18px] md:text-[20px] font-bold text-ink tracking-[-0.02em] leading-tight transition-colors duration-150 group-hover:text-[var(--mode-color)]">
                  {mode.label}
                </h2>

                {/* Stat + arrow — visible on md+ */}
                <div className="hidden sm:flex items-baseline gap-4 shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="font-display text-[20px] font-extrabold tnum leading-none"
                      style={{ color: mode.color }}
                    >
                      {mode.stat}
                    </span>
                    <span className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.1em]">
                      {mode.statLabel}
                    </span>
                  </div>
                  <span
                    className="font-mono text-[13px] transition-transform duration-150 group-hover:translate-x-1 inline-block"
                    style={{ color: mode.color }}
                  >
                    →
                  </span>
                </div>
              </div>

              <p className="text-[13px] text-ink-faint leading-relaxed mt-1.5 max-w-xl">
                {mode.sub}
              </p>

              {/* Stat — visible on mobile only */}
              <div className="flex items-baseline gap-1 mt-2.5 sm:hidden">
                <span
                  className="font-display text-[18px] font-extrabold tnum"
                  style={{ color: mode.color }}
                >
                  {mode.stat}
                </span>
                <span className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.1em]">
                  {mode.statLabel}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
