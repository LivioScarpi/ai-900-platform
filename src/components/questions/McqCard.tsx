"use client";

import { useState } from "react";
import { McqQuestion } from "@/types/question";
import { ExplanationDrawer } from "@/components/ExplanationDrawer";
import { ContextImage } from "@/components/ContextImage";
import { TopicBadge } from "@/components/TopicBadge";

interface Props {
  question: McqQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
  hideExplanation?: boolean;
}

function IconCheck() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l6 6M9 3l-6 6" />
    </svg>
  );
}

export function McqCard({ question, onAnswer, hideExplanation }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function confirm() {
    if (!selected) return;
    setConfirmed(true);
    onAnswer(selected === question.correctAnswer, [selected]);
  }

  function getOptionStyle(letter: string): string {
    if (!confirmed) {
      if (selected === letter) {
        return "border-2 border-brand bg-[rgba(0,102,204,0.04)] shadow-[0_0_0_3px_rgba(0,102,204,0.07)] cursor-pointer";
      }
      return "border border-cream-200 bg-white hover:border-brand/40 hover:bg-[rgba(0,102,204,0.025)] cursor-pointer";
    }
    if (letter === question.correctAnswer) {
      return "border-2 border-status-green bg-status-green-bg";
    }
    if (letter === selected) {
      return "border-2 border-status-red bg-status-red-bg";
    }
    return "border border-cream-200 bg-white opacity-30 pointer-events-none";
  }

  function getLetterBadge(letter: string): React.ReactNode {
    const base = "w-[22px] h-[22px] rounded flex items-center justify-center shrink-0 transition-all duration-150";

    if (!confirmed) {
      if (selected === letter) {
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

    if (letter === question.correctAnswer) {
      return (
        <span className={`${base} bg-status-green text-white`}>
          <IconCheck />
        </span>
      );
    }
    if (letter === selected) {
      return (
        <span className={`${base} bg-status-red text-white`}>
          <IconX />
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
        <span className="font-mono text-[9px] font-medium tracking-[0.15em] px-2 py-0.5 rounded-full bg-cream-100 text-ink-faint uppercase border border-cream-200">
          MCQ
        </span>
      </div>

      {/* Context images */}
      {(question.contextImages ?? []).map((url) => (
        <ContextImage key={url} src={url} />
      ))}

      {/* Question text */}
      <p className="text-[15px] font-semibold text-ink leading-relaxed tracking-[-0.01em]">
        {question.text}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.letter}
            onClick={() => !confirmed && setSelected(opt.letter)}
            className={`flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150 ${getOptionStyle(opt.letter)}`}
          >
            {getLetterBadge(opt.letter)}
            <span className="text-[13.5px] text-ink leading-snug mt-0.5">
              {opt.text}
            </span>
          </button>
        ))}
      </div>

      {/* Confirm button */}
      {!confirmed && (
        <button
          onClick={confirm}
          disabled={!selected}
          className="w-full py-3 rounded-xl bg-brand text-white font-semibold text-sm tracking-wide transition-all duration-150 hover:bg-brand-dark disabled:opacity-35 disabled:cursor-not-allowed"
        >
          Confirm Answer
        </button>
      )}

      {confirmed && !hideExplanation && (
        <ExplanationDrawer
          explanation={question.explanation}
          reference={question.reference}
        />
      )}
    </div>
  );
}
