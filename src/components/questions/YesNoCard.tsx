"use client";

import { useState } from "react";
import { YesNoQuestion } from "@/types/question";
import { ExplanationDrawer } from "@/components/ExplanationDrawer";
import { ContextImage } from "@/components/ContextImage";
import { TopicBadge } from "@/components/TopicBadge";

interface Props {
  question: YesNoQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
  hideExplanation?: boolean;
}

export function YesNoCard({ question, onAnswer, hideExplanation }: Props) {
  const [answers, setAnswers] = useState<(string | null)[]>(
    question.statements.map(() => null)
  );
  const [confirmed, setConfirmed] = useState(false);

  function setAnswer(index: number, value: "Yes" | "No") {
    if (confirmed) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function confirm() {
    if (answers.some((a) => a === null)) return;
    setConfirmed(true);
    const isCorrect = question.statements.every((s, i) => answers[i] === s.correct);
    onAnswer(isCorrect, answers as string[]);
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

  return (
    <div className="flex flex-col gap-5">
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <TopicBadge topic={question.topic} />
        <span className="font-mono text-[9px] font-medium tracking-[0.15em] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 uppercase border border-sky-100">
          Yes / No
        </span>
      </div>

      {(question.contextImages ?? []).map((url) => (
        <ContextImage key={url} src={url} />
      ))}

      {question.text && (
        <p className="text-[15px] font-semibold text-ink leading-relaxed tracking-[-0.01em]">
          {question.text}
        </p>
      )}

      {/* Statements table */}
      <div className="rounded-xl border border-cream-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-0 border-b border-cream-200 bg-cream-50">
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

        {/* Rows */}
        {question.statements.map((stmt, i) => (
          <div
            key={i}
            className={`grid grid-cols-[1fr_auto_auto] gap-0 border-t border-cream-200 ${
              confirmed
                ? answers[i] === stmt.correct
                  ? "bg-status-green-bg/40"
                  : "bg-status-red-bg/40"
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

      {!confirmed && (
        <button
          onClick={confirm}
          disabled={!allAnswered}
          className="w-full py-3 rounded-xl bg-brand text-white font-semibold text-sm disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 hover:bg-brand-dark tracking-wide"
        >
          Confirm Answer
        </button>
      )}

      {confirmed && !hideExplanation && (
        <ExplanationDrawer explanation={question.explanation} reference={question.reference} />
      )}
    </div>
  );
}
