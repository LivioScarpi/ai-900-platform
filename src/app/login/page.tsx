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
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-display text-4xl font-bold tracking-[-0.02em] text-ink">AI-900</p>
          <p className="font-mono text-[10px] mt-1.5 tracking-[0.18em] uppercase text-ink-faint">
            Azure AI Fundamentals · Study Platform
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-cream-200 p-8" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h1 className="font-display text-xl font-bold text-ink mb-1">
            {mode === "signin" ? "Accedi" : "Crea account"}
          </h1>
          <p className="text-sm text-ink-muted mb-6">
            {mode === "signin" ? "Inserisci email e password per accedere." : "Scegli email e password per il tuo account."}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="label-caps">Email</label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream text-ink text-sm font-mono placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="label-caps">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream text-ink text-sm font-mono placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-status-red bg-status-red-bg rounded-lg px-3 py-2 border border-red-200">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-status-green bg-status-green-bg rounded-lg px-3 py-2 border border-status-green/20">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "…" : mode === "signin" ? "Accedi →" : "Crea account →"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-cream-200 text-center">
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}
              className="font-mono text-[11px] text-ink-faint hover:text-ink-muted transition-colors"
            >
              {mode === "signin" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
