import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scripture Stack",
  description: "A new way to study the Word — semantic search, visualization, and ML-powered insights across the Bible.",
  metadataBase: new URL("https://scripturestack.j4den.com"),
  openGraph: {
    title: "Scripture Stack",
    description: "A new way to study the Word.",
    url: "https://scripturestack.j4den.com",
    siteName: "Scripture Stack",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-mono">{children}</body>
    </html>
  );
}
