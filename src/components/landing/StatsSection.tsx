"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface StatItem {
  target: number;
  suffix: string;
  label: string;
  animated: boolean;
}

const stats: StatItem[] = [
  { target: 400, suffix: "+", label: "Domande curate", animated: true },
  { target: 50, suffix: "", label: "Domande per simulazione", animated: true },
  { target: 70, suffix: "%", label: "Soglia di superamento", animated: false },
  { target: 4, suffix: "", label: "Modalità di studio", animated: true },
];

function AnimatedCounter({ target, suffix, animated }: { target: number; suffix: string; animated: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || !animated) return;

    const obj = { value: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        value: target,
        duration: 2,
        ease: "power2.out",
        snap: { value: 1 },
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
        onUpdate() {
          el.textContent = Math.round(obj.value) + suffix;
        },
      });
    });

    return () => ctx.revert();
  }, [target, suffix, animated]);

  return (
    <span ref={ref}>
      {animated ? `0${suffix}` : `${target}${suffix}`}
    </span>
  );
}

export function StatsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".stat-item", {
        x: -20,
        opacity: 0,
        stagger: 0.15,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="bg-ink px-7 md:px-14 lg:px-20 py-20 border-t border-cream-200"
    >
      {/* Label */}
      <div className="flex items-center gap-2 mb-12">
        <span className="w-[5px] h-[5px] rounded-sm bg-brand shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          La piattaforma in numeri
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-item">
            <div className="font-display font-extrabold text-[44px] md:text-[56px] tracking-[-0.04em] leading-none text-white mb-2">
              <AnimatedCounter
                target={stat.target}
                suffix={stat.suffix}
                animated={stat.animated}
              />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
