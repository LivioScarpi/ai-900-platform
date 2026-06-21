import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { CSSProperties } from "react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCertVideoQuestions } from "@/lib/questions";
import { getCertConfig } from "@/lib/certifications";
import { TOPICS } from "@/lib/topics";

export default async function TopicSelectorPage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const { certId } = await params;
  const config = getCertConfig(certId);
  if (!config) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const allQuestions = getCertVideoQuestions(certId);

  const { data: questionAttempts } = await supabase
    .from("attempts")
    .select("question_id, is_correct")
    .eq("user_id", user.id)
    .eq("cert_id", certId);

  const tMap: Record<string, { correct: number; total: number }> = {};
  (questionAttempts ?? []).forEach(({ question_id, is_correct }) => {
    const q = allQuestions.find((x) => x.id === question_id);
    const topic = q?.topic ?? "unknown";
    if (!tMap[topic]) tMap[topic] = { correct: 0, total: 0 };
    tMap[topic].total += 1;
    if (is_correct) tMap[topic].correct += 1;
  });

  const topics = TOPICS.map((t) => {
    const count = allQuestions.filter((q) => q.topic === t.key).length;
    const stats = tMap[t.key];
    const pct = stats && stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;
    return { ...t, count, stats, pct };
  })
    .filter((t) => t.count > 0)
    .map((t, i) => ({ ...t, index: String(i + 1).padStart(2, "0") }));

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-7 md:px-12 lg:px-16 pt-10 md:pt-12 pb-8 border-b border-cream-200">
        <Link
          href={`/${certId}`}
          className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.12em] hover:text-ink transition-colors mb-4 inline-block"
        >
          ← {config.name}
        </Link>
        <h1 className="font-display font-extrabold tracking-[-0.035em] leading-[0.95] text-ink">
          <span className="block text-[42px] md:text-[52px]">By Topic</span>
          <span className="block text-[42px] md:text-[52px] text-ink-faint">Choose your focus</span>
        </h1>
        <p className="font-mono text-[11px] text-ink-faint mt-4 max-w-md leading-relaxed">
          Pick a topic to drill exclusively into those questions. Questions are served in random order.
        </p>
      </div>

      <div className="flex flex-col">
        {topics.map((topic) => (
          <Link
            key={topic.key}
            href={`/${certId}/study/topic/${topic.key}`}
            className="group flex items-center gap-5 px-7 md:px-12 lg:px-16 py-6 border-b border-cream-200 hover:bg-white transition-colors duration-150"
            style={{ "--mode-color": topic.color } as CSSProperties}
          >
            {/* Badge */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: topic.color }}
            >
              <span className="font-mono text-[10px] font-semibold text-white leading-none">{topic.index}</span>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-[18px] md:text-[20px] font-bold text-ink tracking-[-0.02em] leading-tight transition-colors duration-150 group-hover:text-[var(--mode-color)]">
                {topic.displayName}
              </h2>
              <div className="mt-2 flex items-center gap-4 max-w-xs">
                {topic.pct !== null ? (
                  <>
                    <div className="flex-1 h-1.5 rounded-full bg-cream-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${topic.pct >= 70 ? "bg-status-green" : topic.pct >= 50 ? "bg-status-orange" : "bg-status-red"}`}
                        style={{ width: `${topic.pct}%` }}
                      />
                    </div>
                    <span className={`font-mono text-[11px] font-bold shrink-0 ${topic.pct >= 70 ? "text-status-green" : topic.pct >= 50 ? "text-status-orange" : "text-status-red"}`}>
                      {topic.pct}%
                    </span>
                  </>
                ) : (
                  <span className="font-mono text-[10px] text-ink-faint">No attempts yet</span>
                )}
              </div>
            </div>

            {/* Stat + arrow */}
            <div className="hidden sm:flex items-baseline gap-3 shrink-0">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-[20px] font-extrabold tnum leading-none" style={{ color: topic.color }}>
                  {topic.count}
                </span>
                <span className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.1em]">questions</span>
              </div>
              <span className="font-mono text-[13px] transition-transform duration-150 group-hover:translate-x-1 inline-block" style={{ color: topic.color }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
