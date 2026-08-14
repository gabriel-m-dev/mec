import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ViewTransitions } from "@/components/view-transitions";
import { WhatsAppButton } from "@/components/whatsapp-button";
import type { ReactNode } from "react";

export default function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      {/* No dibuja nada: engancha los clics de navegación para animarlos.
          Va acá y no en el layout raíz por lo mismo que el botón de WhatsApp:
          el Studio cuelga del raíz y no tiene por qué heredar esto. */}
      <ViewTransitions />
      <SiteHeader />
      {children}
      <SiteFooter />
      {/* Va en el layout del grupo (site) y no en el layout raíz para que no
          aparezca dentro del Studio: /studio cuelga del layout raíz. */}
      <WhatsAppButton />
    </>
  );
}
