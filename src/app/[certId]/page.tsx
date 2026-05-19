import Link from "next/link";
import type { CSSProperties } from "react";
import { getCertConfig } from "@/lib/certifications";
import { getCertQuestions, getCertMicrosoftQuestions } from "@/lib/questions";
import { notFound } from "next/navigation";

export default async function CertOverviewPage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const { certId } = await params;
  const config = getCertConfig(certId);
  if (!config) notFound();

  const total = getCertQuestions(certId).length;
  const msTotal = getCertMicrosoftQuestions(certId).length;

  const modes = [
    {
      href: `/${certId}/study/sequential`,
      num: "01",
      label: "Sequential Review",
      sub: "Work through all questions one by one, in order. The most complete way to build a solid foundation before any timed attempt.",
      stat: String(total),
      statLabel: "questions",
      cta: "Start studying",
      color: "#0066CC",
    },
    {
      href: `/${certId}/study/random`,
      num: "02",
      label: "Random Shuffle",
      sub: "Same thorough coverage as sequential, but a fresh random order every session. Keeps recall sharp and avoids pattern memorisation.",
      stat: String(total),
      statLabel: "shuffled",
      cta: "Shuffle & start",
      color: "#7C3AED",
    },
    ...(config.hasMicrosoftQuestions ? [{
      href: `/${certId}/study/microsoft`,
      num: "03",
      label: "Microsoft Simulation",
      sub: "Questions from official Microsoft practice tests. Dedicated pool, random order. Ideal for candidates using the Microsoft learning portal.",
      stat: String(msTotal),
      statLabel: "official q.",
      cta: "Start",
      color: "#0284C7",
    }] : []),
    {
      href: `/${certId}/exam`,
      num: config.hasMicrosoftQuestions ? "04" : "03",
      label: "Exam Simulator",
      sub: `${config.examQuestions} random questions, ${config.examDurationMin} minutes on the clock. Mirrors the real ${config.name} exam experience. Pass mark is ${config.passmarkPct}%.`,
      stat: `${config.examDurationMin}′`,
      statLabel: "time limit",
      cta: "Start exam",
      color: "#C62020",
    },
    {
      href: `/${certId}/dashboard`,
      num: config.hasMicrosoftQuestions ? "05" : "04",
      label: "Performance Dashboard",
      sub: "Track accuracy over time, review past exam sessions, and identify which topics need the most attention.",
      stat: "→",
      statLabel: "your stats",
      cta: "View",
      color: "#1E7D4E",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-7 md:px-12 lg:px-16 pt-10 md:pt-12 pb-8 border-b border-cream-200">
        <h1 className="font-display font-extrabold tracking-[-0.035em] leading-[0.95] text-ink">
          <span className="block text-[42px] md:text-[52px]">{config.name}</span>
          <span className="block text-[42px] md:text-[52px] text-ink-faint">{config.fullName}</span>
        </h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{total} questions</span>
          <span className="font-mono text-[10px] text-ink-faint opacity-40">·</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Pass mark {config.passmarkPct}%</span>
          <span className="font-mono text-[10px] text-ink-faint opacity-40">·</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{config.examDurationMin} min exam</span>
          <span className="font-mono text-[10px] text-ink-faint opacity-40">·</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{config.provider}</span>
        </div>
      </div>

      <div className="flex flex-col">
        {modes.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className="group flex items-center gap-5 px-7 md:px-12 lg:px-16 py-6 border-b border-cream-200 hover:bg-white transition-colors duration-150"
            style={{ "--mode-color": mode.color } as CSSProperties}
          >
            {/* Badge */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: mode.color }}
            >
              <span className="font-mono text-[10px] font-semibold text-white leading-none">{mode.num}</span>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-[18px] md:text-[20px] font-bold text-ink tracking-[-0.02em] leading-tight transition-colors duration-150 group-hover:text-[var(--mode-color)]">
                {mode.label}
              </h2>
              <p className="text-[13px] text-ink-faint leading-relaxed mt-1 max-w-lg">{mode.sub}</p>
            </div>

            {/* Stat + arrow */}
            <div className="hidden sm:flex items-baseline gap-3 shrink-0">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-[20px] font-extrabold tnum leading-none" style={{ color: mode.color }}>
                  {mode.stat}
                </span>
                <span className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.1em]">{mode.statLabel}</span>
              </div>
              <span className="font-mono text-[13px] transition-transform duration-150 group-hover:translate-x-1 inline-block" style={{ color: mode.color }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
