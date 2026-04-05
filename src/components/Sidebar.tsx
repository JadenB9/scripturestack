"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { useShell } from "./AppShell";

type NavItem = { label: string; href: string };
type NavSection = { label: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    label: "Library",
    items: [
      { label: "Books", href: "/books" },
      { label: "Reading", href: "/read/Genesis/1" },
    ],
  },
  {
    label: "Study",
    items: [
      { label: "Timeline", href: "/timeline" },
      { label: "Atlas", href: "/atlas" },
      { label: "Calendar", href: "/calendar" },
      { label: "Graph", href: "/graph" },
      { label: "Prophecy", href: "/prophecy" },
      { label: "Manuscripts", href: "/manuscripts" },
    ],
  },
  {
    label: "Analysis",
    items: [
      { label: "Frequency", href: "/analytics/frequency" },
      { label: "Character", href: "/analytics/character" },
      { label: "Semantic", href: "/analytics/semantic" },
      { label: "Authorship", href: "/analytics/authorship" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Annotations", href: "/annotations" },
      { label: "Compare", href: "/compare" },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  // Reading view: /read/* should mark "Reading" active
  if (href.startsWith("/read/")) return pathname.startsWith("/read/");
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openCommand } = useShell();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile header */}
      <div
        className="md:hidden flex items-center justify-between px-4 h-14 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <Link href="/" className="font-serif text-lg" style={{ color: "var(--color-ink)" }}>
          ScriptureStack
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="p-2"
          style={{ color: "var(--color-ink-muted)" }}
        >
          <MenuIcon />
        </button>
      </div>

      {/* Sidebar (desktop always visible, mobile drawer) */}
      <aside
        className={[
          "fixed md:sticky top-0 left-0 z-40 h-screen w-[240px] shrink-0 border-r flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "transition-transform duration-300",
        ].join(" ")}
        style={{
          background: "var(--color-parchment)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b shrink-0" style={{ borderColor: "var(--color-border)" }}>
          <Link href="/" className="font-serif text-[17px]" style={{ color: "var(--color-ink)" }}>
            ScriptureStack
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1"
            aria-label="Close navigation"
            style={{ color: "var(--color-ink-muted)" }}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {/* Command palette trigger */}
          <button
            onClick={openCommand}
            className="mx-3 mt-3 flex items-center gap-2 w-[calc(100%-24px)] h-9 px-3 border rounded text-[12px]"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-ink-faint)",
            }}
          >
            <SearchIcon />
            <span>Jump to…</span>
            <span className="ml-auto text-[10px] border px-1.5 py-0.5 rounded" style={{ borderColor: "var(--color-border)" }}>
              ⌘K
            </span>
          </button>

          {SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              <nav className="flex flex-col">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${isActive(pathname, item.href) ? "is-active" : ""}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t p-3 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
          <span className="t-meta">v0.1 · beta</span>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="p-1.5 border rounded"
            style={{ borderColor: "var(--color-border)", color: "var(--color-ink-muted)" }}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          aria-label="Close navigation overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.35)" }}
        />
      )}
    </>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 15A8 8 0 019 4a8 8 0 1011 11z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
    </svg>
  );
}
