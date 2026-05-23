"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function SplitChars({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="split-char inline-block"
          aria-hidden="true"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}

function ProductMockup() {
  const options = [
    { label: "Azure Form Recognizer", selected: false },
    { label: "Azure Computer Vision", selected: true },
    { label: "Language Understanding", selected: false },
    { label: "Azure Bot Service", selected: false },
  ];

  return (
    <div className="bg-white rounded-2xl border border-cream-200 shadow-2xl shadow-ink/8 overflow-hidden w-full max-w-[400px]">
      {/* Header */}
      <div className="bg-ink px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-[5px] h-[5px] rounded-sm bg-brand shrink-0" />
          <span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.18em]">
            Simulazione · AI-900
          </span>
        </div>
        <span className="font-mono text-[12px] text-white/70 tabular-nums">23:41</span>
      </div>

      {/* Progress */}
      <div className="h-[3px] bg-cream-200">
        <div className="h-full bg-brand transition-all" style={{ width: "24%" }} />
      </div>

      {/* Question */}
      <div className="px-6 pt-5 pb-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint block mb-3">
          Domanda 12 / 50
        </span>
        <p className="text-[13px] text-ink leading-relaxed mb-5 font-medium">
          Quale servizio Azure permette di identificare oggetti e scene
          nelle immagini?
        </p>

        <div className="space-y-2">
          {options.map((opt) => (
            <div
              key={opt.label}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-[12px] transition-colors ${
                opt.selected
                  ? "border-brand/40 bg-brand/5 text-ink"
                  : "border-cream-200 text-ink-muted"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  opt.selected ? "border-brand bg-brand" : "border-cream-300"
                }`}
              >
                {opt.selected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              {opt.label}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-5 pt-1 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
          Spiegazione disponibile
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            Corretta
          </span>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-label", { y: 8, opacity: 0, duration: 0.4 }, 0.1)
        .from(
          ".hero-line-1 .split-char",
          { y: 40, opacity: 0, stagger: 0.028, duration: 0.6 },
          0.2
        )
        .from(
          ".hero-line-2 .split-char",
          { y: 40, opacity: 0, stagger: 0.028, duration: 0.6 },
          0.55
        )
        .from(
          ".hero-line-3 .split-char",
          { y: 40, opacity: 0, stagger: 0.028, duration: 0.6 },
          0.85
        )
        .from(".hero-sub", { y: 12, opacity: 0, duration: 0.5 }, 1.1)
        .from(
          ".hero-cta",
          { y: 8, opacity: 0, stagger: 0.1, duration: 0.4 },
          1.35
        )
        .from(".hero-mockup", { y: 24, opacity: 0, duration: 0.7 }, 1.2)
        .from(".hero-scroll", { opacity: 0, duration: 0.5 }, 1.8);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden px-7 md:px-14 lg:px-20 pt-14"
    >
      {/* Dot grid decoration */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none select-none">
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.05]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="dot-grid"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1.5" cy="1.5" r="1.5" fill="#111111" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>
      </div>

      {/* Content: 2-col on desktop */}
      <div className="relative z-10 w-full max-w-7xl py-20 flex flex-col lg:flex-row lg:items-center lg:gap-16">
        {/* Left: copy */}
        <div className="flex-1 min-w-0">
          {/* Eyebrow */}
          <div className="hero-label flex items-center gap-2 mb-8">
            <span className="w-[5px] h-[5px] rounded-sm bg-brand shrink-0" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              Uso interno · BU Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold tracking-[-0.04em] leading-[0.9] mb-6 overflow-hidden">
            <span className="hero-line-1 block text-[52px] md:text-[72px] lg:text-[80px] text-ink overflow-hidden">
              <SplitChars text="Preparati." className="block" />
            </span>
            <span className="hero-line-2 block text-[52px] md:text-[72px] lg:text-[80px] text-ink-faint overflow-hidden">
              <SplitChars text="Certificati." className="block" />
            </span>
            <span
              className="hero-line-3 block text-[52px] md:text-[72px] lg:text-[80px] overflow-hidden"
              style={{ color: "#0066CC" }}
            >
              <SplitChars text="Insieme." className="block" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-sub text-[15px] md:text-[16px] text-ink-muted leading-relaxed mb-10 max-w-md">
            La piattaforma della BU per prepararsi alle certificazioni Microsoft.
            Domande curate, simulazioni reali, analytics personali — tutto in un posto.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/login"
              className="hero-cta flex items-center gap-2 bg-ink text-white font-mono text-[12px] uppercase tracking-[0.12em] px-6 py-3.5 rounded hover:opacity-85 transition-opacity duration-150"
            >
              Accedi
              <span>→</span>
            </Link>
            <a
              href="#certificazioni"
              className="hero-cta font-mono text-[12px] uppercase tracking-[0.12em] text-ink-muted border border-cream-200 px-6 py-3.5 rounded hover:border-ink-faint hover:text-ink transition-colors duration-150"
            >
              Vedi le certificazioni
            </a>
          </div>

          <p className="hero-cta mt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Riservato ai colleghi della BU
          </p>
        </div>

        {/* Right: product mockup (desktop only) */}
        <div className="hero-mockup hidden lg:flex lg:flex-shrink-0 lg:justify-center lg:w-[420px]">
          <ProductMockup />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint/60">
          Scorri
        </span>
        <div className="w-px h-7 bg-gradient-to-b from-ink-faint/40 to-transparent" />
      </div>
    </div>
  );
}
