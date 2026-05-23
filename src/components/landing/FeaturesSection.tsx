"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const features = [
  {
    title: "4 Modalità di Studio",
    description:
      "Sequenziale, casuale, simulazione Microsoft e flashcard. Scegli l'approccio che si adatta al tuo stile di apprendimento.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: "Esame Simulato",
    description:
      "50 domande, 45 minuti — identico all'esame AI-900 reale. Soglia di superamento al 70%. Risultati immediati e dettagliati.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  },
  {
    title: "Dashboard Analytics",
    description:
      "Accuracy per topic, storico degli esami, domande più sbagliate. Sai esattamente dove concentrarti per migliorare.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="3" y1="20" x2="21" y2="20" />
      </svg>
    ),
  },
  {
    title: "400+ Domande",
    description:
      "Question bank curato con contenuto ufficiale Microsoft. Copre tutti i domini di ogni certificazione disponibile sulla piattaforma.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="8" y1="5" x2="8" y2="19" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".features-heading", {
        immediateRender: false,
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".features-heading",
          start: "top 85%",
        },
      });

      gsap.from(".feature-card", {
        immediateRender: false,
        y: 32,
        opacity: 0,
        stagger: 0.12,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 85%",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="px-7 md:px-14 lg:px-20 py-24 border-t border-cream-200"
    >
      {/* Heading */}
      <div className="features-heading mb-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-[5px] h-[5px] rounded-sm bg-brand shrink-0" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Funzionalità
          </span>
        </div>
        <h2 className="font-display font-extrabold text-[36px] md:text-[48px] tracking-[-0.03em] leading-[0.95] text-ink">
          Tutto ciò che ti serve
          <br />
          <span className="text-ink-faint">per passare l&apos;esame.</span>
        </h2>
      </div>

      {/* Grid */}
      <div className="features-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="feature-card group bg-white rounded-xl border border-cream-200 p-7 hover:border-brand/25 hover:shadow-md transition-all duration-200"
          >
            <div className="text-brand mb-4 group-hover:scale-110 transition-transform duration-200 origin-left">{feature.icon}</div>
            <h3 className="font-display font-bold text-[18px] text-ink tracking-[-0.02em] mb-2">
              {feature.title}
            </h3>
            <p className="text-[13px] text-ink-muted leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
