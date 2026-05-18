"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/study/sequential", label: "Seq." },
  { href: "/study/random", label: "Rnd." },
  { href: "/study/microsoft", label: "MSFT" },
  { href: "/exam", label: "Exam" },
  { href: "/dashboard", label: "Stats" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-sidebar-bg border-t border-sidebar-border">
      <div className="flex items-stretch h-12">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex-1 flex items-center justify-center font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
                active ? "text-white" : "text-sidebar-text hover:text-sidebar-text-active"
              }`}
            >
              {active && (
                <span className="absolute top-0 left-[20%] right-[20%] h-[2px] bg-brand-light rounded-b-full" />
              )}
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={signOut}
          className="flex-1 flex items-center justify-center font-mono text-[9px] uppercase tracking-[0.1em] text-sidebar-text hover:text-red-400 transition-colors"
        >
          Exit
        </button>
      </div>
    </nav>
  );
}
