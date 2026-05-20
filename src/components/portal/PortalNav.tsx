"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string };

const TABS: Tab[] = [
  { href: "/portal", label: "Reps" },
  { href: "/portal/chips", label: "Chips" },
  { href: "/portal/scratch", label: "Scratch" },
  { href: "/portal/leaderboard", label: "Leaderboard" },
  { href: "/portal/casino", label: "Casino" },
];

export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        padding: "0 0 8px",
      }}
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/portal"
            ? pathname === "/portal"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href as Parameters<typeof Link>[0]["href"]}
            style={{
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "10px 16px",
              border: "3px solid var(--ink)",
              borderRadius: 999,
              background: active ? "var(--yellow)" : "var(--paper)",
              color: "var(--ink)",
              boxShadow: active ? "3px 3px 0 var(--ink)" : "none",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
