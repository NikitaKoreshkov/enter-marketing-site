import type { Metadata } from "next";
import { Cormorant_Garamond, Onest } from "next/font/google";
import { SiteNoiseOverlay } from "@/components/noise/SiteNoiseOverlay";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enter Marketing — Маркетинговое агентство в Алматы",
  description:
    "SMM, таргетированная реклама, видеопроизводство. Рейтинг 4.7 на 2ГИС. Алматы.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${onest.variable} ${display.variable}`}>
      <body>
        {/* Layer 1 — background gradients */}
        <div id="background-container" />

        {/* Layer 2 — page content */}
        <div id="page-content">
          <AppProviders>{children}</AppProviders>
        </div>

        {/* Layer 3 — noise overlay (z-index: 120, pointer-events: none) */}
        <SiteNoiseOverlay />
      </body>
    </html>
  );
}
