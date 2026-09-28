import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NAYA · Wenaya Clinic — AI Care Assistant",
  description:
    "NAYA prepare votre demande de consultation chez Wenaya Clinic. Démonstration locale : aucune donnée n’est envoyée et aucun rendez-vous n’est confirmé automatiquement.",
};

export const viewport: Viewport = {
  themeColor: "#f2efe9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${manrope.variable} ${jetbrains.variable}`}>{children}</body>
    </html>
  );
}
