"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const testimonials = [
  {
    quote:
      "Ho superato l'AI-900 al primo tentativo dopo due settimane su questa piattaforma. Le domande simulate sono praticamente identiche all'esame reale.",
    name: "Marco T.",
    role: "Cloud Engineer",
    score: "900/1000",
  },
  {
    quote:
      "Finalmente uno strumento gratuito che funziona davvero. La modalità flashcard mi ha aiutato a memorizzare tutti i concetti chiave in poco tempo.",
    name: "Sara M.",
    role: "IT Manager",
    score: "860/1000",
  },
  {
    quote:
      "Stavo cercando materiale per il DP-900 e questa piattaforma è stata una scoperta. Chiaro, diretto, senza distrazioni inutili.",
    name: "Luca B.",
    role: "Data Analyst",
    score: "880/1000",
  },
];

export function TestimonialsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".testimonials-heading", {
        immediateRender: false,
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".testimonials-heading",
          start: "top 85%",
        },
      });

      gsap.from(".testimonial-card", {
        immediateRender: false,
        y: 28,
        opacity: 0,
        stagger: 0.14,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".testimonials-grid",
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
      <div className="testimonials-heading mb-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-[5px] h-[5px] rounded-sm bg-brand shrink-0" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Chi l&apos;ha già fatto
          </span>
        </div>
        <h2 className="font-display font-extrabold text-[36px] md:text-[48px] tracking-[-0.03em] leading-[0.95] text-ink">
          Risultati reali,
          <br />
          <span className="text-ink-faint">studenti veri.</span>
        </h2>
      </div>

      {/* Grid */}
      <div className="testimonials-grid grid grid-cols-1 md:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="testimonial-card flex flex-col bg-white rounded-xl border border-cream-200 p-7 hover:border-brand/20 hover:shadow-md transition-all duration-200"
          >
            {/* Score badge */}
            <div className="flex items-center gap-2 mb-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand bg-brand/8 px-2.5 py-1 rounded">
                {t.score}
              </span>
            </div>

            {/* Quote */}
            <p className="text-[13px] text-ink-muted leading-relaxed flex-1 mb-6">
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-5 border-t border-cream-200">
              <div className="w-8 h-8 rounded-full bg-ink/8 flex items-center justify-center shrink-0">
                <span className="font-mono text-[11px] font-semibold text-ink-muted">
                  {t.name[0]}
                </span>
              </div>
              <div>
                <p className="font-mono text-[11px] font-semibold text-ink tracking-[-0.01em]">
                  {t.name}
                </p>
                <p className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.1em]">
                  {t.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
