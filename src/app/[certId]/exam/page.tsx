"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCertQuestions, pickProportional } from "@/lib/questions";
import { getCertConfig } from "@/lib/certifications";
import { QuestionCard } from "@/components/QuestionCard";
import { Timer } from "@/components/Timer";
import { saveExamSession, saveExamDraft, loadExamDraft, deleteExamDraft } from "@/lib/supabase";
import { useUserId } from "@/components/AuthProvider";
import { Question } from "@/types/question";
import Link from "next/link";

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
  feedbackMode: boolean;
  savedAt: number;
}

interface DraftInfo {
  answered: number;
  remainingSeconds: number;
}

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function QuestionNavigator({
  total, current, userAnswers, feedbackMode, onNavigate,
}: {
  total: number; current: number;
  userAnswers: Record<number, UserAnswer>;
  feedbackMode: boolean; onNavigate: (i: number) => void;
}) {
  const answeredCount = Object.keys(userAnswers).length;
  return (
    <div className="px-7 md:px-10 py-3 border-b border-cream-200">
      <p className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em] mb-2.5">
        Q {current + 1} / {total} · {answeredCount} answered
      </p>
      <div className="grid grid-cols-[repeat(25,1fr)] md:grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-[3px]">
        {Array.from({ length: total }, (_, i) => {
          const ans = userAnswers[i];
          const isCurrent = i === current;
          let colourCls = "";
          if (ans) {
            colourCls = feedbackMode ? (ans.isCorrect ? "bg-status-green" : "bg-status-red") : "bg-ink";
          } else {
            colourCls = "bg-cream-200 hover:bg-cream-100";
          }
          return (
            <button key={i} onClick={() => onNavigate(i)} title={`Q${i + 1}`}
              className={`h-[8px] rounded-[2px] transition-all cursor-pointer ${colourCls} ${isCurrent ? "ring-2 ring-ink ring-offset-1" : ""}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function ExamPage({ params }: { params: { certId: string } }) {
  const { certId } = params;
  const config = getCertConfig(certId)!;
  const examQuestions = config.examQuestions;
  const examDuration = config.examDurationMin * 60;

  const allQuestions = getCertQuestions(certId);
  const userId = useUserId();

  const [state, setState] = useState<ExamState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});
  const [index, setIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(examDuration);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<DraftInfo | null>(null);
  const [feedbackMode, setFeedbackMode] = useState(false);

  const startTimeRef = useRef<number>(0);
  const pausedDurationMsRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);
  const latestAnswersRef = useRef<Record<number, UserAnswer>>({});
  const latestRemainingRef = useRef(examDuration);

  latestAnswersRef.current = userAnswers;
  latestRemainingRef.current = remainingSeconds;

  useEffect(() => {
    if (!userId) return;
    loadExamDraft(userId).then((row) => {
      if (!row) return;
      const draft = row.data as ExamDraft;
      if (Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) { deleteExamDraft(userId); return; }
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
    feedbackMode,
    savedAt: Date.now(),
  }), [questions, index, feedbackMode]);

  function startExam() {
    const picked = pickProportional(allQuestions, examQuestions);
    setQuestions(picked);
    setUserAnswers({});
    setIndex(0);
    setIsPaused(false);
    setRemainingSeconds(examDuration);
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
    setFeedbackMode(draft.feedbackMode ?? false);
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

  const homeHref = `/${certId}`;

  // ── Idle ─────────────────────────────────────────────────────────────────
  if (state === "idle") {
    const remainingMins = draftInfo ? Math.floor(draftInfo.remainingSeconds / 60) : null;
    const remainingSecs = draftInfo ? draftInfo.remainingSeconds % 60 : null;

    return (
      <div className="flex flex-col min-h-screen">
        <div className="px-7 md:px-10 pt-8 pb-6 border-b border-cream-200">
          <h1 className="font-display text-[28px] md:text-[34px] font-extrabold text-ink tracking-[-0.025em] leading-none mt-4">
            Exam Simulator
          </h1>
          <p className="font-mono text-[10px] text-ink-faint mt-2 tracking-[0.1em] uppercase">
            {config.name} · Full practice exam
          </p>
        </div>

        <div className="px-7 md:px-10 py-8">
          {hasDraft && draftInfo && (
            <div className="flex items-center justify-between py-4 mb-8 border-b border-cream-200">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-status-orange shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-ink">Exam in progress</p>
                  <p className="font-mono text-[10px] text-ink-faint mt-0.5">
                    {draftInfo.answered} answered · {String(remainingMins).padStart(2, "0")}:{String(remainingSecs!).padStart(2, "0")} left
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <button onClick={resumeFromSaved} className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand hover:text-brand-dark transition-colors">Resume →</button>
                <button onClick={() => { setHasDraft(false); setDraftInfo(null); if (userId) deleteExamDraft(userId); }} className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint hover:text-status-red transition-colors">Discard</button>
              </div>
            </div>
          )}

          <div className="py-8 border-b border-cream-200 mb-8">
            <div className="grid grid-cols-2 gap-x-10 gap-y-6 mb-8">
              {[
                { label: "Questions", value: String(examQuestions) },
                { label: "Duration", value: `${config.examDurationMin} min` },
                { label: "Pass mark", value: `${config.passmarkPct}%` },
                { label: "Feedback", value: feedbackMode ? "Live" : "Post-exam" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em] mb-1">{item.label}</p>
                  <p className="font-display text-[32px] font-extrabold text-ink tracking-[-0.025em] leading-none">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-0 rounded-lg border border-cream-200 overflow-hidden self-start mb-8 w-fit">
              <button onClick={() => setFeedbackMode(false)} className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${!feedbackMode ? "bg-ink text-white" : "text-ink-muted hover:bg-cream-100"}`}>Exam mode</button>
              <button onClick={() => setFeedbackMode(true)} className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] border-l border-cream-200 transition-colors ${feedbackMode ? "bg-ink text-white" : "text-ink-muted hover:bg-cream-100"}`}>Practice mode</button>
            </div>

            {allQuestions.length === 0 ? (
              <p className="font-mono text-[11px] text-status-red">No questions loaded.</p>
            ) : (
              <button onClick={startExam} className="px-7 py-3 rounded-xl bg-ink text-white font-display font-bold text-[15px] tracking-[-0.01em] hover:bg-ink/85 transition-colors">
                {hasDraft ? "New exam →" : "Start exam →"}
              </button>
            )}
          </div>

          <Link href={homeHref} className="font-mono text-[10px] text-ink-faint hover:text-brand transition-colors tracking-[0.1em] uppercase">← Overview</Link>
        </div>
      </div>
    );
  }

  // ── Finished ──────────────────────────────────────────────────────────────
  if (state === "finished") {
    const score = Object.values(userAnswers).filter((a) => a.isCorrect).length;
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= config.passmarkPct;
    const wrongQuestions = questions.filter((_, i) => !userAnswers[i]?.isCorrect);
    const reviewQ = wrongQuestions[reviewIndex];

    return (
      <div className="flex flex-col min-h-screen">
        <div className="px-7 md:px-10 pt-8 pb-6 border-b border-cream-200">
          <div className="flex items-end justify-between mt-4">
            <h1 className="font-display text-[28px] md:text-[34px] font-extrabold text-ink tracking-[-0.025em] leading-none">Exam Results</h1>
            <span className={`font-mono text-[10px] font-medium tracking-[0.14em] px-3 py-1.5 rounded-full uppercase border mb-0.5 ${passed ? "bg-status-green-bg text-status-green border-status-green/20" : "bg-status-red-bg text-status-red border-red-200"}`}>
              {passed ? "Pass" : "Fail"}
            </span>
          </div>
        </div>

        <div className="px-7 md:px-10 py-8 border-b border-cream-200">
          <p className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em] mb-2">Your score</p>
          <p className="font-display text-[56px] font-extrabold text-ink tracking-[-0.04em] leading-none tnum">
            {pct}<span className="text-[32px] text-ink-faint font-normal">%</span>
          </p>
          <p className="font-mono text-[10px] text-ink-muted mt-2">{score} correct / {questions.length} total</p>
          <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden flex mt-4">
            <div className="bg-status-green h-full transition-all" style={{ width: `${pct}%` }} />
            <div className="bg-status-red h-full transition-all" style={{ width: `${100 - pct}%` }} />
          </div>
          <div className="flex gap-6 mt-3">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-status-green" /><span className="font-mono text-[10px] text-ink-muted">Correct <strong className="text-status-green">{score}</strong></span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-status-red" /><span className="font-mono text-[10px] text-ink-muted">Wrong <strong className="text-status-red">{questions.length - score}</strong></span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cream-200" /><span className="font-mono text-[10px] text-ink-muted">Pass mark <strong className="text-ink-muted">{config.passmarkPct}%</strong></span></div>
          </div>
        </div>

        {wrongQuestions.length > 0 && (
          <div className="flex flex-1 border-b border-cream-200">
            <div className="flex-1 min-w-0 max-w-2xl px-7 md:px-10 py-8">
              <div className="flex items-center justify-between mb-7">
                <p className="font-display text-[18px] font-bold text-ink">Review Wrong Answers</p>
                <span className="font-mono text-[11px] text-ink-muted">{reviewIndex + 1} / {wrongQuestions.length}</span>
              </div>
              {reviewQ && <QuestionCard key={reviewQ.id} question={reviewQ} onAnswer={() => {}} hideExplanation />}
              <div className="flex justify-between mt-8 pt-6 border-t border-cream-200">
                <button onClick={() => setReviewIndex((i) => Math.max(0, i - 1))} disabled={reviewIndex === 0} className="px-5 py-2 rounded-lg border border-cream-200 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted disabled:opacity-40 hover:bg-cream-100 hover:text-ink transition-colors">← Prev</button>
                <button onClick={() => setReviewIndex((i) => Math.min(wrongQuestions.length - 1, i + 1))} disabled={reviewIndex === wrongQuestions.length - 1} className="px-5 py-2 rounded-lg bg-ink text-white font-mono text-[10px] uppercase tracking-[0.12em] disabled:opacity-40 hover:bg-ink/85 transition-colors">Next →</button>
              </div>
            </div>
            <aside className="hidden md:flex flex-col md:w-64 xl:flex-1 border-l border-cream-200">
              <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /><span className="font-mono text-[9px] font-medium tracking-[0.15em] text-ink-faint uppercase">Explanation</span></div>
                <span className="font-mono text-[9px] text-ink-faint">#{reviewQ?.id}</span>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {reviewQ && (
                  <div key={reviewQ.id} className="animate-reveal space-y-3">
                    {reviewQ.explanation ? <p className="text-[13px] text-ink-muted leading-relaxed whitespace-pre-line">{reviewQ.explanation}</p> : <p className="font-mono text-[10px] text-ink-faint leading-relaxed tracking-[0.05em]">No notes for this one —<br />your reasoning is the answer.</p>}
                    {reviewQ.reference && <a href={reviewQ.reference} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-[11px] text-brand underline underline-offset-2 break-all hover:text-brand-dark transition-colors">{reviewQ.reference}</a>}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        <div className="px-7 md:px-10 flex gap-3 py-6">
          <button onClick={startExam} className="px-7 py-3 rounded-xl bg-ink text-white font-display font-bold text-[15px] tracking-[-0.01em] hover:bg-ink/85 transition-colors">Retake exam →</button>
          <Link href={homeHref} className="px-5 py-2 rounded-lg border border-cream-200 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:bg-cream-100 hover:text-ink transition-colors self-center">Overview</Link>
        </div>
      </div>
    );
  }

  // ── Running ────────────────────────────────────────────────────────────────
  const currentQuestion = questions[index];
  const currentAnswered = !!userAnswers[index];
  const allAnswered = Object.keys(userAnswers).length === questions.length;
  const urgent = remainingSeconds < 300;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="hidden" aria-hidden="true">
        <Timer durationSeconds={examDuration} initialSeconds={remainingSeconds} paused={isPaused} onExpire={() => submitExam(true)} onTick={handleTick} />
      </div>

      {isPaused && (
        <div className="fixed inset-0 z-20 bg-cream/90 backdrop-blur-sm flex flex-col items-center justify-center gap-5">
          <p className="font-display text-[28px] font-extrabold text-ink tracking-[-0.025em]">Paused</p>
          <p className="font-mono text-[11px] text-ink-muted uppercase tracking-[0.1em]">Timer is stopped</p>
          <button onClick={resumeExam} className="mt-2 px-8 py-3 rounded-xl bg-ink text-white font-display font-bold text-[15px] tracking-[-0.01em] hover:bg-ink/85 transition-colors">Resume →</button>
        </div>
      )}

      <div className="px-7 md:px-10 pt-6 pb-5 border-b border-cream-200">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[22px] font-extrabold text-ink tracking-[-0.025em] leading-none">Exam Simulator</h1>
          <div className="flex items-center gap-3">
            <span className={`font-display text-[24px] font-extrabold tnum leading-none ${urgent ? "text-status-red" : "text-ink"}`}>{formatTime(remainingSeconds)}</span>
            <button onClick={isPaused ? resumeExam : pauseExam} className="px-3 py-1.5 rounded-lg border border-cream-200 bg-card text-ink-muted text-sm font-semibold hover:bg-cream-100 transition-colors">{isPaused ? "▶" : "⏸"}</button>
          </div>
        </div>
      </div>

      <QuestionNavigator total={questions.length} current={index} userAnswers={userAnswers} feedbackMode={feedbackMode} onNavigate={(i) => setIndex(i)} />

      <div className="flex flex-1">
        <div className="flex-1 min-w-0 max-w-2xl px-7 md:px-10 py-8">
          <QuestionCard key={currentQuestion.id} question={currentQuestion} onAnswer={(isCorrect, selected) => handleAnswer(index, isCorrect, selected)} hideExplanation={!feedbackMode} examMode={!feedbackMode} initialAnswer={userAnswers[index]?.selected} />
          <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-cream-200">
            <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="px-5 py-2 rounded-lg border border-cream-200 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted disabled:opacity-40 hover:bg-cream-100 hover:text-ink transition-colors">← Prev</button>
            {index < questions.length - 1 ? (
              <button onClick={() => setIndex((i) => i + 1)} className="px-5 py-2 rounded-lg bg-ink text-white font-mono text-[10px] uppercase tracking-[0.12em] hover:bg-ink/85 transition-colors">Next →</button>
            ) : (
              <button onClick={() => submitExam(false)} disabled={!allAnswered} className="px-5 py-2 rounded-lg bg-status-green text-white font-mono text-[10px] uppercase tracking-[0.12em] disabled:opacity-40 hover:opacity-90 transition-opacity">Submit exam →</button>
            )}
          </div>
        </div>

        <aside className="hidden md:flex flex-col md:w-64 xl:flex-1 border-l border-cream-200">
          <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
            <div className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${urgent ? "bg-status-red" : "bg-amber-400"}`} /><span className="font-mono text-[9px] font-medium tracking-[0.15em] text-ink-faint uppercase">Explanation</span></div>
            <span className="font-mono text-[9px] text-ink-faint">#{currentQuestion.id}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {!currentAnswered || !feedbackMode ? (
              <div className="flex flex-col gap-4">
                <div className="space-y-2.5">{[100, 72, 100, 58, 85, 45, 92, 64, 78, 50].map((w, i) => <div key={i} className="h-[8px] rounded-full bg-cream-100" style={{ width: `${w}%` }} />)}</div>
                <div className="flex items-center gap-2 mt-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-faint shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <span className="font-mono text-[10px] text-ink-faint">{feedbackMode ? "Answer to reveal" : "Results after submission"}</span>
                </div>
              </div>
            ) : (
              <div className="animate-reveal space-y-3">
                {currentQuestion.explanation ? <p className="text-[13px] text-ink-muted leading-relaxed whitespace-pre-line">{currentQuestion.explanation}</p> : <p className="font-mono text-[10px] text-ink-faint leading-relaxed tracking-[0.05em]">No notes for this one —<br />your reasoning is the answer.</p>}
                {currentQuestion.reference && <a href={currentQuestion.reference} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-[11px] text-brand underline underline-offset-2 break-all hover:text-brand-dark transition-colors">{currentQuestion.reference}</a>}
              </div>
            )}
          </div>
          {allAnswered && (
            <div className="border-t border-cream-200 px-6 py-4 flex items-center justify-end">
              <button onClick={() => submitExam(false)} className="font-mono text-[9px] text-status-green hover:opacity-75 transition-opacity tracking-[0.1em] uppercase font-semibold">Submit →</button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
