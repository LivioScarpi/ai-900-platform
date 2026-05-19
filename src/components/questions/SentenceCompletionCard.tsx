"use client";

import { useState } from "react";
import { SentenceCompletionQuestion } from "@/types/question";
import { CardShell } from "./CardShell";
import { useAnswerCard } from "@/hooks/useAnswerCard";

interface Props {
  question: SentenceCompletionQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
  hideExplanation?: boolean;
  examMode?: boolean;
  initialAnswer?: string[];
}

export function SentenceCompletionCard({ question, onAnswer, hideExplanation, examMode, initialAnswer }: Props) {
  const [selected, setSelected] = useState(initialAnswer?.[0] ?? "");
  const { confirmed, confirm } = useAnswerCard({ examMode, hasInitial: !!initialAnswer?.[0], onAnswer });

  function handleChange(value: string) {
    if (confirmed) return;
    setSelected(value);
    if (examMode && value) onAnswer(value === question.correctAnswer, [value]);
  }

  const parts = question.sentence.split("[BLANK]");
  const isCorrect = confirmed && selected === question.correctAnswer;
  const isWrong = confirmed && selected !== question.correctAnswer;

  function getSelectStyle(): string {
    if (!confirmed) return "border border-cream-200 bg-white text-ink hover:border-brand/50 focus:border-brand focus:ring-2 focus:ring-brand/15";
    return isCorrect
      ? "border border-status-green bg-status-green-bg text-status-green"
      : "border border-status-red bg-status-red-bg text-status-red";
  }

  return (
    <CardShell
      topic={question.topic}
      badge={{ label: "Complete", className: "bg-amber-50 text-amber-700 border-amber-100" }}
      contextImages={question.contextImages}
      confirmed={confirmed}
      examMode={examMode}
      canConfirm={!!selected}
      onConfirm={() => confirm(selected === question.correctAnswer, [selected])}
      hideExplanation={hideExplanation}
      explanation={question.explanation}
      reference={question.reference}
    >
      <div className={`px-4 py-4 rounded-xl border text-[14px] text-ink leading-relaxed transition-colors ${
        confirmed
          ? isCorrect ? "border-status-green/30 bg-status-green-bg/40" : "border-status-red/30 bg-status-red-bg/40"
          : "border-cream-200 bg-white"
      }`}>
        <span>{parts[0]}</span>
        <select
          value={selected}
          onChange={(e) => handleChange(e.target.value)}
          disabled={confirmed}
          className={`inline-block mx-1.5 px-2.5 py-1 rounded-lg text-[13px] font-medium focus:outline-none transition-colors ${getSelectStyle()}`}
        >
          <option value="">Select…</option>
          {question.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span>{parts[1]}</span>
      </div>
      {isWrong && (
        <p className="font-mono text-[11px] text-status-green font-semibold">
          Correct answer: {question.correctAnswer}
        </p>
      )}
    </CardShell>
  );
}
