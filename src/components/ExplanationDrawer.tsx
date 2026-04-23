"use client";

import { useState } from "react";

interface Props {
  explanation: string;
  reference?: string;
}

export function ExplanationDrawer({ explanation, reference }: Props) {
  const [open, setOpen] = useState(false);

  if (!explanation && !reference) return null;

  return (
    <div className="rounded-xl border border-cream-200 overflow-hidden bg-white" style={{ boxShadow: "var(--shadow-sm)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-cream-100 hover:bg-cream-200 transition-colors"
      >
        <span className="label-caps text-ink-faint">Explanation</span>
        <span className="font-mono text-[11px] text-ink-faint">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 py-4 space-y-3 border-t border-cream-200">
          {explanation && (
            <p className="text-[13.5px] text-ink-muted leading-relaxed whitespace-pre-line">{explanation}</p>
          )}
          {reference && (
            <a
              href={reference}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-mono text-[11px] text-brand underline break-all hover:text-brand-dark transition-colors"
            >
              {reference}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
