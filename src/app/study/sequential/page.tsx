"use client";

import { useState } from "react";
import { getAllQuestions } from "@/lib/questions";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { saveAttempt } from "@/lib/supabase";
import { useUserId } from "@/components/AuthProvider";
import { Question } from "@/types/question";
import Link from "next/link";

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function SequentialPage() {
  const questions: Question[] = getAllQuestions();
  const userId = useUserId();
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const question = questions[index];

  function restart() { setIndex(0); setAnswered(false); }

  async function handleAnswer(isCorrect: boolean, selectedAnswers: string[]) {
    setAnswered(true);
    await saveAttempt({ userId, questionId: question.id, mode: "sequential", selectedAnswers, isCorrect });
  }

  function next() { setIndex((i) => i + 1); setAnswered(false); }
  function prev() { setIndex((i) => Math.max(0, i - 1)); setAnswered(false); }

  if (!question) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="px-7 md:px-10 pt-8 pb-6 border-b border-cream-200">
          <Link href="/" className="font-mono text-[10px] text-ink-faint hover:text-ink transition-colors tracking-[0.1em] uppercase">
            ← Home
          </Link>
          <h1 className="font-display text-[28px] md:text-[34px] font-extrabold text-ink tracking-[-0.025em] leading-none mt-4">
            Sequential Review
          </h1>
        </div>
        <div className="px-7 md:px-10 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-status-green flex items-center justify-center text-white">
              <CheckIcon />
            </div>
            <p className="font-display text-[20px] font-bold text-ink">All done!</p>
          </div>
          <p className="text-[13px] text-ink-muted mb-6 max-w-sm">
            You&apos;ve worked through all {questions.length} questions in order. Great work.
          </p>
          <div className="flex gap-3">
            <button onClick={restart} className="px-5 py-2.5 rounded-lg bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition-colors">
              Restart
            </button>
            <Link href="/" className="px-5 py-2.5 rounded-lg border border-cream-200 bg-card text-ink-muted text-[13px] font-semibold hover:bg-cream-100 transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-7 md:px-10 pt-8 pb-5 border-b border-cream-200">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="font-mono text-[10px] text-ink-faint hover:text-ink transition-colors tracking-[0.1em] uppercase">
            ← Home
          </Link>
          <span className="font-mono text-[12px] font-medium text-ink-muted xl:hidden">
            {index + 1}<span className="text-ink-faint font-normal"> / {questions.length}</span>
          </span>
        </div>
        <h1 className="font-display text-[28px] md:text-[34px] font-extrabold text-ink tracking-[-0.025em] leading-none">
          Sequential Review
        </h1>
        <p className="font-mono text-[10px] text-ink-faint mt-2 tracking-[0.1em] uppercase">
          Question {question.id}
        </p>
      </div>

      {/* Progress */}
      <div className="px-7 md:px-10 py-3 border-b border-cream-200">
        <ProgressBar current={index + 1} total={questions.length} />
      </div>

      {/* Content */}
      <div className="flex flex-1">
        {/* Question column */}
        <div className="flex-1 min-w-0 max-w-2xl px-7 md:px-10 py-8">
          <QuestionCard key={question.id} question={question} onAnswer={handleAnswer} hideExplanation />
          <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-cream-200">
            <button
              onClick={prev}
              disabled={index === 0}
              className="px-5 py-2.5 rounded-lg border border-cream-200 bg-card text-[13px] font-semibold text-ink-muted disabled:opacity-40 hover:bg-cream-100 transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={next}
              disabled={!answered}
              className="px-5 py-2.5 rounded-lg bg-brand text-white text-[13px] font-semibold disabled:opacity-40 hover:bg-brand-dark transition-colors"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Explanation panel */}
        <aside className="hidden xl:flex flex-col flex-1 border-l border-cream-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="font-mono text-[9px] font-medium tracking-[0.15em] text-ink-faint uppercase">Explanation</span>
            </div>
            <span className="font-mono text-[9px] text-ink-faint">#{question.id}</span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {!answered ? (
              <div className="flex flex-col gap-4">
                <div className="space-y-2.5">
                  {[100, 72, 100, 58, 85, 45, 92, 64, 78, 50].map((w, i) => (
                    <div key={i} className="h-[8px] rounded-full bg-cream-100" style={{ width: `${w}%` }} />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-faint shrink-0">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="font-mono text-[10px] text-ink-faint">Answer to reveal</span>
                </div>
              </div>
            ) : (
              <div className="animate-reveal space-y-3">
                {question.explanation ? (
                  <p className="text-[13px] text-ink-muted leading-relaxed whitespace-pre-line">
                    {question.explanation}
                  </p>
                ) : (
                  <p className="font-mono text-[10px] text-ink-faint leading-relaxed tracking-[0.05em]">
                    No notes for this one —<br />your reasoning is the answer.
                  </p>
                )}
                {question.reference && (
                  <a
                    href={question.reference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-brand underline underline-offset-2 break-all hover:text-brand-dark transition-colors"
                  >
                    {question.reference}
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-cream-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-24 h-[3px] rounded-full bg-cream-200 overflow-hidden">
                <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
              </div>
              <span className="font-mono text-[9px] text-ink-faint tnum">{index + 1}/{questions.length}</span>
            </div>
            <button onClick={restart} className="font-mono text-[9px] text-ink-faint hover:text-status-red transition-colors tracking-[0.1em] uppercase">
              Restart →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
