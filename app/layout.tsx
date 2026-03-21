import type { Metadata } from "next";
import "./globals.css";
import { JetBrains_Mono, IBM_Plex_Serif } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Helper",
  description: "Notion + Slack automation dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} ${ibmPlexSerif.variable} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen antialiased transition-colors duration-200`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
