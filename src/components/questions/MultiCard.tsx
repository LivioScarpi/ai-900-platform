"use client";

import { useState } from "react";
import { MultiQuestion } from "@/types/question";
import { ExplanationDrawer } from "@/components/ExplanationDrawer";
import { ContextImage } from "@/components/ContextImage";
import { TopicBadge } from "@/components/TopicBadge";

interface Props {
  question: MultiQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
  hideExplanation?: boolean;
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l6 6M9 3l-6 6" />
    </svg>
  );
}

export function MultiCard({ question, onAnswer, hideExplanation }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState(false);

  function toggle(letter: string) {
    if (confirmed) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(letter)) { next.delete(letter); } else { next.add(letter); }
      return next;
    });
  }

  function confirm() {
    if (selected.size === 0) return;
    setConfirmed(true);
    const correct = question.correctAnswers;
    const selectedArr = Array.from(selected).sort();
    const isCorrect = selectedArr.length === correct.length && selectedArr.every((l) => correct.includes(l));
    onAnswer(isCorrect, selectedArr);
  }

  function getOptionStyle(letter: string): string {
    if (!confirmed) {
      if (selected.has(letter)) {
        return "border-2 border-brand bg-[rgba(0,102,204,0.04)] shadow-[0_0_0_3px_rgba(0,102,204,0.07)] cursor-pointer";
      }
      return "border border-cream-200 bg-white hover:border-brand/40 hover:bg-[rgba(0,102,204,0.025)] cursor-pointer";
    }
    const isCorrectOption = question.correctAnswers.includes(letter);
    const wasSelected = selected.has(letter);
    if (isCorrectOption) return "border-2 border-status-green bg-status-green-bg";
    if (wasSelected) return "border-2 border-status-red bg-status-red-bg";
    return "border border-cream-200 bg-white opacity-30 pointer-events-none";
  }

  function getLetterBadge(letter: string): React.ReactNode {
    const base = "w-[22px] h-[22px] rounded flex items-center justify-center shrink-0 transition-all duration-150";

    if (!confirmed) {
      if (selected.has(letter)) {
        return (
          <span className={`${base} bg-brand text-white`}>
            <span className="font-mono text-[9px] font-semibold">{letter}</span>
          </span>
        );
      }
      return (
        <span className={`${base} bg-cream-100 text-ink-faint border border-cream-200`}>
          <span className="font-mono text-[9px] font-semibold">{letter}</span>
        </span>
      );
    }

    const isCorrectOption = question.correctAnswers.includes(letter);
    const wasSelected = selected.has(letter);

    if (isCorrectOption) {
      return (
        <span className={`${base} bg-status-green text-white`}>
          <CheckIcon />
        </span>
      );
    }
    if (wasSelected) {
      return (
        <span className={`${base} bg-status-red text-white`}>
          <XIcon />
        </span>
      );
    }
    return (
      <span className={`${base} bg-cream-100 text-ink-faint border border-cream-200`}>
        <span className="font-mono text-[9px] font-semibold">{letter}</span>
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <TopicBadge topic={question.topic} />
        <span className="font-mono text-[9px] font-medium tracking-[0.15em] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 uppercase border border-purple-100">
          Multi-select
        </span>
      </div>

      {(question.contextImages ?? []).map((url) => (
        <ContextImage key={url} src={url} />
      ))}

      <p className="text-[15px] font-semibold text-ink leading-relaxed tracking-[-0.01em]">
        {question.text}
      </p>
      <p className="font-mono text-[10px] text-ink-faint">
        Select {question.correctAnswers.length} answers
      </p>

      <div className="flex flex-col gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.letter}
            onClick={() => toggle(opt.letter)}
            className={`flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150 ${getOptionStyle(opt.letter)}`}
          >
            {getLetterBadge(opt.letter)}
            <span className="text-[13.5px] text-ink leading-snug mt-0.5">
              {opt.text}
            </span>
          </button>
        ))}
      </div>

      {!confirmed && (
        <button
          onClick={confirm}
          disabled={selected.size === 0}
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
