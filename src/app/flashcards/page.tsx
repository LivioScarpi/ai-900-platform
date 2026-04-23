"use client";

import { useState } from "react";
import { getAllQuestions } from "@/lib/questions";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { saveFlashcardRating } from "@/lib/supabase";
import { getUserId } from "@/lib/userId";
import { Question } from "@/types/question";
import Link from "next/link";

export default function FlashcardsPage() {
  const questions: Question[] = getAllQuestions().sort(() => Math.random() - 0.5);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<{ id: number; knew: boolean }[]>([]);

  const question = questions[index];

  if (!question) {
    const known = results.filter((r) => r.knew).length;
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto w-full">
        <p className="label-caps text-ink-faint mb-1">Study / <span className="text-ink-muted">Flashcards</span></p>
        <h1 className="font-display text-3xl font-bold text-ink mb-6">Session Complete</h1>
        <div className="card p-8 text-center">
          <p className="stat-number mb-1">{known}<span className="text-2xl text-ink-faint font-normal"> / {results.length}</span></p>
          <p className="label-caps mb-6">Got it right</p>
          <Link href="/" className="inline-block px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  async function handleAnswer(isCorrect: boolean) {
    setAnswered(true);
    await saveFlashcardRating({ userId: getUserId(), questionId: question.id, rating: isCorrect ? "got_it" : "missed_it" });
  }

  async function rate(knew: boolean) {
    setResults((prev) => [...prev, { id: question.id, knew }]);
    setIndex((i) => i + 1);
    setAnswered(false);
  }

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto w-full">
      <p className="label-caps text-ink-faint mb-1">Study / <span className="text-ink-muted">Flashcards</span></p>
      <div className="flex items-end justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">Card {index + 1}</h1>
        <span className="label-caps text-ink-faint">{index + 1} / {questions.length}</span>
      </div>

      <div className="mb-5"><ProgressBar current={index + 1} total={questions.length} /></div>

      <div className="card p-6 mb-5">
        <QuestionCard key={question.id} question={question} onAnswer={handleAnswer} />
      </div>

      {answered && (
        <div className="card p-5 border-l-4 border-l-brand">
          <p className="label-caps mb-3">Did you know this?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => rate(true)}
              className="py-3 rounded-xl bg-status-green-bg border-2 border-status-green text-status-green font-bold text-sm hover:bg-status-green hover:text-white transition-all"
            >
              ✓ Got it
            </button>
            <button
              onClick={() => rate(false)}
              className="py-3 rounded-xl bg-status-red-bg border-2 border-status-red text-status-red font-bold text-sm hover:bg-status-red hover:text-white transition-all"
            >
              ✗ Missed it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
