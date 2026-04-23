"use client";

import { useState } from "react";
import { getAllQuestions } from "@/lib/questions";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { saveAttempt } from "@/lib/supabase";
import { useUserId } from "@/components/AuthProvider";
import { Question } from "@/types/question";
import Link from "next/link";

export default function SequentialPage() {
  const questions: Question[] = getAllQuestions();
  const userId = useUserId();
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const question = questions[index];

  function restart() { setIndex(0); setAnswered(false); }

  if (!question) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto w-full">
        <p className="label-caps text-ink-faint mb-1">Study / Sequential</p>
        <h1 className="font-display text-3xl font-bold text-ink mb-6">All Done!</h1>
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-ink font-semibold mb-4">You&apos;ve completed all questions</p>
          <Link href="/" className="inline-block px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  async function handleAnswer(isCorrect: boolean, selectedAnswers: string[]) {
    setAnswered(true);
    await saveAttempt({ userId, questionId: question.id, mode: "sequential", selectedAnswers, isCorrect });
  }

  function next() { setIndex((i) => i + 1); setAnswered(false); }
  function prev() { setIndex((i) => Math.max(0, i - 1)); setAnswered(false); }

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto w-full">
      <p className="label-caps text-ink-faint mb-1">Study / <span className="text-ink-muted">Sequential Review</span></p>
      <div className="flex items-end justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink tracking-tight">Question {question.id}</h1>
        <div className="flex items-center gap-3">
          <button onClick={restart} className="label-caps text-ink-faint hover:text-status-red transition-colors">
            Restart
          </button>
          <span className="label-caps text-ink-faint">{index + 1} / {questions.length}</span>
        </div>
      </div>
      <div className="mb-5"><ProgressBar current={index + 1} total={questions.length} /></div>
      <div className="card p-6 mb-5">
        <QuestionCard key={question.id} question={question} onAnswer={handleAnswer} />
      </div>
      <div className="flex justify-between gap-3">
        <button onClick={prev} disabled={index === 0} className="px-4 py-2.5 rounded-lg border border-cream-200 bg-card text-sm font-semibold text-ink-muted disabled:opacity-40 hover:bg-cream-100 transition-colors">
          ← Prev
        </button>
        <button onClick={next} disabled={!answered} className="px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-40 hover:bg-brand-dark transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}
