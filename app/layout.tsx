import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
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
    default: "MEC | Ministerio Evangélico Cristiano",
    template: "%s | MEC",
  },
  // Este texto lo lee gente de la iglesia, no un cliente de diseño: sale en
  // el resultado de Google y en la vista previa de WhatsApp. Antes decía
  // "landing premium" y "experiencia digital dark-luxury", que era jerga
  // nuestra filtrada a una página pública.
  description:
    "Ministerio Evangélico Cristiano: cultos presenciales y transmisiones online, ministerios, capellanía, eventos y noticias de nuestra comunidad.",
  keywords: [
    "MEC",
    "iglesia",
    "culto online",
    "ministerios",
    "capellanía",
    "eventos cristianos",
  ],
  openGraph: {
    title: "MEC | Ministerio Evangélico Cristiano",
    description:
      "Conocé nuestra comunidad: cultos, ministerios, capellanía, eventos y noticias del Ministerio Evangélico Cristiano.",
    siteName: "MEC",
    url: "/",
    type: "website",
    locale: "es_AR",
  },
  // `summary_large_image` y no `summary`: con la tarjeta chica la imagen sale
  // como un cuadradito al costado y recorta el logo. La imagen la aporta
  // `app/opengraph-image.tsx`, que Next enchufa solo en og:image y en
  // twitter:image.
  twitter: {
    card: "summary_large_image",
    title: "MEC | Ministerio Evangélico Cristiano",
    description:
      "Conocé nuestra comunidad: cultos, ministerios, capellanía, eventos y noticias del Ministerio Evangélico Cristiano.",
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
        {children}
      </body>
    </html>
  );
}
