import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSiteUrl } from "@/lib/site-url";
import type { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

function getMetadataBase() {
  return new URL(getSiteUrl());
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "MEC | Cristo poder y sabiduría de Dios",
    template: "%s | MEC",
  },
  description:
    "Landing premium para MEC con culto presencial, transmisiones online, ministerios, capellanía, eventos y noticias.",
  keywords: [
    "MEC",
    "iglesia",
    "culto online",
    "ministerios",
    "capellanía",
    "eventos cristianos",
  ],
  openGraph: {
    title: "MEC | Cristo poder y sabiduría de Dios",
    description:
      "Una experiencia digital dark-luxury para presentar la comunidad, cultos, ministerios y actividades de MEC.",
    type: "website",
    locale: "es_AR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#02050c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="bg-ink-950 font-sans text-white antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
