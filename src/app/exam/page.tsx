"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAllQuestions, pickProportional } from "@/lib/questions";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Timer } from "@/components/Timer";
import { saveExamSession, saveExamDraft, loadExamDraft, deleteExamDraft } from "@/lib/supabase";
import { useUserId } from "@/components/AuthProvider";
import { Question } from "@/types/question";
import Link from "next/link";

const EXAM_QUESTIONS = 50;
const EXAM_DURATION_SEC = 45 * 60;
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

type UserAnswer = { selected: string[]; isCorrect: boolean };
type ExamState = "idle" | "running" | "finished";

interface ExamDraft {
  questionIds: number[];
  userAnswers: Record<number, UserAnswer>;
  currentIndex: number;
  remainingSeconds: number;
  startedAt: number;
  pausedDurationMs: number;
  savedAt: number;
}

interface DraftInfo {
  answered: number;
  remainingSeconds: number;
}

export default function ExamPage() {
  const allQuestions = getAllQuestions();
  const userId = useUserId();

  const [state, setState] = useState<ExamState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});
  const [index, setIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_DURATION_SEC);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<DraftInfo | null>(null);

  const startTimeRef = useRef<number>(0);
  const pausedDurationMsRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);
  const latestAnswersRef = useRef<Record<number, UserAnswer>>({});
  const latestRemainingRef = useRef(EXAM_DURATION_SEC);

  // Keep refs in sync for use inside callbacks without stale closures
  latestAnswersRef.current = userAnswers;
  latestRemainingRef.current = remainingSeconds;

  // Load draft on mount (after userId is available)
  useEffect(() => {
    if (!userId) return;
    loadExamDraft(userId).then((row) => {
      if (!row) return;
      const draft = row.data as ExamDraft;
      if (Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) {
        deleteExamDraft(userId);
        return;
      }
      setHasDraft(true);
      setDraftInfo({ answered: Object.keys(draft.userAnswers).length, remainingSeconds: draft.remainingSeconds });
    });
  }, [userId]);

  const buildDraft = useCallback((): ExamDraft => ({
    questionIds: questions.map((q) => q.id),
    userAnswers: latestAnswersRef.current,
    currentIndex: index,
    remainingSeconds: latestRemainingRef.current,
    startedAt: startTimeRef.current,
    pausedDurationMs: pausedDurationMsRef.current,
    savedAt: Date.now(),
  }), [questions, index]);

  function startExam() {
    const picked = pickProportional(allQuestions, EXAM_QUESTIONS);
    setQuestions(picked);
    setUserAnswers({});
    setIndex(0);
    setIsPaused(false);
    setRemainingSeconds(EXAM_DURATION_SEC);
    pausedDurationMsRef.current = 0;
    pausedAtRef.current = null;
    startTimeRef.current = Date.now();
    setHasDraft(false);
    setDraftInfo(null);
    if (userId) deleteExamDraft(userId);
    setState("running");
  }

  function loadDraftAndResume(draft: ExamDraft) {
    const qs = draft.questionIds.map((id) => allQuestions.find((q) => q.id === id)).filter(Boolean) as Question[];
    const firstUnanswered = draft.questionIds.findIndex((_, i) => !draft.userAnswers[i]);
    setQuestions(qs);
    setUserAnswers(draft.userAnswers);
    setIndex(firstUnanswered >= 0 ? firstUnanswered : draft.questionIds.length - 1);
    setRemainingSeconds(draft.remainingSeconds);
    startTimeRef.current = draft.startedAt;
    pausedDurationMsRef.current = draft.pausedDurationMs;
    pausedAtRef.current = null;
    setIsPaused(false);
    setHasDraft(false);
    setDraftInfo(null);
    setState("running");
  }

  async function resumeFromSaved() {
    if (!userId) return;
    const row = await loadExamDraft(userId);
    if (!row) return;
    loadDraftAndResume(row.data as ExamDraft);
  }

  function pauseExam() {
    setIsPaused(true);
    pausedAtRef.current = Date.now();
    if (userId) saveExamDraft(userId, buildDraft());
  }

  function resumeExam() {
    if (pausedAtRef.current !== null) {
      pausedDurationMsRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    setIsPaused(false);
  }

  function handleAnswer(qi: number, isCorrect: boolean, selected: string[]) {
    setUserAnswers((prev) => {
      const next = { ...prev, [qi]: { isCorrect, selected } };
      latestAnswersRef.current = next;
      if (userId) saveExamDraft(userId, { ...buildDraft(), userAnswers: next });
      return next;
    });
  }

  const handleTick = useCallback((remaining: number) => {
    setRemainingSeconds(remaining);
    latestRemainingRef.current = remaining;
  }, []);

  async function submitExam(timedOut = false) {
    const durationMs = Date.now() - startTimeRef.current - pausedDurationMsRef.current;
    const score = Object.values(userAnswers).filter((a) => a.isCorrect).length;
    const topicScores: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q, i) => {
      const ans = userAnswers[i];
      if (!topicScores[q.topic]) topicScores[q.topic] = { correct: 0, total: 0 };
      topicScores[q.topic].total += 1;
      if (ans?.isCorrect) topicScores[q.topic].correct += 1;
    });
    if (userId) await deleteExamDraft(userId);
    await saveExamSession({ userId, mode: timedOut ? "exam_timeout" : "exam", score, total: questions.length, topicScores, durationMs });
    setState("finished");
  }

  // ── Idle ─────────────────────────────────────────────────────────────────
  if (state === "idle") {
    const remainingMins = draftInfo ? Math.floor(draftInfo.remainingSeconds / 60) : null;
    const remainingSecs = draftInfo ? draftInfo.remainingSeconds % 60 : null;

    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto w-full">
        <p className="label-caps text-ink-faint mb-1">Study / <span className="text-ink-muted">Exam Simulator</span></p>
        <h1 className="font-display text-3xl font-bold text-ink tracking-tight mb-6">Exam Simulator</h1>

        {/* Resume card */}
        {hasDraft && draftInfo && (
          <div className="card p-5 mb-5 border-l-4 border-l-status-orange bg-status-orange-bg/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-ink text-sm mb-1">Esame in pausa</p>
                <p className="text-xs text-ink-muted">
                  {draftInfo.answered} risposte salvate · {String(remainingMins).padStart(2, "0")}:{String(remainingSecs).padStart(2, "0")} rimanenti
                </p>
              </div>
              <span className="font-mono text-[10px] font-bold tracking-widest px-2 py-1 rounded-full bg-status-orange-bg text-status-orange border border-amber-200 flex-shrink-0">
                PAUSED
              </span>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={resumeFromSaved}
                className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
              >
                ▶ Riprendi
              </button>
              <button
                onClick={() => { setHasDraft(false); setDraftInfo(null); if (userId) deleteExamDraft(userId); }}
                className="px-4 py-2 rounded-lg border border-cream-200 bg-card text-sm font-semibold text-ink-muted hover:bg-cream-100 transition-colors"
              >
                Scarta e ricomincia
              </button>
            </div>
          </div>
        )}

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
              {hasDraft ? "Nuovo esame →" : "Start Exam →"}
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
    <div className="relative px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto w-full">
      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-20 bg-cream/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-ink mb-1">Esame in pausa</p>
            <p className="text-sm text-ink-muted">Il timer è fermo. Riprendi quando sei pronto.</p>
          </div>
          <button
            onClick={resumeExam}
            className="px-6 py-3 rounded-xl bg-brand text-white font-bold text-base hover:bg-brand-dark transition-colors"
          >
            ▶ Riprendi
          </button>
        </div>
      )}

      <div className="flex items-end justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">Q {index + 1}</h1>
        <div className="flex items-center gap-3">
          <span className="label-caps text-ink-faint">{Object.keys(userAnswers).length}/{questions.length} answered</span>
          <span className="px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-sm font-mono font-bold border border-brand/20">
            ⏱ <Timer
              durationSeconds={EXAM_DURATION_SEC}
              initialSeconds={remainingSeconds}
              paused={isPaused}
              onExpire={() => submitExam(true)}
              onTick={handleTick}
            />
          </span>
          <button
            onClick={isPaused ? resumeExam : pauseExam}
            className="px-3 py-1.5 rounded-lg border border-cream-200 bg-card text-ink-muted text-sm font-semibold hover:bg-cream-100 transition-colors"
            title={isPaused ? "Riprendi" : "Pausa"}
          >
            {isPaused ? "▶" : "⏸"}
          </button>
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
