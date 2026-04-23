"use client";

import { useState } from "react";
import { SentenceCompletionQuestion } from "@/types/question";
import { ExplanationDrawer } from "@/components/ExplanationDrawer";
import { ContextImage } from "@/components/ContextImage";
import { TopicBadge } from "@/components/TopicBadge";

interface Props {
  question: SentenceCompletionQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
}

export function SentenceCompletionCard({ question, onAnswer }: Props) {
  const [selected, setSelected] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  function confirm() {
    if (!selected) return;
    setConfirmed(true);
    onAnswer(selected === question.correctAnswer, [selected]);
  }

  const parts = question.sentence.split("[BLANK]");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <TopicBadge topic={question.topic} />
        <span className="font-mono text-[10px] font-semibold tracking-[0.14em] px-2 py-0.5 rounded-full bg-status-orange-bg text-status-orange uppercase border border-amber-200">
          Sentence Completion
        </span>
      </div>

      {(question.contextImages ?? []).map((url) => (
        <ContextImage key={url} src={url} />
      ))}

      <p className="text-[15px] font-semibold text-ink leading-relaxed">
        {parts[0]}
        <select
          value={selected}
          onChange={(e) => !confirmed && setSelected(e.target.value)}
          disabled={confirmed}
          className={`inline-block mx-1 px-2 py-1 rounded-lg border-2 text-sm font-semibold focus:outline-none transition-all
            ${
              !confirmed
                ? "border-brand/40 bg-white text-ink hover:border-brand"
                : selected === question.correctAnswer
                ? "border-status-green bg-status-green-bg text-status-green"
                : "border-status-red bg-status-red-bg text-status-red"
            }`}
        >
          <option value="">Select...</option>
          {question.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {parts[1]}
      </p>

      {confirmed && selected !== question.correctAnswer && (
        <p className="text-sm text-status-green font-semibold">
          Correct answer: <strong>{question.correctAnswer}</strong>
        </p>
      )}

      {!confirmed && (
        <button
          onClick={confirm}
          disabled={!selected}
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
