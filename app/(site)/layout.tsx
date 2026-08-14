import { NavProgressBar } from "@/components/nav-progress-bar";
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
      {/* La barrita dorada arriba de la pantalla mientras carga la página
          siguiente. Mismo criterio que `ViewTransitions`: no en el layout
          raíz para que el Studio no la herede. */}
      <NavProgressBar />
      <SiteHeader />
      {children}
      <SiteFooter />
      {/* Va en el layout del grupo (site) y no en el layout raíz para que no
          aparezca dentro del Studio: /studio cuelga del layout raíz. */}
      <WhatsAppButton />
    </>
  );
}
