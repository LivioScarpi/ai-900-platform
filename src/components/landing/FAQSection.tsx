"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const faqs = [
  {
    question: "La piattaforma è davvero gratuita?",
    answer:
      "Sì, completamente gratuita. Nessuna carta di credito, nessun abbonamento nascosto. Crea un account e inizia a studiare subito.",
  },
  {
    question: "Quali certificazioni sono disponibili?",
    answer:
      "Al momento copriamo AI-900 (Azure AI Fundamentals) e DP-900 (Azure Data Fundamentals). Altre certificazioni Microsoft sono in arrivo.",
  },
  {
    question: "Come funziona la modalità esame simulato?",
    answer:
      "50 domande casuali estratte dal question bank, 45 minuti di tempo — identico all'esame AI-900 reale. La soglia di superamento è 700/1000 (70%). Al termine ricevi un report dettagliato con la tua performance per topic.",
  },
  {
    question: "Quanto tempo serve per prepararsi?",
    answer:
      "Dipende dalla tua base di partenza. La maggior parte degli utenti si sente pronta in 2–4 settimane studiando 30–45 minuti al giorno. Usa la dashboard analytics per capire su cosa concentrarti.",
  },
  {
    question: "Posso studiare da mobile?",
    answer:
      "Sì, la piattaforma è completamente responsive. Funziona su qualsiasi dispositivo — desktop, tablet o smartphone.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (open) {
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.28, ease: "power2.out" }
      );
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.22,
        ease: "power2.in",
      });
    }
  }, [open]);

  return (
    <div className="border-b border-cream-200 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="font-display font-semibold text-[15px] text-ink tracking-[-0.015em] group-hover:text-brand transition-colors duration-150">
          {question}
        </span>
        <span
          className={`shrink-0 w-5 h-5 rounded-full border border-cream-200 flex items-center justify-center transition-all duration-200 group-hover:border-brand/40 ${
            open ? "bg-brand border-brand rotate-45" : ""
          }`}
        >
          <svg
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="none"
            className={open ? "text-white" : "text-ink-faint"}
          >
            <line x1="4.5" y1="1" x2="4.5" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="1" y1="4.5" x2="8" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      <div ref={bodyRef} style={{ height: 0, overflow: "hidden", opacity: 0 }}>
        <p className="text-[13px] text-ink-muted leading-relaxed pb-5">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function FAQSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".faq-heading", {
        immediateRender: false,
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ".faq-heading", start: "top 85%" },
      });

      gsap.from(".faq-body", {
        immediateRender: false,
        y: 16,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ".faq-body", start: "top 85%" },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="px-7 md:px-14 lg:px-20 py-24 border-t border-cream-200"
    >
      <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:items-start">
        {/* Heading */}
        <div className="faq-heading mb-10 lg:mb-0 lg:sticky lg:top-24">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-[5px] h-[5px] rounded-sm bg-brand shrink-0" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              FAQ
            </span>
          </div>
          <h2 className="font-display font-extrabold text-[36px] md:text-[44px] tracking-[-0.03em] leading-[0.95] text-ink mb-4">
            Domande
            <br />
            <span className="text-ink-faint">frequenti.</span>
          </h2>
          <p className="text-[13px] text-ink-muted leading-relaxed">
            Non trovi quello che cerchi?{" "}
            <a
              href="mailto:info@example.com"
              className="text-brand hover:underline"
            >
              Scrivici.
            </a>
          </p>
        </div>

        {/* Items */}
        <div className="faq-body">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
