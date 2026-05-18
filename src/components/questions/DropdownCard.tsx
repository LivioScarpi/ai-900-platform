"use client";

import { useState } from "react";
import { DropdownQuestion } from "@/types/question";
import { ExplanationDrawer } from "@/components/ExplanationDrawer";
import { ContextImage } from "@/components/ContextImage";
import { TopicBadge } from "@/components/TopicBadge";

interface Props {
  question: DropdownQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
  hideExplanation?: boolean;
}

export function DropdownCard({ question, onAnswer, hideExplanation }: Props) {
  const [answers, setAnswers] = useState<string[]>(
    question.statements.map(() => "")
  );
  const [confirmed, setConfirmed] = useState(false);

  function setAnswer(index: number, value: string) {
    if (confirmed) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function confirm() {
    if (answers.some((a) => !a)) return;
    setConfirmed(true);
    const isCorrect = question.statements.every((s, i) => answers[i] === s.correctAnswer);
    onAnswer(isCorrect, answers);
  }

  function getSelectStyle(index: number): string {
    if (!confirmed) {
      return "border border-cream-200 bg-white text-ink hover:border-brand/50 focus:border-brand focus:ring-2 focus:ring-brand/15";
    }
    return answers[index] === question.statements[index].correctAnswer
      ? "border border-status-green bg-status-green-bg text-status-green"
      : "border border-status-red bg-status-red-bg text-status-red";
  }

  const allAnswered = answers.every((a) => Boolean(a));

  return (
    <div className="flex flex-col gap-5">
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <TopicBadge topic={question.topic} />
        <span className="font-mono text-[9px] font-medium tracking-[0.15em] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 uppercase border border-amber-100">
          Dropdown
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

      <div className="flex flex-col gap-2">
        {question.statements.map((stmt, i) => {
          const parts = stmt.text.split("[BLANK]");
          const isWrong = confirmed && answers[i] !== stmt.correctAnswer;

          return (
            <div
              key={i}
              className={`px-4 py-4 rounded-xl border text-[13.5px] text-ink leading-relaxed transition-colors ${
                confirmed
                  ? answers[i] === stmt.correctAnswer
                    ? "border-status-green/30 bg-status-green-bg/40"
                    : "border-status-red/30 bg-status-red-bg/40"
                  : "border-cream-200 bg-white"
              }`}
            >
              <span>{parts[0]}</span>
              <select
                value={answers[i]}
                onChange={(e) => setAnswer(i, e.target.value)}
                disabled={confirmed}
                className={`inline-block mx-1.5 px-2.5 py-1 rounded-lg text-[13px] font-medium focus:outline-none transition-colors ${getSelectStyle(i)}`}
              >
                <option value="">Select…</option>
                {stmt.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span>{parts[1]}</span>
              {isWrong && (
                <span className="ml-2 font-mono text-[11px] text-status-green font-semibold">
                  → {stmt.correctAnswer}
                </span>
              )}
            </div>
          );
        })}
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
