"use client";

import { useState } from "react";
import { McqQuestion } from "@/types/question";
import { ExplanationDrawer } from "@/components/ExplanationDrawer";
import { ContextImage } from "@/components/ContextImage";
import { TopicBadge } from "@/components/TopicBadge";

interface Props {
  question: McqQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
}

export function McqCard({ question, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function confirm() {
    if (!selected) return;
    setConfirmed(true);
    onAnswer(selected === question.correctAnswer, [selected]);
  }

  function optionClass(letter: string) {
    if (!confirmed) {
      return selected === letter
        ? "border-brand bg-[rgba(0,120,212,0.06)] shadow-[0_0_0_3px_rgba(0,120,212,0.08)]"
        : "border-cream-200 bg-white hover:border-brand/40 hover:bg-[rgba(0,120,212,0.03)] cursor-pointer";
    }
    if (letter === question.correctAnswer)
      return "border-status-green bg-status-green-bg";
    if (letter === selected)
      return "border-status-red bg-status-red-bg";
    return "border-cream-200 bg-white opacity-40";
  }

  function letterClass(letter: string) {
    if (!confirmed) {
      return selected === letter ? "text-brand" : "text-ink-faint";
    }
    if (letter === question.correctAnswer) return "text-status-green";
    if (letter === selected) return "text-status-red";
    return "text-ink-faint";
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 flex-wrap">
        <TopicBadge topic={question.topic} />
        <span className="font-mono text-[10px] font-semibold tracking-[0.14em] px-2 py-0.5 rounded-full bg-cream-100 text-ink-muted uppercase border border-cream-200">
          MCQ
        </span>
      </div>

      {(question.contextImages ?? []).map((url) => (
        <ContextImage key={url} src={url} />
      ))}

      <p className="text-[15px] font-semibold text-ink leading-relaxed">
        {question.text}
      </p>

      <div className="flex flex-col gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.letter}
            onClick={() => !confirmed && setSelected(opt.letter)}
            className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${optionClass(opt.letter)}`}
          >
            <span className={`font-mono text-[11px] font-semibold shrink-0 w-5 mt-0.5 ${letterClass(opt.letter)}`}>
              {opt.letter}
            </span>
            <span className="text-[13.5px] text-ink leading-snug">
              {opt.text}
            </span>
          </button>
        ))}
      </div>

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
