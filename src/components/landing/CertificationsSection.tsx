"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const certifications = [
  {
    code: "AI-900",
    name: "Azure AI Fundamentals",
    description:
      "Concetti di base di machine learning, servizi cognitive di Azure, NLP, computer vision e AI responsabile.",
    topics: ["Machine Learning", "Computer Vision", "NLP", "Azure AI Services"],
    questions: 400,
    duration: "45 min",
    available: true,
    href: "/login",
  },
  {
    code: "DP-900",
    name: "Azure Data Fundamentals",
    description:
      "Concetti core sui dati, servizi di dati relazionali e non relazionali, analytics e Azure Data Factory.",
    topics: ["Relational Data", "Non-Relational Data", "Analytics", "Azure Data Factory"],
    questions: 280,
    duration: "45 min",
    available: true,
    href: "/login",
  },
  {
    code: "AZ-900",
    name: "Azure Fundamentals",
    description:
      "Concetti fondamentali del cloud, architettura Azure, pricing, SLA e lifecycle dei servizi.",
    topics: ["Cloud Concepts", "Azure Architecture", "Security", "Pricing"],
    questions: null,
    duration: "45 min",
    available: false,
    href: null,
  },
];

export function CertificationsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".certs-heading", {
        immediateRender: false,
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ".certs-heading", start: "top 85%" },
      });

      gsap.from(".cert-card", {
        immediateRender: false,
        y: 28,
        opacity: 0,
        stagger: 0.14,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ".certs-grid", start: "top 85%" },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="certificazioni"
      ref={containerRef}
      className="px-7 md:px-14 lg:px-20 py-24 border-t border-cream-200"
    >
      {/* Heading */}
      <div className="certs-heading mb-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-[5px] h-[5px] rounded-sm bg-brand shrink-0" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Certificazioni disponibili
          </span>
        </div>
        <h2 className="font-display font-extrabold text-[36px] md:text-[48px] tracking-[-0.03em] leading-[0.95] text-ink">
          Su cosa vuoi
          <br />
          <span className="text-ink-faint">prepararti?</span>
        </h2>
      </div>

      {/* Grid */}
      <div className="certs-grid grid grid-cols-1 md:grid-cols-3 gap-4">
        {certifications.map((cert) => (
          <div
            key={cert.code}
            className={`cert-card flex flex-col rounded-xl border p-7 transition-all duration-200 ${
              cert.available
                ? "bg-white border-cream-200 hover:border-brand/25 hover:shadow-md"
                : "bg-cream-50 border-cream-200 opacity-60"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand block mb-1">
                  {cert.code}
                </span>
                <h3 className="font-display font-bold text-[17px] text-ink tracking-[-0.02em] leading-tight">
                  {cert.name}
                </h3>
              </div>
              {!cert.available && (
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint bg-cream-200 px-2 py-1 rounded shrink-0 ml-3">
                  In arrivo
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-[13px] text-ink-muted leading-relaxed mb-5 flex-1">
              {cert.description}
            </p>

            {/* Topics */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {cert.topics.map((topic) => (
                <span
                  key={topic}
                  className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint border border-cream-200 px-2 py-1 rounded"
                >
                  {topic}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-5 border-t border-cream-200">
              <div className="flex items-center gap-4">
                {cert.questions && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                    {cert.questions}+ domande
                  </span>
                )}
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                  {cert.duration}
                </span>
              </div>
              {cert.available && cert.href && (
                <Link
                  href={cert.href}
                  className="font-mono text-[10px] uppercase tracking-[0.12em] text-brand hover:opacity-70 transition-opacity flex items-center gap-1"
                >
                  Studia <span>→</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
