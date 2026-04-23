"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Step = "input" | "sent";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setStep("sent");
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-display text-4xl font-bold tracking-[-0.02em] text-ink">AI-900</p>
          <p className="font-mono text-[10px] mt-1.5 tracking-[0.18em] uppercase text-ink-faint">
            Azure AI Fundamentals · Study Platform
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-cream-200 p-8" style={{ boxShadow: "var(--shadow-sm)" }}>
          {step === "input" ? (
            <>
              <h1 className="font-display text-xl font-bold text-ink mb-1">Sign in</h1>
              <p className="text-sm text-ink-muted mb-6">
                Enter your email to receive a magic link — no password required.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="label-caps">Email address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream text-ink text-sm font-mono placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-xs text-status-red bg-status-red-bg rounded-lg px-3 py-2 border border-red-200">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Sending…" : "Send magic link →"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-status-green-bg border border-status-green/20 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-status-green">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-ink mb-1">Check your email</h2>
                <p className="text-sm text-ink-muted">
                  We sent a magic link to <strong className="text-ink font-mono text-xs">{email}</strong>.
                  Click the link to sign in.
                </p>
              </div>
              <button
                onClick={() => setStep("input")}
                className="text-xs text-ink-faint hover:text-ink-muted transition-colors font-mono mt-2"
              >
                ← Use a different email
              </button>
            </div>
          )}
        </div>

        <p className="text-center font-mono text-[10px] text-ink-faint mt-6 tracking-wide">
          Your progress syncs across all your devices
        </p>
      </div>
    </div>
  );
}
