import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCertQuestions } from "@/lib/questions";
import { getCertConfig } from "@/lib/certifications";
import { TOPICS } from "@/lib/topics";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ExamSession {
  id: string; mode: string; score: number; total: number;
  created_at: string; duration_ms: number | null;
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

export default async function DashboardPage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = await params;
  const config = getCertConfig(certId);
  if (!config) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const allQuestions = getCertQuestions(certId);

  const [attemptsRes, historyRes, questionAttemptsRes] = await Promise.all([
    supabase.from("attempts").select("is_correct").eq("user_id", user.id),
    supabase.from("exam_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("attempts").select("question_id, is_correct").eq("user_id", user.id),
  ]);

  const attempts = attemptsRes.data ?? [];
  const history = (historyRes.data ?? []) as ExamSession[];
  const questionAttempts = questionAttemptsRes.data ?? [];

  const total = attempts.length;
  const correct = attempts.filter((r) => r.is_correct).length;

  const qMap: Record<number, { correct: number; total: number }> = {};
  questionAttempts.forEach(({ question_id, is_correct }) => {
    if (!qMap[question_id]) qMap[question_id] = { correct: 0, total: 0 };
    qMap[question_id].total += 1;
    if (is_correct) qMap[question_id].correct += 1;
  });
  const questionStats = Object.entries(qMap).map(([qid, data]) => {
    const q = allQuestions.find((x) => x.id === Number(qid));
    const text = q && "text" in q ? (q.text as string).slice(0, 90) : `Question ${qid}`;
    return { questionId: Number(qid), correct: data.correct, total: data.total, pct: Math.round((data.correct / data.total) * 100), topic: q?.topic ?? "unknown", text };
  }).sort((a, b) => a.pct - b.pct || b.total - a.total);

  const tMap: Record<string, { correct: number; total: number }> = {};
  questionAttempts.forEach(({ question_id, is_correct }) => {
    const q = allQuestions.find((x) => x.id === question_id);
    const topic = q?.topic ?? "unknown";
    if (!tMap[topic]) tMap[topic] = { correct: 0, total: 0 };
    tMap[topic].total += 1;
    if (is_correct) tMap[topic].correct += 1;
  });
  const topicStats = Object.entries(tMap).map(([key, data]) => ({
    key, displayName: TOPICS.find((t) => t.key === key)?.displayName ?? key.replace(/_/g, " "),
    correct: data.correct, total: data.total, pct: Math.round((data.correct / data.total) * 100),
  })).sort((a, b) => a.pct - b.pct);

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : null;
  const bestScore = history.length > 0 ? Math.max(...history.map((s) => Math.round((s.score / s.total) * 100))) : null;
  const avgScore = history.length > 0 ? Math.round(history.reduce((acc, s) => acc + (s.score / s.total) * 100, 0) / history.length) : null;
  const badge = accuracy != null ? accuracyBadge(accuracy) : null;
  const homeHref = `/${certId}`;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="px-7 md:px-10 pt-8 pb-6 border-b border-cream-200 flex-shrink-0">
        <div className="flex items-end justify-between mt-4">
          <h1 className="font-display text-[28px] md:text-[34px] font-extrabold text-ink tracking-[-0.025em] leading-none">Your Progress</h1>
          {badge && (
            <span className={`font-mono text-[10px] font-medium tracking-[0.12em] px-3 py-1.5 rounded-full uppercase border mb-0.5 ${badge.color}`}>{badge.label}</span>
          )}
        </div>
        <p className="font-mono text-[10px] text-ink-faint mt-1.5 tracking-[0.1em] uppercase">{config.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-7 md:px-10 py-8 border-b border-cream-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
            {[
              { label: "Questions answered", value: total > 0 ? String(total) : "—", sub: "all modes combined" },
              { label: "Overall accuracy", value: accuracy != null ? `${accuracy}%` : "—", sub: `${correct} correct · ${total - correct} wrong` },
              { label: "Exams taken", value: String(history.length), sub: `${history.length} session${history.length !== 1 ? "s" : ""}` },
              { label: "Best exam score", value: bestScore != null ? `${bestScore}%` : "—", sub: avgScore != null ? `avg ${avgScore}%` : "no exams yet" },
            ].map((item) => (
              <div key={item.label}>
                <p className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em] mb-1.5">{item.label}</p>
                <p className="font-display text-[38px] md:text-[44px] font-extrabold text-ink tracking-[-0.035em] leading-none tnum">{item.value}</p>
                <p className="font-mono text-[10px] text-ink-faint mt-1.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-cream-200 border-b border-cream-200">
          <div className="px-7 md:px-10 py-7 border-b lg:border-b-0 border-cream-200">
            <div className="flex items-center justify-between mb-5">
              <p className="font-display text-[15px] font-bold text-ink">Accuracy</p>
              <span className="font-mono text-[10px] text-ink-faint">{total} attempts</span>
            </div>
            {total > 0 ? (
              <div className="space-y-4">
                <div className="w-full h-2.5 rounded-full overflow-hidden bg-cream-200 flex">
                  <div className="bg-status-green h-full transition-all duration-700" style={{ width: `${Math.round((correct / total) * 100)}%` }} />
                  <div className="bg-status-red h-full transition-all duration-700" style={{ width: `${Math.round(((total - correct) / total) * 100)}%` }} />
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-status-green" /><span className="font-mono text-[10px] text-ink-muted">Correct <strong className="text-status-green">{correct}</strong></span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-status-red" /><span className="font-mono text-[10px] text-ink-muted">Wrong <strong className="text-status-red">{total - correct}</strong></span></div>
                </div>
                <p className="font-mono text-[10px] text-ink-faint pt-1 border-t border-cream-200">
                  Pass mark is {config.passmarkPct}% — you&apos;re at{" "}
                  <strong className={accuracy != null && accuracy >= config.passmarkPct ? "text-status-green" : "text-status-red"}>{accuracy ?? "—"}%</strong>
                </p>
              </div>
            ) : (
              <p className="font-mono text-[11px] text-ink-faint">Answer some questions to see your breakdown.</p>
            )}
          </div>

          <div className="px-7 md:px-10 py-7">
            <div className="flex items-center justify-between mb-5">
              <p className="font-display text-[15px] font-bold text-ink">Topics</p>
              <span className="font-mono text-[10px] text-ink-faint">all modes</span>
            </div>
            {topicStats.length > 0 ? (
              <div className="space-y-3">
                {topicStats.map((t) => (
                  <div key={t.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] text-ink-muted">{t.displayName}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-ink-faint">{t.correct}/{t.total}</span>
                        <span className={`font-mono text-[11px] font-bold w-8 text-right ${t.pct >= 70 ? "text-status-green" : t.pct >= 50 ? "text-status-orange" : "text-status-red"}`}>{t.pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-cream-200 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${t.pct >= 70 ? "bg-status-green" : t.pct >= 50 ? "bg-status-orange" : "bg-status-red"}`} style={{ width: `${t.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-[11px] text-ink-faint">Answer some questions to see per-topic scores.</p>
            )}
          </div>
        </div>

        {/* Exam history */}
        <div className="border-b border-cream-200">
          <div className="px-7 md:px-10 py-5 flex items-center justify-between border-b border-cream-200">
            <p className="font-display text-[15px] font-bold text-ink">Exam History</p>
            <span className="font-mono text-[10px] text-ink-faint">last 10 sessions</span>
          </div>
          {history.length === 0 ? (
            <div className="px-7 md:px-10 py-10">
              <p className="font-mono text-[11px] text-ink-faint mb-4">No exam sessions yet.</p>
              <Link href={`/${certId}/exam`} className="inline-block px-5 py-2.5 rounded-lg bg-ink text-white text-[13px] font-semibold hover:bg-ink/85 transition-colors">Take your first exam →</Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="text-left px-7 md:px-10 py-3 font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em]">Date</th>
                  <th className="text-left px-3 py-3 font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em]">Mode</th>
                  <th className="text-center px-3 py-3 font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em]">Score</th>
                  <th className="text-center px-3 py-3 font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em]">Result</th>
                  <th className="text-right px-7 md:px-10 py-3 font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em]">Duration</th>
                </tr>
              </thead>
              <tbody>
                {history.map((session) => {
                  const pct = Math.round((session.score / session.total) * 100);
                  const passed = pct >= config.passmarkPct;
                  return (
                    <tr key={session.id} className="border-b border-cream-200 last:border-0 hover:bg-white transition-colors">
                      <td className="px-7 md:px-10 py-3.5 font-mono text-[10px] text-ink-faint">{new Date(session.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="px-3 py-3.5 font-mono text-[11px] text-ink-muted capitalize">{session.mode.replace(/_/g, " ")}</td>
                      <td className="px-3 py-3.5 text-center font-mono text-[12px] font-semibold text-ink">{session.score}<span className="text-ink-faint font-normal">/{session.total}</span></td>
                      <td className="px-3 py-3.5 text-center">
                        <span className={`font-mono text-[10px] font-medium px-2 py-0.5 rounded-full border ${passed ? "bg-status-green-bg text-status-green border-status-green/20" : "bg-status-red-bg text-status-red border-red-200"}`}>{pct}% · {passed ? "pass" : "fail"}</span>
                      </td>
                      <td className="px-7 md:px-10 py-3.5 text-right font-mono text-[10px] text-ink-faint">{formatDuration(session.duration_ms)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-7 md:px-10 py-6 flex gap-3">
          <Link href={`/${certId}/exam`} className="px-5 py-2.5 rounded-lg bg-ink text-white text-[13px] font-semibold hover:bg-ink/85 transition-colors">New exam →</Link>
          <Link href={`/${certId}/study/sequential`} className="px-5 py-2.5 rounded-lg border border-cream-200 bg-card text-ink-muted text-[13px] font-semibold hover:bg-cream-100 transition-colors">Study mode</Link>
        </div>
      </div>
    </div>
  );
}
