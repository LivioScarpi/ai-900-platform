"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function MobileNav() {
  const { signOut } = useAuth();
  const [confirming, setConfirming] = useState(false);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="h-px bg-sidebar-border" />

      <div className="bg-sidebar-bg flex items-stretch h-14">
        {/* Home */}
        <Link
          href="/"
          onClickCapture={() => setConfirming(false)}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-sidebar-text hover:text-sidebar-text-active active:bg-sidebar-hover transition-colors"
        >
          <HomeIcon />
          <span className="font-mono text-[8px] tracking-[0.12em] uppercase">Home</span>
        </Link>

        <div className="w-px bg-sidebar-border my-3" />

        {/* Exit — normal or confirming */}
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-sidebar-text hover:text-red-400 active:bg-sidebar-hover transition-colors"
          >
            <SignOutIcon />
            <span className="font-mono text-[8px] tracking-[0.12em] uppercase">Exit</span>
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-3">
            <button
              onClick={signOut}
              className="flex flex-col items-center gap-0.5 text-red-400 hover:text-red-300 active:opacity-70 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="font-mono text-[8px] tracking-[0.1em] uppercase">Sure?</span>
            </button>
            <div className="w-px h-6 bg-sidebar-border" />
            <button
              onClick={() => setConfirming(false)}
              className="flex flex-col items-center gap-0.5 text-sidebar-text hover:text-sidebar-text-active active:opacity-70 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span className="font-mono text-[8px] tracking-[0.1em] uppercase">No</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
