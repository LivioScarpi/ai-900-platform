"use client";

import { useState } from "react";
import { DropdownQuestion } from "@/types/question";
import { ExplanationDrawer } from "@/components/ExplanationDrawer";
import { ContextImage } from "@/components/ContextImage";
import { TopicBadge } from "@/components/TopicBadge";

interface Props {
  question: DropdownQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
}

export function DropdownCard({ question, onAnswer }: Props) {
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
    const isCorrect = question.statements.every(
      (s, i) => answers[i] === s.correctAnswer
    );
    onAnswer(isCorrect, answers);
  }

  function selectClass(index: number) {
    if (!confirmed) return "border-brand/40 bg-white focus:border-brand";
    return answers[index] === question.statements[index].correctAnswer
      ? "border-status-green bg-status-green-bg"
      : "border-status-red bg-status-red-bg";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <TopicBadge topic={question.topic} />
        <span className="font-mono text-[10px] font-semibold tracking-[0.14em] px-2 py-0.5 rounded-full bg-status-orange-bg text-status-orange uppercase border border-amber-200">
          Dropdown
        </span>
      </div>

      {(question.contextImages ?? []).map((url) => (
        <ContextImage key={url} src={url} />
      ))}

      {question.text && (
        <p className="text-[15px] font-semibold text-ink leading-relaxed">
          {question.text}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {question.statements.map((stmt, i) => {
          const parts = stmt.text.split("[BLANK]");
          return (
            <div
              key={i}
              className="p-4 rounded-xl border border-cream-200 bg-white text-[13.5px] text-ink leading-relaxed"
            >
              {parts[0]}
              <select
                value={answers[i]}
                onChange={(e) => setAnswer(i, e.target.value)}
                disabled={confirmed}
                className={`inline-block mx-1 px-2 py-1 rounded border-2 text-sm font-semibold bg-white text-ink focus:outline-none transition-colors ${selectClass(i)}`}
              >
                <option value="">Select...</option>
                {stmt.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {parts[1]}
              {confirmed && answers[i] !== stmt.correctAnswer && (
                <span className="ml-2 text-xs text-status-green font-semibold">
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
          disabled={answers.some((a) => !a)}
          className="mt-1 w-full py-3 rounded-xl bg-brand text-white font-semibold text-sm disabled:opacity-40 hover:bg-brand-dark transition-colors tracking-wide"
        >
          Confirm Answer
        </button>
      )}

      {confirmed && (
        <ExplanationDrawer
          explanation={question.explanation}
          reference={question.reference}
        />
      )}
    </div>
  );
}
