"use client";

import { useState } from "react";
import { MultiQuestion } from "@/types/question";
import { ExplanationDrawer } from "@/components/ExplanationDrawer";
import { ContextImage } from "@/components/ContextImage";
import { TopicBadge } from "@/components/TopicBadge";

interface Props {
  question: MultiQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
}

export function MultiCard({ question, onAnswer }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState(false);

  function toggle(letter: string) {
    if (confirmed) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(letter) ? next.delete(letter) : next.add(letter);
      return next;
    });
  }

  function confirm() {
    if (selected.size === 0) return;
    setConfirmed(true);
    const correct = question.correctAnswers;
    const selectedArr = Array.from(selected).sort();
    const isCorrect =
      selectedArr.length === correct.length &&
      selectedArr.every((l) => correct.includes(l));
    onAnswer(isCorrect, selectedArr);
  }

  function optionClass(letter: string) {
    if (!confirmed) {
      return selected.has(letter)
        ? "border-brand bg-[rgba(0,120,212,0.06)] shadow-[0_0_0_3px_rgba(0,120,212,0.08)]"
        : "border-cream-200 bg-white hover:border-brand/40 hover:bg-[rgba(0,120,212,0.03)] cursor-pointer";
    }
    if (question.correctAnswers.includes(letter))
      return "border-status-green bg-status-green-bg";
    if (selected.has(letter))
      return "border-status-red bg-status-red-bg";
    return "border-cream-200 bg-white opacity-40";
  }

  function letterClass(letter: string) {
    if (!confirmed) {
      return selected.has(letter) ? "text-brand" : "text-ink-faint";
    }
    if (question.correctAnswers.includes(letter)) return "text-status-green";
    if (selected.has(letter)) return "text-status-red";
    return "text-ink-faint";
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 flex-wrap">
        <TopicBadge topic={question.topic} />
        <span className="font-mono text-[10px] font-semibold tracking-[0.14em] px-2 py-0.5 rounded-full bg-[#f3e8ff] text-[#7c3aed] uppercase border border-[#e9d5ff]">
          Multi-select
        </span>
      </div>

      {(question.contextImages ?? []).map((url) => (
        <ContextImage key={url} src={url} />
      ))}

      <p className="text-[15px] font-semibold text-ink leading-relaxed">
        {question.text}
      </p>
      <p className="font-mono text-[11px] text-ink-faint tracking-wide">
        Select {question.correctAnswers.length} answers
      </p>

      <div className="flex flex-col gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.letter}
            onClick={() => toggle(opt.letter)}
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
          disabled={selected.size === 0}
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
