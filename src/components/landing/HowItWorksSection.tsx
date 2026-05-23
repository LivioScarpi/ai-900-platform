"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Path data extracted from Figma node 2:2 (frame 1550×561, positioned at canvas x=-97)
const PATH_D =
  "M 0 2.323331356048584 C 128.1263885498047 -7.128194332122803 364.0939407348633 7.270294189453125 282.9530029296875 140.4764862060547 C 181.5268325805664 306.9842224121094 437.43287086486816 347.404541015625 448.8758239746094 276.81976318359375 C 460.3187770843506 206.2349853515625 388.02011489868164 175.46722793579102 364.61407470703125 226.14349365234375 C 341.20803451538086 276.8197593688965 285.0335693359375 556.142499923706 538.8590698242188 560.9688110351562 C 792.6845703125 565.7951221466064 1245.2013549804688 8.356197357177734 1550 45.760108947753906";

const BLEED_LEFT  = 97;
const BLEED_RIGHT = 110;

// Step label positions as % of the SVG viewBox (1550×561),
// chosen to sit near each section of the path without overlapping it
const steps = [
  {
    number: "01",
    title: "Registrati",
    description: "Account gratuito in 30 secondi. Nessuna carta di credito, nessun impegno.",
    // upper-left: before the loop forms
    posLeft: "18%",
    posTop:  "8%",
    align: "left" as const,
  },
  {
    number: "02",
    title: "Studia",
    description: "Scegli la modalità. Lavora sulle domande, rivedi le spiegazioni, individua i punti deboli.",
    // center-left: to the right of the loop bottom
    posLeft: "30%",
    posTop:  "65%",
    align: "left" as const,
  },
  {
    number: "03",
    title: "Certificati",
    description: "Simula l'esame reale quando sei pronto. Supera l'AI-900 con sicurezza.",
    // right side: along the upward sweep
    posLeft: "64%",
    posTop:  "14%",
    align: "left" as const,
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef    = useRef<SVGPathElement>(null);

  useIsomorphicLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

    const ctx = gsap.context(() => {
      gsap.from(".hiw-heading", {
        immediateRender: false,
        y: 20, opacity: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: ".hiw-heading", start: "top 85%" },
      });

      // Draw path: finish at center of viewport rather than bottom
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".hiw-svg-wrap",
          start: "top 70%",
          end: "center 40%",   // finishes earlier in the scroll
          scrub: 0.8,
        },
      });

      gsap.from(".hiw-dot-mid", {
        immediateRender: false,
        scale: 0, opacity: 0, duration: 0.35, ease: "back.out(2.5)",
        scrollTrigger: { trigger: ".hiw-svg-wrap", start: "center 65%" },
      });

      gsap.from(".hiw-step", {
        immediateRender: false,
        y: 12, opacity: 0, stagger: 0.12, duration: 0.5, ease: "power2.out",
        scrollTrigger: { trigger: ".hiw-svg-wrap", start: "top 85%" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 border-t border-cream-200"
    >
      {/* Heading — padded */}
      <div className="px-7 md:px-14 lg:px-20 hiw-heading mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-[5px] h-[5px] rounded-sm bg-brand shrink-0" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Come funziona
          </span>
        </div>
        <h2 className="font-display font-extrabold text-[36px] md:text-[48px] tracking-[-0.03em] leading-[0.95] text-ink">
          Dal primo login
          <br />
          <span className="text-ink-faint">alla certificazione.</span>
        </h2>
      </div>

      {/* Desktop: full-bleed SVG with overlaid step labels */}
      <div
        className="hiw-svg-wrap hidden md:block relative"
        // No overflow-hidden here — that collapsed the height.
        // Horizontal clip is handled by the parent LandingPage overflow-x-hidden.
      >
        <svg
          viewBox="0 0 1550 561"
          aria-hidden="true"
          className="block"
          // No explicit height → browser derives it from the viewBox aspect ratio.
          style={{
            marginLeft: `-${BLEED_LEFT}px`,
            width: `calc(100% + ${BLEED_LEFT + BLEED_RIGHT}px)`,
            overflow: 'visible',
          }}
        >
          <defs>
            {/* Gradient from Figma: #0066CC → #C4E2FF, opacity 0.88 */}
            <linearGradient id="hiw-stroke-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#0066CC" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#C4E2FF" stopOpacity="0.88" />
            </linearGradient>
          </defs>

          {/* Ghost track */}
          <path
            d={PATH_D}
            stroke="#0066CC"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.07"
          />

          {/* Animated gradient path */}
          <path
            ref={pathRef}
            d={PATH_D}
            stroke="url(#hiw-stroke-grad)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Step labels: absolutely positioned over the SVG area */}
        {steps.map((step) => (
          <div
            key={step.number}
            className="hiw-step absolute pointer-events-none"
            style={{ left: step.posLeft, top: step.posTop, maxWidth: 220 }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand/50 block mb-1.5">
              {step.number}
            </span>
            <h3 className="font-display font-bold text-[20px] text-ink tracking-[-0.025em] mb-1.5">
              {step.title}
            </h3>
            <p className="text-[13px] text-ink-muted leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile: vertical connector */}
      <div className="md:hidden px-7 flex flex-col mt-4">
        {steps.map((step, i) => (
          <div key={step.number} className="relative flex gap-5 pb-10">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-3 h-3 rounded-full border-[2.5px] border-brand bg-white mt-1" />
              {i < steps.length - 1 && (
                <div
                  className="w-px flex-1 mt-2"
                  style={{ background: "linear-gradient(to bottom, #0066CC50, #0066CC10)" }}
                />
              )}
            </div>
            <div className="pt-0.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand/50 block mb-1">
                {step.number}
              </span>
              <h3 className="font-display font-bold text-[20px] text-ink tracking-[-0.02em] mb-1.5">
                {step.title}
              </h3>
              <p className="text-[13px] text-ink-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
