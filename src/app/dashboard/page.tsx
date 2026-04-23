"use client";

import { useEffect, useState } from "react";
import { getAttemptStats, getExamHistory, getQuestionAttempts } from "@/lib/supabase";
import { getAllQuestions } from "@/lib/questions";
import { getUserId } from "@/lib/userId";
import { TOPICS } from "@/lib/topics";
import Link from "next/link";

interface ExamSession {
  id: string;
  mode: string;
  score: number;
  total: number;
  created_at: string;
  duration_ms: number | null;
  topic_scores?: Record<string, { correct: number; total: number }>;
}

function formatDuration(ms: number | null) {
  if (!ms) return "—";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

function accuracyBadge(pct: number) {
  if (pct >= 70) return { label: "PASSING", color: "bg-status-green-bg text-status-green border-status-green/30" };
  if (pct >= 50) return { label: "IMPROVING", color: "bg-status-orange-bg text-status-orange border-amber-200" };
  return { label: "NEEDS WORK", color: "bg-status-red-bg text-status-red border-red-200" };
}

interface QuestionStat {
  questionId: number;
  correct: number;
  total: number;
  pct: number;
  topic: string;
  text: string;
}

interface TopicStat {
  key: string;
  displayName: string;
  correct: number;
  total: number;
  pct: number;
}

export default function DashboardPage() {
  const allQuestions = getAllQuestions();
  const [stats, setStats] = useState<{ total: number; correct: number } | null>(null);
  const [history, setHistory] = useState<ExamSession[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStat[]>([]);
  const [topicStats, setTopicStats] = useState<TopicStat[]>([]);

  useEffect(() => {
    const userId = getUserId();
    Promise.all([
      getAttemptStats(userId),
      getExamHistory(userId),
      getQuestionAttempts(userId),
    ]).then(([s, h, attempts]) => {
      setStats(s);
      setHistory(h as ExamSession[]);

      // Build per-question stats
      const qMap: Record<number, { correct: number; total: number }> = {};
      attempts.forEach(({ question_id, is_correct }) => {
        if (!qMap[question_id]) qMap[question_id] = { correct: 0, total: 0 };
        qMap[question_id].total += 1;
        if (is_correct) qMap[question_id].correct += 1;
      });

      const qStats: QuestionStat[] = Object.entries(qMap).map(([qid, data]) => {
        const q = allQuestions.find((x) => x.id === Number(qid));
        const text = q && "text" in q ? (q.text as string).slice(0, 90) : `Question ${qid}`;
        return {
          questionId: Number(qid),
          correct: data.correct,
          total: data.total,
          pct: Math.round((data.correct / data.total) * 100),
          topic: q?.topic ?? "unknown",
          text,
        };
      });
      setQuestionStats(qStats.sort((a, b) => a.pct - b.pct || b.total - a.total));

      // Build per-topic stats from attempts (all modes)
      const tMap: Record<string, { correct: number; total: number }> = {};
      attempts.forEach(({ question_id, is_correct }) => {
        const q = allQuestions.find((x) => x.id === question_id);
        const topic = q?.topic ?? "unknown";
        if (!tMap[topic]) tMap[topic] = { correct: 0, total: 0 };
        tMap[topic].total += 1;
        if (is_correct) tMap[topic].correct += 1;
      });

      const tStats: TopicStat[] = Object.entries(tMap).map(([key, data]) => ({
        key,
        displayName: TOPICS.find((t) => t.key === key)?.displayName ?? key.replace(/_/g, " "),
        correct: data.correct,
        total: data.total,
        pct: Math.round((data.correct / data.total) * 100),
      }));
      setTopicStats(tStats.sort((a, b) => a.pct - b.pct));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accuracy = stats && stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;
  const examCount = history.length;
  const bestScore = history.length > 0 ? Math.max(...history.map((s) => Math.round((s.score / s.total) * 100))) : null;
  const avgScore = history.length > 0 ? Math.round(history.reduce((acc, s) => acc + (s.score / s.total) * 100, 0) / history.length) : null;

  const badge = accuracy != null ? accuracyBadge(accuracy) : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-5 md:px-8 pt-6 md:pt-8 pb-4 md:pb-5 border-b border-cream-200 flex-shrink-0">
        <p className="label-caps text-ink-faint mb-1">Home / <span className="text-ink-muted">Dashboard</span></p>
        <div className="flex items-end justify-between">
          <h1 className="font-display text-3xl font-bold text-ink tracking-tight">Your Progress</h1>
          {badge && (
            <span className={`font-mono text-[10px] font-semibold tracking-[0.14em] px-3 py-1 rounded-full uppercase border ${badge.color}`}>
              {badge.label}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        {/* Top stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            {
              label: "Questions Answered",
              value: stats?.total != null ? String(stats.total) : "—",
              sub: "all modes combined",
              accent: "border-t-brand",
            },
            {
              label: "Overall Accuracy",
              value: accuracy != null ? `${accuracy}%` : "—",
              sub: `${stats?.correct ?? 0} correct / ${stats?.total ?? 0} total`,
              accent: accuracy != null && accuracy >= 70 ? "border-t-status-green" : "border-t-status-red",
            },
            {
              label: "Exams Taken",
              value: String(examCount),
              sub: examCount === 1 ? "session recorded" : "sessions recorded",
              accent: "border-t-status-orange",
            },
            {
              label: "Best Exam Score",
              value: bestScore != null ? `${bestScore}%` : "—",
              sub: avgScore != null ? `avg ${avgScore}%` : "no exams yet",
              accent: bestScore != null && bestScore >= 70 ? "border-t-status-green" : "border-t-status-red",
            },
          ].map((item) => (
            <div key={item.label} className={`card p-5 border-t-2 ${item.accent} flex flex-col gap-2`}>
              <p className="label-caps">{item.label}</p>
              <p className="font-display text-3xl font-bold text-ink">{item.value}</p>
              <p className="text-xs text-ink-muted">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Middle row: accuracy bar + topic breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Accuracy bar */}
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-ink text-sm">Accuracy Breakdown</p>
              <span className="label-caps">{stats?.total ?? 0} attempts</span>
            </div>
            {stats && stats.total > 0 ? (
              <>
                <div className="w-full h-4 rounded-full overflow-hidden bg-cream-200 flex">
                  <div className="bg-status-green h-full transition-all duration-700 rounded-l-full" style={{ width: `${Math.round((stats.correct / stats.total) * 100)}%` }} />
                  <div className="bg-status-red h-full transition-all duration-700 rounded-r-full" style={{ width: `${Math.round(((stats.total - stats.correct) / stats.total) * 100)}%` }} />
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-green inline-block" />
                    <span className="text-xs text-ink-muted">Correct</span>
                    <span className="text-sm font-bold text-status-green ml-1">{stats.correct}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-red inline-block" />
                    <span className="text-xs text-ink-muted">Wrong</span>
                    <span className="text-sm font-bold text-status-red ml-1">{stats.total - stats.correct}</span>
                  </div>
                </div>
                <p className="text-xs text-ink-faint border-t border-cream-200 pt-3">
                  Pass threshold is <strong className="text-ink-muted">70%</strong> — you&apos;re at <strong className={accuracy != null && accuracy >= 70 ? "text-status-green" : "text-status-red"}>{accuracy ?? "—"}%</strong>
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-muted py-4 text-center">Answer some questions to see your breakdown.</p>
            )}
          </div>

          {/* Topic scores */}
          <div className="card p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-ink text-sm">Topics Breakdown</p>
              <span className="label-caps">all modes</span>
            </div>
            {topicStats.length > 0 ? topicStats.map((t) => (
              <div key={t.key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-muted">{t.displayName}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-ink-faint">{t.correct}/{t.total}</span>
                    <span className={`font-mono text-[11px] font-bold w-9 text-right ${t.pct >= 70 ? "text-status-green" : t.pct >= 50 ? "text-status-orange" : "text-status-red"}`}>{t.pct}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${t.pct >= 70 ? "bg-status-green" : t.pct >= 50 ? "bg-status-orange" : "bg-status-red"}`}
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-sm text-ink-muted py-4 text-center">Answer some questions to see per-topic scores.</p>
            )}
          </div>
        </div>

        {/* Per-question performance */}
        <div className="card overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
            <p className="font-semibold text-ink text-sm">Per-Question Performance</p>
            <span className="label-caps">{questionStats.length} answered · worst first</span>
          </div>
          {questionStats.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-ink-muted text-sm">Answer some questions to see per-question stats.</p>
            </div>
          ) : (
            <div className="divide-y divide-cream-200">
              {questionStats.map((q) => (
                <div key={q.questionId} className="px-6 py-3 flex items-center gap-4">
                  {/* Q# */}
                  <span className="font-mono text-[11px] text-ink-faint w-8 flex-shrink-0">Q{q.questionId}</span>
                  {/* Topic badge */}
                  <span className={`font-mono text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                    q.pct >= 70 ? "bg-status-green-bg text-status-green" :
                    q.pct >= 50 ? "bg-status-orange-bg text-status-orange" :
                    "bg-status-red-bg text-status-red"
                  }`}>
                    {TOPICS.find((t) => t.key === q.topic)?.displayName ?? q.topic}
                  </span>
                  {/* Text snippet */}
                  <p className="text-xs text-ink-muted flex-1 min-w-0 truncate hidden sm:block">{q.text}…</p>
                  {/* Bar + stats */}
                  <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
                    <div className="w-20 h-1.5 rounded-full bg-cream-200 overflow-hidden hidden md:block">
                      <div
                        className={`h-full rounded-full ${q.pct >= 70 ? "bg-status-green" : q.pct >= 50 ? "bg-status-orange" : "bg-status-red"}`}
                        style={{ width: `${q.pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-ink-faint w-10 text-right">{q.correct}/{q.total}</span>
                    <span className={`font-mono text-[12px] font-bold w-9 text-right ${q.pct >= 70 ? "text-status-green" : q.pct >= 50 ? "text-status-orange" : "text-status-red"}`}>
                      {q.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exam history */}
        <div className="card overflow-hidden mb-5">
          <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
            <p className="font-semibold text-ink text-sm">Exam History</p>
            <span className="label-caps">last 10 sessions</span>
          </div>
          {history.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-ink-muted text-sm mb-3">No exam sessions yet.</p>
              <Link href="/exam" className="inline-block px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors">
                Take your first exam →
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50">
                  <th className="text-left px-6 py-3 label-caps">Date</th>
                  <th className="text-left px-6 py-3 label-caps">Mode</th>
                  <th className="text-center px-6 py-3 label-caps">Score</th>
                  <th className="text-center px-6 py-3 label-caps">Result</th>
                  <th className="text-right px-6 py-3 label-caps">Duration</th>
                </tr>
              </thead>
              <tbody>
                {history.map((session, i) => {
                  const pct = Math.round((session.score / session.total) * 100);
                  const passed = pct >= 70;
                  return (
                    <tr key={session.id} className={`border-b border-cream-200 last:border-0 ${i % 2 === 0 ? "" : "bg-cream-50/50"}`}>
                      <td className="px-6 py-3.5 text-ink-muted text-xs font-mono">
                        {new Date(session.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-3.5 text-ink capitalize font-medium text-[13px]">
                        {session.mode.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-3.5 text-center font-mono font-bold text-ink">
                        {session.score}<span className="text-ink-faint font-normal">/{session.total}</span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${passed ? "bg-status-green-bg text-status-green border-status-green/20" : "bg-status-red-bg text-status-red border-red-200"}`}>
                          {pct}% · {passed ? "PASS" : "FAIL"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-ink-faint text-xs font-mono">
                        {formatDuration(session.duration_ms)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <Link href="/exam" className="px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors">
            New Exam
          </Link>
          <Link href="/study/sequential" className="px-5 py-2.5 rounded-lg border border-cream-200 bg-card text-ink text-sm font-semibold hover:bg-cream-100 transition-colors">
            Study Mode
          </Link>
        </div>
      </div>
    </div>
  );
}

