import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAllCertConfigs, getCertConfig } from "@/lib/certifications";
import { CertDashboard } from "@/components/CertDashboard";
import Link from "next/link";

interface ExamSessionRow { score: number; total: number; cert_id: string | null }

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ cert?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const certs = getAllCertConfigs();

  // ── Global account KPIs (across all certifications) ──────────────────────
  const [attemptsRes, examsRes] = await Promise.all([
    supabase.from("attempts").select("is_correct, cert_id").eq("user_id", user.id),
    supabase.from("exam_sessions").select("score, total, cert_id").eq("user_id", user.id),
  ]);
  const attempts = attemptsRes.data ?? [];
  const exams = (examsRes.data ?? []) as ExamSessionRow[];

  const total = attempts.length;
  const correct = attempts.filter((r) => r.is_correct).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : null;
  const bestScore = exams.length > 0 ? Math.max(...exams.map((s) => Math.round((s.score / s.total) * 100))) : null;
  const certsStarted = new Set(attempts.map((a) => a.cert_id).filter(Boolean)).size;

  // ── Selected cert for the embedded per-cert dashboard ────────────────────
  const { cert } = await searchParams;
  const selectedId = (cert && getCertConfig(cert)) ? cert : certs[0]?.id;
  const selectedConfig = selectedId ? getCertConfig(selectedId) : null;

  const globalKpis = [
    { label: "Questions answered", value: total > 0 ? String(total) : "—", sub: "across all certs" },
    { label: "Overall accuracy", value: accuracy != null ? `${accuracy}%` : "—", sub: `${correct} correct · ${total - correct} wrong` },
    { label: "Exams taken", value: String(exams.length), sub: `${exams.length} session${exams.length !== 1 ? "s" : ""}` },
    { label: "Certs in progress", value: certsStarted > 0 ? String(certsStarted) : "—", sub: bestScore != null ? `best exam ${bestScore}%` : "no exams yet" },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Global header */}
      <div className="px-7 md:px-10 pt-8 pb-6 border-b border-cream-200 flex-shrink-0">
        <Link href="/" className="font-mono text-[10px] text-ink-faint hover:text-ink transition-colors tracking-[0.1em] uppercase">
          ← Home
        </Link>
        <h1 className="font-display text-[28px] md:text-[34px] font-extrabold text-ink tracking-[-0.025em] leading-none mt-4">
          Your Account
        </h1>
        <p className="font-mono text-[10px] text-ink-faint mt-1.5 tracking-[0.1em] uppercase">Global overview across all certifications</p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Global KPIs */}
        <div className="px-7 md:px-10 py-8 border-b border-cream-200 bg-cream-100/40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
            {globalKpis.map((item) => (
              <div key={item.label}>
                <p className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em] mb-1.5">{item.label}</p>
                <p className="font-display text-[38px] md:text-[44px] font-extrabold text-ink tracking-[-0.035em] leading-none tnum">{item.value}</p>
                <p className="font-mono text-[10px] text-ink-faint mt-1.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cert selector tabs */}
        <div className="px-7 md:px-10 pt-7 pb-0 border-b border-cream-200">
          <p className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em] mb-3">Per-certification stats</p>
          <div className="flex gap-2 flex-wrap">
            {certs.map((c) => {
              const active = c.id === selectedId;
              return (
                <Link
                  key={c.id}
                  href={`/dashboard?cert=${c.id}`}
                  scroll={false}
                  className={`font-mono text-[11px] tracking-[0.04em] px-4 py-2 rounded-t-lg border border-b-0 transition-colors ${
                    active
                      ? "bg-card text-ink border-cream-200 -mb-px"
                      : "bg-transparent text-ink-faint border-transparent hover:text-ink hover:bg-cream-100"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Selected cert dashboard */}
        {selectedConfig ? (
          <CertDashboard certId={selectedConfig.id} config={selectedConfig} showHeader={false} />
        ) : (
          <div className="px-7 md:px-10 py-10">
            <p className="font-mono text-[11px] text-ink-faint">No certifications available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
