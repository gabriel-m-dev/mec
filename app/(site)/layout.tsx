import "../globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import type { ReactNode } from "react";

export default function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      {/* Va en el layout del grupo (site) y no en el layout raíz para que no
          aparezca dentro del Studio: /studio cuelga del layout raíz. */}
      <WhatsAppButton />
    </>
  );
}
