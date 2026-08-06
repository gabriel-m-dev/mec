import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  StatusPrimaryLink,
  StatusScreen,
  StatusSecondaryLink,
} from "@/components/status-screen";

/**
 * 404 de una URL que no existe (por ejemplo `/ministerio`, con un typo).
 *
 * Este archivo trae el encabezado y el pie a mano, y no es un descuido: al no
 * coincidir ninguna ruta, Next lo dibuja dentro de `app/layout.tsx` solamente,
 * sin pasar por el layout de (site). Sin esto, la página quedaría sin
 * navegación y sin forma de volver a ningún lado.
 *
 * El 404 de una GALERÍA de evento inexistente es otro archivo:
 * `app/(site)/not-found.tsx`, que sí corre dentro del layout de (site).
 */

export const metadata: Metadata = {
  title: "Página no encontrada",
  // Un 404 no tiene que entrar al índice de Google.
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <StatusScreen
        code="404"
        title="No encontramos esta página"
        description="Puede que el enlace esté mal escrito o que la página ya no exista. Desde el inicio vas a poder llegar a todo lo demás."
      >
        <StatusPrimaryLink href="/">Ir al inicio</StatusPrimaryLink>
        <StatusSecondaryLink href="/contacto">Escribinos</StatusSecondaryLink>
      </StatusScreen>
      <SiteFooter />
    </>
  );
}
