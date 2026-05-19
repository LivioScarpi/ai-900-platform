"use client";

import { useState } from "react";
import { YesNoQuestion } from "@/types/question";
import { CardShell } from "./CardShell";
import { useAnswerCard } from "@/hooks/useAnswerCard";

interface Props {
  question: YesNoQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
  hideExplanation?: boolean;
  examMode?: boolean;
  initialAnswer?: string[];
}

export function YesNoCard({ question, onAnswer, hideExplanation, examMode, initialAnswer }: Props) {
  const hasInitial = !!(initialAnswer?.length && initialAnswer.every(Boolean));
  const [answers, setAnswers] = useState<(string | null)[]>(
    initialAnswer?.length
      ? question.statements.map((_, i) => initialAnswer[i] || null)
      : question.statements.map(() => null)
  );
  const { confirmed, confirm } = useAnswerCard({ examMode, hasInitial, onAnswer });

  function setAnswer(index: number, value: "Yes" | "No") {
    if (confirmed) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      if (examMode) {
        const isCorrect = question.statements.every((s, i) => next[i] === s.correct);
        onAnswer(isCorrect, next.map((a) => a ?? ""));
      }
      return next;
    });
  }

  function getBtnStyle(index: number, value: "Yes" | "No"): string {
    const chosen = answers[index] === value;
    if (!confirmed) {
      return chosen
        ? "bg-brand text-white shadow-[0_0_0_3px_rgba(0,102,204,0.15)]"
        : "bg-cream-100 text-ink-muted border border-cream-200 hover:border-brand/40 hover:bg-[rgba(0,102,204,0.04)]";
    }
    const isCorrectValue = question.statements[index].correct === value;
    if (isCorrectValue && chosen) return "bg-status-green text-white";
    if (isCorrectValue && !chosen) return "bg-status-green-bg text-status-green border border-status-green/30";
    if (!isCorrectValue && chosen) return "bg-status-red text-white";
    return "bg-cream-100 text-ink-faint opacity-35 border border-cream-200";
  }

  const allAnswered = answers.every((a) => a !== null);
  const isCorrect = question.statements.every((s, i) => answers[i] === s.correct);

  return (
    <CardShell
      topic={question.topic}
      badge={{ label: "Yes / No", className: "bg-sky-50 text-sky-700 border-sky-100" }}
      contextImages={question.contextImages}
      text={question.text}
      confirmed={confirmed}
      examMode={examMode}
      canConfirm={allAnswered}
      onConfirm={() => confirm(isCorrect, answers as string[])}
      hideExplanation={hideExplanation}
      explanation={question.explanation}
      reference={question.reference}
    >
      <div className="rounded-xl border border-cream-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] border-b border-cream-200 bg-cream-50">
          <div className="px-4 py-2.5">
            <span className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em]">Statement</span>
          </div>
          <div className="px-5 py-2.5 text-center">
            <span className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em]">Yes</span>
          </div>
          <div className="px-5 py-2.5 text-center">
            <span className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em]">No</span>
          </div>
        </div>
        {question.statements.map((stmt, i) => (
          <div
            key={i}
            className={`grid grid-cols-[1fr_auto_auto] border-t border-cream-200 ${
              confirmed
                ? answers[i] === stmt.correct ? "bg-status-green-bg/40" : "bg-status-red-bg/40"
                : ""
            }`}
          >
            <div className="px-4 py-3.5">
              <span className="text-[13.5px] text-ink leading-snug">{stmt.text}</span>
            </div>
            {(["Yes", "No"] as const).map((val) => (
              <div key={val} className="px-4 py-3 flex items-center justify-center">
                <button
                  onClick={() => setAnswer(i, val)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-all duration-150 min-w-[48px] ${getBtnStyle(i, val)}`}
                >
                  {val}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </CardShell>
  );
}
