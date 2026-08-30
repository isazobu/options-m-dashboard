"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/proposals", label: "Decisions" },
  { href: "/orders", label: "Orders" },
  { href: "/risk-events", label: "Risk Events" },
  { href: "/chat", label: "Chat" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-subtle">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <span className="font-semibold tracking-tight text-[var(--text-primary)]">
          options-<span style={{ color: "var(--color-brand)" }}>m</span>
        </span>
        <nav className="flex gap-1">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-subtle bg-[var(--bg-surface-raised)] text-[var(--text-primary)]"
                    : "border-transparent text-secondary hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
