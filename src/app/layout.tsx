import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

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
};

// Inline script to set theme class before hydration — prevents flash of wrong theme.
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('ss-theme');
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var mode = t === 'dark' || t === 'light' ? t : (d ? 'dark' : 'light');
    if (mode === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
