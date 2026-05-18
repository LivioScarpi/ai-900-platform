"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Account creato! Controlla la mail per confermare, poi accedi.");
        setMode("signin");
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-sm bg-brand" />
            <p className="font-display text-[22px] font-extrabold tracking-[-0.03em] text-ink leading-none">
              AI-900
            </p>
          </div>
          <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-ink-faint pl-4">
            Azure AI Fundamentals
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl border border-cream-200 p-7" style={{ boxShadow: "var(--shadow-md)" }}>
          <h1 className="font-display text-[20px] font-extrabold text-ink tracking-[-0.02em] mb-1">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="font-mono text-[10px] text-ink-faint mb-6 tracking-[0.05em]">
            {mode === "signin" ? "Enter your credentials to continue." : "Choose your email and password."}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em]">Email</label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream text-ink text-[13px] font-mono placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em]">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream text-ink text-[13px] font-mono placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors"
              />
            </div>

            {error && (
              <p className="font-mono text-[11px] text-status-red bg-status-red-bg rounded-lg px-3 py-2 border border-red-200">
                {error}
              </p>
            )}
            {message && (
              <p className="font-mono text-[11px] text-status-green bg-status-green-bg rounded-lg px-3 py-2 border border-status-green/20">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 rounded-lg bg-ink text-white text-[13px] font-semibold hover:bg-ink/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "…" : mode === "signin" ? "Sign in →" : "Create account →"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-cream-200 text-center">
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}
              className="font-mono text-[10px] text-ink-faint hover:text-ink-muted transition-colors"
            >
              {mode === "signin" ? "No account? Sign up" : "Already have one? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
