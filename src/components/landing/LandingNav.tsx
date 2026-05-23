"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });
    }, navRef);
    return () => ctx.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/95 backdrop-blur-sm border-b border-cream-200"
          : "bg-transparent"
      }`}
    >
      <div className="px-7 md:px-14 lg:px-20 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="w-[7px] h-[7px] rounded-sm bg-brand shrink-0" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
            AI-900
          </span>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted hover:text-ink transition-colors duration-150"
          >
            Accedi
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 bg-ink text-white font-mono text-[11px] uppercase tracking-[0.12em] px-4 py-2 rounded hover:opacity-85 transition-opacity duration-150"
          >
            Inizia ora
            <span className="text-[10px]">→</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
