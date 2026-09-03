import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enter Marketing — Digital агентство",
  description:
    "Помогаем компаниям увеличить поток клиентов за счёт рекламы и эффективных инструментов маркетинга.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={roboto.variable}>
      <body>
        <div id="site-shell">
          <AppProviders>{children}</AppProviders>
        </div>
      </body>
    </html>
  );
}
