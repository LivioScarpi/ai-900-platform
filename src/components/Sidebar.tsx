"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

interface NavItem { href: string; label: string }

function NavLink({ href, label, active }: NavItem & { active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative flex items-center px-3 py-[9px] rounded-md font-mono text-[10px] tracking-[0.12em] uppercase transition-colors duration-100 ${
        active ? "text-white" : "text-sidebar-text hover:text-sidebar-text-active"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[14px] rounded-full bg-brand-light" />
      )}
      {label}
    </Link>
  );
}

interface SidebarProps {
  certId: string;
  certName: string;
}

export function Sidebar({ certId, certName }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const base = `/${certId}`;
  const navItems: NavItem[] = [
    { href: base, label: "Overview" },
    { href: `${base}/study/sequential`, label: "Sequential" },
    { href: `${base}/study/random`, label: "Random" },
    { href: `${base}/study/microsoft`, label: "Microsoft" },
    { href: `${base}/exam`, label: "Exam" },
    { href: `${base}/dashboard`, label: "Dashboard" },
  ];

  function isActive(href: string) {
    return href === base ? pathname === base : pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex flex-col w-[200px] shrink-0 sticky top-0 h-screen bg-sidebar-bg border-r border-sidebar-border z-30 select-none">
      {/* Brand */}
      <Link href="/" className="px-5 pt-7 pb-6 border-b border-sidebar-border block">
        <div className="flex items-center gap-2.5">
          <span className="w-[7px] h-[7px] rounded-sm bg-brand-light shrink-0" />
          <p className="font-display text-[17px] font-extrabold tracking-[-0.03em] text-white leading-none">
            {certName}
          </p>
        </div>
        <p className="font-mono text-[9px] mt-[9px] tracking-[0.18em] uppercase text-sidebar-text pl-[17px]">
          Study Platform
        </p>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 flex flex-col overflow-y-auto gap-0.5">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-5 border-t border-sidebar-border">
        {user && (
          <div className="space-y-1">
            <p className="font-mono text-[9px] text-sidebar-text truncate">{user.email}</p>
            <button
              onClick={signOut}
              className="font-mono text-[9px] text-sidebar-text hover:text-red-400 transition-colors"
            >
              Sign out →
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
