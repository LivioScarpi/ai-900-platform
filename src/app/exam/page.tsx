"use client";

import { useRef, useState } from "react";
import { getAllQuestions, pickProportional } from "@/lib/questions";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Timer } from "@/components/Timer";
import { saveExamSession } from "@/lib/supabase";
import { useUserId } from "@/components/AuthProvider";
import { Question } from "@/types/question";
import Link from "next/link";

const EXAM_QUESTIONS = 50;
const EXAM_DURATION_SEC = 45 * 60;

type UserAnswer = { selected: string[]; isCorrect: boolean };
type ExamState = "idle" | "running" | "finished";

export default function ExamPage() {
  const allQuestions = getAllQuestions();
  const userId = useUserId();
  const [state, setState] = useState<ExamState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});
  const [index, setIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const startTimeRef = useRef<number>(0);

  function startExam() {
    const picked = pickProportional(allQuestions, EXAM_QUESTIONS);
    setQuestions(picked);
    setUserAnswers({});
    setIndex(0);
    startTimeRef.current = Date.now();
    setState("running");
  }

  async function submitExam(timedOut = false) {
    const durationMs = Date.now() - startTimeRef.current;
    const score = Object.values(userAnswers).filter((a) => a.isCorrect).length;
    const topicScores: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q, i) => {
      const ans = userAnswers[i];
      if (!topicScores[q.topic]) topicScores[q.topic] = { correct: 0, total: 0 };
      topicScores[q.topic].total += 1;
      if (ans?.isCorrect) topicScores[q.topic].correct += 1;
    });
    await saveExamSession({ userId, mode: timedOut ? "exam_timeout" : "exam", score, total: questions.length, topicScores, durationMs });
    setState("finished");
  }

  function handleAnswer(qi: number, isCorrect: boolean, selected: string[]) {
    setUserAnswers((prev) => ({ ...prev, [qi]: { isCorrect, selected } }));
  }

  // ── Idle ─────────────────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto w-full">
        <p className="label-caps text-ink-faint mb-1">Study / <span className="text-ink-muted">Exam Simulator</span></p>
        <h1 className="font-display text-3xl font-bold text-ink tracking-tight mb-6">Exam Simulator</h1>
        <div className="card p-8">
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "Questions", value: String(EXAM_QUESTIONS), badge: "TIMED", badgeColor: "bg-status-red-bg text-status-red" },
              { label: "Duration", value: "45 min", badge: "EXAM", badgeColor: "bg-cream-200 text-ink-muted" },
              { label: "Pass threshold", value: "70%", badge: "SCORE", badgeColor: "bg-status-green-bg text-status-green" },
              { label: "Feedback", value: "Post submit", badge: "MODE", badgeColor: "bg-cream-200 text-ink-muted" },
            ].map((item) => (
              <div key={item.label} className="bg-cream-50 rounded-xl p-4 border border-cream-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="label-caps">{item.label}</span>
                  <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                </div>
                <p className="text-2xl font-black text-ink">{item.value}</p>
              </div>
            ))}
          </div>
          {allQuestions.length === 0 ? (
            <p className="text-status-red text-sm text-center">No questions loaded. Run the preprocessing script first.</p>
          ) : (
            <button onClick={startExam} className="w-full py-3 rounded-xl bg-brand text-white font-bold text-base hover:bg-brand-dark transition-colors">
              Start Exam →
            </button>
          )}
        </div>
        <div className="mt-4"><Link href="/" className="text-sm text-ink-faint hover:text-brand transition-colors">← Back to Home</Link></div>
      </div>
    );
  }

  // ── Finished ──────────────────────────────────────────────────────────────
  if (state === "finished") {
    const score = Object.values(userAnswers).filter((a) => a.isCorrect).length;
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;
    const wrongQuestions = questions.filter((_, i) => !userAnswers[i]?.isCorrect);
    const reviewQ = wrongQuestions[reviewIndex];

    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto w-full">
        <p className="label-caps text-ink-faint mb-1">Exam / <span className="text-ink-muted">Results</span></p>
        <h1 className="font-display text-3xl font-bold text-ink tracking-tight mb-6">Results</h1>
        <div className={`card p-8 mb-5 border-l-4 ${passed ? "border-l-status-green" : "border-l-status-red"}`}>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="stat-number">{score}<span className="text-2xl text-ink-faint font-normal"> / {questions.length}</span></p>
              <p className="text-sm text-ink-muted mt-1">last 30 days</p>
            </div>
            <span className={`text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full ${passed ? "bg-status-green-bg text-status-green" : "bg-status-red-bg text-status-red"}`}>
              {passed ? "PASS ✓" : "FAIL ✗"}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-cream-200 overflow-hidden flex">
            <div className="bg-status-green h-full transition-all" style={{ width: `${pct}%` }} />
            <div className="bg-status-red h-full transition-all" style={{ width: `${100 - pct}%` }} />
          </div>
          <div className="flex gap-6 mt-3">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-status-green inline-block" /><span className="text-xs text-ink-muted">Correct <strong className="text-status-green">{score}</strong></span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-status-red inline-block" /><span className="text-xs text-ink-muted">Wrong <strong className="text-status-red">{questions.length - score}</strong></span></div>
          </div>
        </div>

        {wrongQuestions.length > 0 && (
          <div className="card overflow-hidden mb-5">
            <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
              <p className="font-bold text-ink">Review Wrong Answers</p>
              <span className="label-caps">{reviewIndex + 1} / {wrongQuestions.length}</span>
            </div>
            <div className="p-6">
              {reviewQ && <QuestionCard key={reviewQ.id} question={reviewQ} onAnswer={() => {}} />}
              <div className="flex justify-between mt-5 border-t border-cream-200 pt-4">
                <button onClick={() => setReviewIndex((i) => Math.max(0, i - 1))} disabled={reviewIndex === 0} className="px-4 py-2 text-sm rounded-lg border border-cream-200 bg-card disabled:opacity-40 hover:bg-cream-100 transition-colors text-ink-muted font-semibold">← Prev</button>
                <button onClick={() => setReviewIndex((i) => Math.min(wrongQuestions.length - 1, i + 1))} disabled={reviewIndex === wrongQuestions.length - 1} className="px-4 py-2 text-sm rounded-lg bg-brand text-white disabled:opacity-40 hover:bg-brand-dark transition-colors font-semibold">Next →</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={startExam} className="px-5 py-2.5 rounded-lg bg-brand text-white font-semibold hover:bg-brand-dark transition-colors text-sm">Retake Exam</button>
          <Link href="/" className="px-5 py-2.5 rounded-lg border border-cream-200 bg-card font-semibold text-ink-muted hover:bg-cream-100 transition-colors text-sm">Home</Link>
        </div>
      </div>
    );
  }

  // ── Running ────────────────────────────────────────────────────────────────
  const currentQuestion = questions[index];
  const allAnswered = Object.keys(userAnswers).length === questions.length;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto w-full">
      <div className="flex items-end justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">Q {index + 1}</h1>
        <div className="flex items-center gap-3">
          <span className="label-caps text-ink-faint">{Object.keys(userAnswers).length}/{questions.length} answered</span>
          <span className="px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-sm font-mono font-bold border border-brand/20">
            ⏱ <Timer durationSeconds={EXAM_DURATION_SEC} onExpire={() => submitExam(true)} />
          </span>
        </div>
      </div>

      <div className="mb-5"><ProgressBar current={Object.keys(userAnswers).length} total={questions.length} label="Answered" /></div>

      <div className="card p-6 mb-5">
        <QuestionCard key={currentQuestion.id} question={currentQuestion} onAnswer={(isCorrect, selected) => handleAnswer(index, isCorrect, selected)} />
      </div>

      <div className="flex justify-between gap-3">
        <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="px-4 py-2.5 rounded-lg border border-cream-200 bg-card text-sm font-semibold text-ink-muted disabled:opacity-40 hover:bg-cream-100 transition-colors">← Prev</button>
        {index < questions.length - 1 ? (
          <button onClick={() => setIndex((i) => i + 1)} className="px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors">Next →</button>
        ) : (
          <button onClick={() => submitExam(false)} disabled={!allAnswered} className="px-5 py-2.5 rounded-lg bg-status-green text-white text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-opacity">Submit ✓</button>
        )}
      </div>
    </div>
  );
}
