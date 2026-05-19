"use client";

import { useState } from "react";
import { MultiQuestion } from "@/types/question";
import { CardShell } from "./CardShell";
import { useAnswerCard } from "@/hooks/useAnswerCard";

interface Props {
  question: MultiQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
  hideExplanation?: boolean;
  examMode?: boolean;
  initialAnswer?: string[];
}

function IconCheck() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l6 6M9 3l-6 6" />
    </svg>
  );
}

export function MultiCard({ question, onAnswer, hideExplanation, examMode, initialAnswer }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialAnswer ?? []));
  const { confirmed, confirm } = useAnswerCard({ examMode, hasInitial: !!initialAnswer?.length, onAnswer });

  function toggle(letter: string) {
    if (confirmed) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(letter)) { next.delete(letter); } else { next.add(letter); }
      if (examMode) {
        const arr = Array.from(next).sort();
        const correct = question.correctAnswers;
        onAnswer(arr.length === correct.length && arr.every((l) => correct.includes(l)), arr);
      }
      return next;
    });
  }

  function getOptionStyle(letter: string): string {
    if (!confirmed) {
      return selected.has(letter)
        ? "border-2 border-brand bg-[rgba(0,102,204,0.04)] shadow-[0_0_0_3px_rgba(0,102,204,0.07)] cursor-pointer"
        : "border border-cream-200 bg-white hover:border-brand/40 hover:bg-[rgba(0,102,204,0.025)] cursor-pointer";
    }
    const isCorrect = question.correctAnswers.includes(letter);
    if (isCorrect) return "border-2 border-status-green bg-status-green-bg";
    if (selected.has(letter)) return "border-2 border-status-red bg-status-red-bg";
    return "border border-cream-200 bg-white opacity-30 pointer-events-none";
  }

  function getLetterBadge(letter: string): React.ReactNode {
    const base = "w-[22px] h-[22px] rounded flex items-center justify-center shrink-0 transition-all duration-150";
    if (!confirmed) {
      return selected.has(letter)
        ? <span className={`${base} bg-brand text-white`}><span className="font-mono text-[9px] font-semibold">{letter}</span></span>
        : <span className={`${base} bg-cream-100 text-ink-faint border border-cream-200`}><span className="font-mono text-[9px] font-semibold">{letter}</span></span>;
    }
    if (question.correctAnswers.includes(letter)) return <span className={`${base} bg-status-green text-white`}><IconCheck /></span>;
    if (selected.has(letter)) return <span className={`${base} bg-status-red text-white`}><IconX /></span>;
    return <span className={`${base} bg-cream-100 text-ink-faint border border-cream-200`}><span className="font-mono text-[9px] font-semibold">{letter}</span></span>;
  }

  const selectedArr = Array.from(selected).sort();
  const correct = question.correctAnswers;
  const isCorrect = selectedArr.length === correct.length && selectedArr.every((l) => correct.includes(l));

  return (
    <CardShell
      topic={question.topic}
      badge={{ label: "Multi-select", className: "bg-purple-50 text-purple-700 border-purple-100" }}
      contextImages={question.contextImages}
      text={question.text}
      confirmed={confirmed}
      examMode={examMode}
      canConfirm={selected.size > 0}
      onConfirm={() => confirm(isCorrect, selectedArr)}
      hideExplanation={hideExplanation}
      explanation={question.explanation}
      reference={question.reference}
    >
      <p className="font-mono text-[10px] text-ink-faint">Select {question.correctAnswers.length} answers</p>
      <div className="flex flex-col gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.letter}
            onClick={() => toggle(opt.letter)}
            className={`flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150 ${getOptionStyle(opt.letter)}`}
          >
            {getLetterBadge(opt.letter)}
            <span className="text-[13.5px] text-ink leading-snug mt-0.5">{opt.text}</span>
          </button>
        ))}
      </div>
    </CardShell>
  );
}
