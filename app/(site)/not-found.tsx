import type { Metadata } from "next";
import {
  StatusPrimaryLink,
  StatusScreen,
  StatusSecondaryLink,
} from "@/components/status-screen";

/**
 * 404 de las páginas que llaman a `notFound()` desde adentro del sitio. Hoy
 * el único caso real es `/eventos/<slug>` cuando el evento no existe o no
 * tiene galería.
 *
 * A diferencia de `app/not-found.tsx`, acá NO se dibujan el encabezado ni el
 * pie: este archivo sí corre dentro del layout de (site), que ya los pone.
 * Repetirlos saldría duplicado.
 */

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default function SiteNotFound() {
  return (
    <StatusScreen
      code="404"
      title="No encontramos lo que buscabas"
      description="Puede que este evento ya no esté publicado o que todavía no tenga fotos cargadas. En la agenda están todos los que sí."
    >
      <StatusPrimaryLink href="/eventos">Ver los eventos</StatusPrimaryLink>
      <StatusSecondaryLink href="/">Ir al inicio</StatusSecondaryLink>
    </StatusScreen>
  );
}
