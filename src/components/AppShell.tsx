"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";
import { ThemeProvider } from "./ThemeProvider";

type ShellCtx = {
  openCommand: () => void;
  closeCommand: () => void;
  isCommandOpen: boolean;
};

const ShellContext = createContext<ShellCtx | null>(null);

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within AppShell");
  return ctx;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);

  const openCommand = useCallback(() => setCmdOpen(true), []);
  const closeCommand = useCallback(() => setCmdOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <ThemeProvider>
      <ShellContext.Provider value={{ openCommand, closeCommand, isCommandOpen: cmdOpen }}>
        <div className="flex min-h-screen" style={{ background: "var(--color-parchment)" }}>
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
          <CommandPalette />
        </div>
      </ShellContext.Provider>
    </ThemeProvider>
  );
}
