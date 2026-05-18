"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const NAV_TOP = [
  { href: "/", label: "Overview" },
];

const NAV_STUDY = [
  { href: "/study/sequential", label: "Sequential" },
  { href: "/study/random", label: "Random" },
  { href: "/study/microsoft", label: "Microsoft" },
  { href: "/exam", label: "Exam" },
];

const NAV_BOTTOM = [
  { href: "/dashboard", label: "Dashboard" },
];

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative flex items-center px-3 py-[9px] rounded-md font-mono text-[10px] tracking-[0.12em] uppercase transition-colors duration-100 ${
        active
          ? "text-white"
          : "text-sidebar-text hover:text-sidebar-text-active"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[14px] rounded-full bg-brand-light" />
      )}
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-sidebar-bg border-r border-sidebar-border flex flex-col z-30 select-none hidden md:flex">
      {/* Brand */}
      <div className="px-5 pt-7 pb-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <span className="w-[7px] h-[7px] rounded-sm bg-brand-light shrink-0" />
          <p className="font-display text-[17px] font-extrabold tracking-[-0.03em] text-white leading-none">
            AI-900
          </p>
        </div>
        <p className="font-mono text-[9px] mt-[9px] tracking-[0.18em] uppercase text-sidebar-text pl-[17px]">
          Azure Study
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 flex flex-col overflow-y-auto">
        {NAV_TOP.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}

        <div className="h-px bg-sidebar-border mx-0 my-2" />

        {NAV_STUDY.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}

        <div className="h-px bg-sidebar-border mx-0 my-2" />

        {NAV_BOTTOM.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-5 border-t border-sidebar-border">
        {user && (
          <div className="mb-3 space-y-1">
            <p className="font-mono text-[9px] text-sidebar-text truncate">{user.email}</p>
            <button
              onClick={signOut}
              className="font-mono text-[9px] text-sidebar-text hover:text-red-400 transition-colors"
            >
              Sign out →
            </button>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
          <p className="font-mono text-[9px] text-sidebar-text">70% to pass · 45 min</p>
        </div>
      </div>
    </aside>
  );
}
