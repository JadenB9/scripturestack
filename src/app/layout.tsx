import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { LEGACY_THEME_STORAGE_KEY, THEME_COLORS, THEME_STORAGE_KEY } from "@/lib/theme";

export const metadata: Metadata = {
  title: "ScriptureStack — The Bible, compiled for curious minds",
  description:
    "A scholarly Bible study application. Read, annotate, compare translations, trace prophecies, and search scripture by meaning.",
  metadataBase: new URL("https://scripturestack.j4den.com"),
  openGraph: {
    title: "ScriptureStack",
    description: "The Bible, compiled for curious minds.",
    url: "https://scripturestack.j4den.com",
    siteName: "ScriptureStack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

// Runs before paint so the saved theme is on <html> before anything renders.
// Mirrors applyTheme() in lib/theme.ts — it can't import it because this has
// to be a plain inline script. Nothing saved means follow the device.
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('${THEME_STORAGE_KEY}') || localStorage.getItem('${LEGACY_THEME_STORAGE_KEY}');
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var mode = t === 'dark' || t === 'light' ? t : (d ? 'dark' : 'light');
    var h = document.documentElement;
    h.classList.toggle('dark', mode === 'dark');
    h.setAttribute('data-theme', mode);
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      metas[i].removeAttribute('media');
      metas[i].setAttribute('content', mode === 'dark' ? '${THEME_COLORS.dark}' : '${THEME_COLORS.light}');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
