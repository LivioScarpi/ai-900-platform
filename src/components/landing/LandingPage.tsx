"use client";

import Link from "next/link";
import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { StatsSection } from "./StatsSection";
import { CertificationsSection } from "./CertificationsSection";

export function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-cream">
      <LandingNav />
      <HeroSection />
      <CertificationsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />

      {/* Final CTA */}
      <section className="px-7 md:px-14 lg:px-20 py-24 border-t border-cream-200 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-[5px] h-[5px] rounded-sm bg-brand shrink-0" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Inizia adesso
          </span>
        </div>
        <h2 className="font-display font-extrabold text-[40px] md:text-[56px] tracking-[-0.035em] leading-[0.95] text-ink mb-4">
          Qual è la tua
          <br />
          <span style={{ color: "#0066CC" }}>prossima certificazione?</span>
        </h2>
        <p className="text-[14px] text-ink-muted mb-10 max-w-sm mx-auto">
          Accedi con il tuo account e inizia a studiare. I tuoi progressi vengono salvati automaticamente.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-ink text-white font-mono text-[12px] uppercase tracking-[0.12em] px-8 py-4 rounded hover:opacity-85 transition-opacity duration-150"
        >
          Accedi
          <span>→</span>
        </Link>
      </section>

      {/* Footer */}
      <div className="px-7 md:px-14 lg:px-20 py-6 border-t border-cream-200 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          © 2026 · Uso interno BU
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Non affiliato con Microsoft
        </p>
      </div>
    </div>
  );
}
