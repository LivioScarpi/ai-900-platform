import Link from "next/link";
import { getAllCertConfigs, type CertConfig } from "@/lib/certifications";
import { getCertQuestions } from "@/lib/questions";

function CertCard({ cert }: { cert: CertConfig }) {
  const total = getCertQuestions(cert.id).length;

  return (
    <Link
      href={`/${cert.id}`}
      className="group flex flex-col border-b border-cream-200 px-7 md:px-14 lg:px-20 py-8 hover:bg-white transition-colors duration-150"
    >
      <div className="flex items-start justify-between gap-6">
        {/* Left: cert info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: cert.color }}
            />
            <span className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.14em]">
              {cert.provider}
            </span>
          </div>

          <h2 className="font-display text-[36px] md:text-[44px] font-extrabold text-ink tracking-[-0.035em] leading-none mb-2 group-hover:opacity-80 transition-opacity">
            {cert.name}
          </h2>
          <p className="font-display text-[18px] md:text-[22px] font-bold text-ink-faint tracking-[-0.02em] leading-tight mb-4">
            {cert.fullName}
          </p>
          <p className="text-[13px] text-ink-faint leading-relaxed max-w-lg">
            {cert.description}
          </p>
        </div>

        {/* Right: stats */}
        <div className="hidden sm:flex flex-col items-end gap-4 shrink-0 pt-1">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[28px] font-extrabold tnum leading-none" style={{ color: cert.color }}>
              {total}
            </span>
            <span className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.1em]">q.</span>
          </div>
          <span
            className="font-mono text-[14px] transition-transform duration-150 group-hover:translate-x-1 inline-block"
            style={{ color: cert.color }}
          >
            →
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-5 mt-6 pt-5 border-t border-cream-200">
        {[
          { label: "Questions", value: String(total) },
          { label: "Duration", value: `${cert.examDurationMin} min` },
          { label: "Pass mark", value: `${cert.passmarkPct}%` },
          { label: "4 study modes", value: null },
        ].map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-1.5">
            {stat.value && (
              <span className="font-mono text-[11px] font-semibold text-ink">{stat.value}</span>
            )}
            <span className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.1em]">{stat.label}</span>
          </div>
        ))}
      </div>
    </Link>
  );
}

function ComingSoonCard() {
  return (
    <div className="flex flex-col border-b border-cream-200 px-7 md:px-14 lg:px-20 py-8 opacity-40 select-none">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-2 h-2 rounded-full bg-ink-faint shrink-0" />
        <span className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.14em]">More coming</span>
      </div>
      <h2 className="font-display text-[36px] md:text-[44px] font-extrabold text-ink-faint tracking-[-0.035em] leading-none mb-2">
        AZ-900
      </h2>
      <p className="font-display text-[18px] md:text-[22px] font-bold text-ink-faint tracking-[-0.02em] leading-tight">
        Microsoft Azure Fundamentals
      </p>
      <div className="mt-4">
        <span className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em] border border-cream-200 rounded px-2 py-1">
          Coming soon
        </span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const certs = getAllCertConfigs();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-7 md:px-14 lg:px-20 pt-12 md:pt-16 pb-10 border-b border-cream-200">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="w-[7px] h-[7px] rounded-sm bg-brand shrink-0" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            Study Platform
          </span>
        </div>
        <h1 className="font-display font-extrabold tracking-[-0.035em] leading-[0.92] text-ink mb-5">
          <span className="block text-[48px] md:text-[64px]">Certification</span>
          <span className="block text-[48px] md:text-[64px] text-ink-faint">Study Hub</span>
        </h1>
        <p className="text-[14px] text-ink-muted leading-relaxed">
          Practice exams, study modes, and performance tracking for professional certifications.
        </p>
      </div>

      {/* Cert list */}
      <div className="flex flex-col">
        <div className="px-7 md:px-14 lg:px-20 py-4 border-b border-cream-200">
          <span className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.14em]">
            {certs.length} certification{certs.length !== 1 ? "s" : ""} available
          </span>
        </div>
        {certs.map((cert) => (
          <CertCard key={cert.id} cert={cert} />
        ))}
        <ComingSoonCard />
      </div>
    </div>
  );
}
