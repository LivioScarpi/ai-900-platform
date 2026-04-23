"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const NAV = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/study/sequential",
    label: "Sequential",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    href: "/study/random",
    label: "Random",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
      </svg>
    ),
  },
  {
    href: "/exam",
    label: "Exam Simulator",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: "/flashcards",
    label: "Flashcards",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-sidebar-bg flex-col z-30 select-none hidden md:flex">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-sidebar-border">
        <div className="flex items-baseline gap-1.5">
          <p className="font-display text-[22px] font-bold tracking-[-0.02em] leading-none text-sidebar-text-active">
            AI-900
          </p>
        </div>
        <p className="font-mono text-[9px] mt-1 tracking-[0.18em] uppercase text-sidebar-text-muted">
          Azure · Study
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <p className="label-caps text-sidebar-text-muted px-2 mb-2">Study</p>
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                active
                  ? "bg-sidebar-active text-sidebar-text-active"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-brand-light rounded-r-[3px]" />
              )}
              <span className={active ? "text-brand-light" : ""}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border flex flex-col gap-2">
        {user && (
          <div className="flex flex-col gap-0.5 mb-1">
            <p className="font-mono text-[9px] text-sidebar-text-muted truncate">{user.email}</p>
            <button
              onClick={signOut}
              className="text-left font-mono text-[9px] text-sidebar-text-muted hover:text-status-red transition-colors tracking-wide"
            >
              Sign out →
            </button>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <p className="font-mono text-[9px] text-sidebar-text-muted">Microsoft AI-900</p>
        </div>
      </div>
    </aside>
  );
}
