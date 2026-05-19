"use client";

import { useState } from "react";
import { DropdownQuestion } from "@/types/question";
import { CardShell } from "./CardShell";
import { useAnswerCard } from "@/hooks/useAnswerCard";

interface Props {
  question: DropdownQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
  hideExplanation?: boolean;
  examMode?: boolean;
  initialAnswer?: string[];
}

export function DropdownCard({ question, onAnswer, hideExplanation, examMode, initialAnswer }: Props) {
  const hasInitial = !!(initialAnswer?.length && initialAnswer.every(Boolean));
  const [answers, setAnswers] = useState<string[]>(
    initialAnswer?.length
      ? question.statements.map((_, i) => initialAnswer[i] ?? "")
      : question.statements.map(() => "")
  );
  const { confirmed, confirm } = useAnswerCard({ examMode, hasInitial, onAnswer });

  function setAnswer(index: number, value: string) {
    if (confirmed) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      if (examMode) {
        const isCorrect = question.statements.every((s, i) => next[i] === s.correctAnswer);
        onAnswer(isCorrect, next);
      }
      return next;
    });
  }

  function getSelectStyle(index: number): string {
    if (!confirmed) return "border border-cream-200 bg-white text-ink hover:border-brand/50 focus:border-brand focus:ring-2 focus:ring-brand/15";
    return answers[index] === question.statements[index].correctAnswer
      ? "border border-status-green bg-status-green-bg text-status-green"
      : "border border-status-red bg-status-red-bg text-status-red";
  }

  const allAnswered = answers.every(Boolean);
  const isCorrect = question.statements.every((s, i) => answers[i] === s.correctAnswer);

  return (
    <CardShell
      topic={question.topic}
      badge={{ label: "Dropdown", className: "bg-amber-50 text-amber-700 border-amber-100" }}
      contextImages={question.contextImages}
      text={question.text}
      confirmed={confirmed}
      examMode={examMode}
      canConfirm={allAnswered}
      onConfirm={() => confirm(isCorrect, answers)}
      hideExplanation={hideExplanation}
      explanation={question.explanation}
      reference={question.reference}
    >
      <div className="flex flex-col gap-2">
        {question.statements.map((stmt, i) => {
          const parts = stmt.text.split("[BLANK]");
          const isWrong = confirmed && answers[i] !== stmt.correctAnswer;
          return (
            <div
              key={i}
              className={`px-4 py-4 rounded-xl border text-[13.5px] text-ink leading-relaxed transition-colors ${
                confirmed
                  ? answers[i] === stmt.correctAnswer ? "border-status-green/30 bg-status-green-bg/40" : "border-status-red/30 bg-status-red-bg/40"
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
                <span className="ml-2 font-mono text-[11px] text-status-green font-semibold">→ {stmt.correctAnswer}</span>
              )}
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}
