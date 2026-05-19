"use client";

import { useState } from "react";

interface Props {
  explanation?: string;
  reference?: string;
}

export function ExplanationDrawer({ explanation, reference }: Props) {
  const [open, setOpen] = useState(false);

  if (!explanation && !reference) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-cream-200 bg-white" style={{ boxShadow: "var(--shadow-xs)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-cream-50 hover:bg-cream-100 transition-colors duration-150 group"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="font-mono text-[10px] font-medium tracking-[0.12em] uppercase text-ink-muted">
            Explanation
          </span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-ink-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="px-4 py-4 space-y-3 border-t border-cream-200 border-l-[3px] border-l-amber-300">
          {explanation && (
            <p className="text-[13.5px] text-ink-muted leading-relaxed whitespace-pre-line">
              {explanation}
            </p>
          )}
          {reference && (
            <a
              href={reference}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-brand underline underline-offset-2 break-all hover:text-brand-dark transition-colors"
            >
              {reference}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
