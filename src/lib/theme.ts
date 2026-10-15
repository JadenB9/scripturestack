// Shared by the inline <head> script, the ThemeProvider and the viewport
// metadata so the three never disagree on what "dark" looks like.

export type Theme = "light" | "dark";

// Same key j4den.com uses. This is a different origin so nothing is actually
// shared, but the name matches so the convention holds across the site.
export const THEME_STORAGE_KEY = "theme";

// Pre-rename key. Read once so an existing visitor keeps their choice.
export const LEGACY_THEME_STORAGE_KEY = "ss-theme";

// Page background per theme — what the browser chrome is tinted with.
export const THEME_COLORS: Record<Theme, string> = {
  light: "#F9F6EF",
  dark: "#14120F",
};

export function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.toggle("dark", theme === "dark");
  html.setAttribute("data-theme", theme);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.removeAttribute("media");
    m.setAttribute("content", THEME_COLORS[theme]);
  });
}
