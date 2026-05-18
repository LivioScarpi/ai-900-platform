"use client";

import { useState } from "react";
import { getAllQuestions } from "@/lib/questions";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { saveFlashcardRating } from "@/lib/supabase";
import { useUserId } from "@/components/AuthProvider";
import { Question } from "@/types/question";
import Link from "next/link";

export default function FlashcardsPage() {
  const questions: Question[] = getAllQuestions().sort(() => Math.random() - 0.5);
  const userId = useUserId();
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<{ id: number; knew: boolean }[]>([]);

  const question = questions[index];

  if (!question) {
    const known = results.filter((r) => r.knew).length;
    const pct = results.length > 0 ? Math.round((known / results.length) * 100) : 0;

    return (
      <div className="flex flex-col min-h-screen">
        <div className="px-7 md:px-10 pt-8 pb-6 border-b border-cream-200">
          <Link href="/" className="font-mono text-[10px] text-ink-faint hover:text-ink transition-colors tracking-[0.1em] uppercase">
            ← Home
          </Link>
          <h1 className="font-display text-[28px] md:text-[34px] font-extrabold text-ink tracking-[-0.025em] leading-none mt-4">
            Flashcard Mode
          </h1>
        </div>
        <div className="px-7 md:px-10 py-10 max-w-sm">
          <p className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em] mb-2">Session complete</p>
          <p className="font-display text-[52px] font-extrabold text-ink tracking-[-0.04em] leading-none tnum">
            {pct}<span className="text-[28px] text-ink-faint font-normal">%</span>
          </p>
          <p className="font-mono text-[10px] text-ink-muted mt-1 mb-6">
            {known} known / {results.length} total
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-lg bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  async function handleAnswer(isCorrect: boolean) {
    setAnswered(true);
    await saveFlashcardRating({ userId, questionId: question.id, rating: isCorrect ? "got_it" : "missed_it" });
  }

  async function rate(knew: boolean) {
    setResults((prev) => [...prev, { id: question.id, knew }]);
    setIndex((i) => i + 1);
    setAnswered(false);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-7 md:px-10 pt-8 pb-5 border-b border-cream-200">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="font-mono text-[10px] text-ink-faint hover:text-ink transition-colors tracking-[0.1em] uppercase">
            ← Home
          </Link>
          <span className="font-mono text-[12px] font-medium text-ink-muted">
            {index + 1}<span className="text-ink-faint font-normal"> / {questions.length}</span>
          </span>
        </div>
        <h1 className="font-display text-[28px] md:text-[34px] font-extrabold text-ink tracking-[-0.025em] leading-none">
          Flashcard Mode
        </h1>
        <p className="font-mono text-[10px] text-ink-faint mt-2 tracking-[0.1em] uppercase">
          Card {index + 1}
        </p>
      </div>

      {/* Progress */}
      <div className="px-7 md:px-10 py-3 border-b border-cream-200">
        <ProgressBar current={index + 1} total={questions.length} />
      </div>

      {/* Content */}
      <div className="px-7 md:px-10 py-8 flex gap-12 items-start">
        <div className="flex-1 min-w-0 max-w-2xl">
          <QuestionCard key={question.id} question={question} onAnswer={handleAnswer} />

          {answered && (
            <div className="mt-8 pt-6 border-t border-cream-200">
              <p className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.12em] mb-4">
                Did you know this?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => rate(true)}
                  className="py-3 rounded-xl bg-status-green-bg border border-status-green/30 text-status-green font-bold text-[13px] hover:bg-status-green hover:text-white transition-all duration-150"
                >
                  Got it
                </button>
                <button
                  onClick={() => rate(false)}
                  className="py-3 rounded-xl bg-status-red-bg border border-status-red/30 text-status-red font-bold text-[13px] hover:bg-status-red hover:text-white transition-all duration-150"
                >
                  Missed it
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <aside className="hidden xl:flex flex-col gap-8 w-48 shrink-0 pt-1">
          <div>
            <p className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em] mb-2">Progress</p>
            <p className="font-display text-[44px] font-extrabold text-ink leading-none tnum">
              {Math.round(((index + 1) / questions.length) * 100)}<span className="text-[22px] text-ink-faint font-normal">%</span>
            </p>
            <p className="font-mono text-[10px] text-ink-faint mt-1.5">{index + 1} of {questions.length}</p>
            <div className="w-full h-1 rounded-full bg-cream-200 mt-3 overflow-hidden">
              <div className="h-full bg-[#C47800] rounded-full transition-all duration-500" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
            </div>
          </div>
          {results.length > 0 && (
            <div className="border-t border-cream-200 pt-6 space-y-3">
              <div>
                <p className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em] mb-1">Got it</p>
                <p className="font-display text-[28px] font-extrabold text-status-green leading-none tnum">
                  {results.filter((r) => r.knew).length}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em] mb-1">Missed</p>
                <p className="font-display text-[28px] font-extrabold text-status-red leading-none tnum">
                  {results.filter((r) => !r.knew).length}
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
