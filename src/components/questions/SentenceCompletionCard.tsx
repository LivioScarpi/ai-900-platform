"use client";

import { useState } from "react";
import { SentenceCompletionQuestion } from "@/types/question";
import { ExplanationDrawer } from "@/components/ExplanationDrawer";
import { ContextImage } from "@/components/ContextImage";
import { TopicBadge } from "@/components/TopicBadge";

interface Props {
  question: SentenceCompletionQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
  hideExplanation?: boolean;
}

export function SentenceCompletionCard({ question, onAnswer, hideExplanation }: Props) {
  const [selected, setSelected] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  function confirm() {
    if (!selected) return;
    setConfirmed(true);
    onAnswer(selected === question.correctAnswer, [selected]);
  }

  const parts = question.sentence.split("[BLANK]");
  const isCorrect = confirmed && selected === question.correctAnswer;
  const isWrong = confirmed && selected !== question.correctAnswer;

  function getSelectStyle(): string {
    if (!confirmed) {
      return "border border-cream-200 bg-white text-ink hover:border-brand/50 focus:border-brand focus:ring-2 focus:ring-brand/15";
    }
    return isCorrect
      ? "border border-status-green bg-status-green-bg text-status-green"
      : "border border-status-red bg-status-red-bg text-status-red";
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <TopicBadge topic={question.topic} />
        <span className="font-mono text-[9px] font-medium tracking-[0.15em] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 uppercase border border-amber-100">
          Complete
        </span>
      </div>

      {(question.contextImages ?? []).map((url) => (
        <ContextImage key={url} src={url} />
      ))}

      {/* Sentence with inline select */}
      <div
        className={`px-4 py-4 rounded-xl border text-[14px] text-ink leading-relaxed transition-colors ${
          confirmed
            ? isCorrect
              ? "border-status-green/30 bg-status-green-bg/40"
              : "border-status-red/30 bg-status-red-bg/40"
            : "border-cream-200 bg-white"
        }`}
      >
        <span>{parts[0]}</span>
        <select
          value={selected}
          onChange={(e) => !confirmed && setSelected(e.target.value)}
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

      {!confirmed && (
        <button
          onClick={confirm}
          disabled={!selected}
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
