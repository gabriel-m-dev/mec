"use client";

import { useEffect } from "react";
import {
  StatusPrimaryButton,
  StatusScreen,
  StatusSecondaryLink,
} from "@/components/status-screen";

/**
 * Pantalla para cuando una página del sitio revienta al renderizar: se cayó
 * la consulta a Sanity, llegó un documento con la forma equivocada, lo que
 * sea. Antes de esto salía la pantalla por defecto de Next, en inglés.
 *
 * Corre dentro del layout de (site), así que el encabezado y el pie siguen
 * ahí y la persona puede irse a otra página en vez de quedar encerrada.
 *
 * Tiene que ser componente de cliente: `reset` es un handler y los error
 * boundaries de React solo existen del lado del cliente.
 */

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Queda en la consola del navegador. Sirve para cuando alguien reporta
    // el problema: se le puede pedir la captura.
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      title="Algo salió mal de nuestro lado"
      description="No pudimos cargar esta sección. Probá de nuevo en un momento; si sigue pasando, escribinos y lo revisamos."
      // Next le pone un `digest` a los errores de servidor. Mostrarlo es lo
      // que convierte un "no me anda" en algo rastreable en los logs.
      footnote={error.digest ? `Código: ${error.digest}` : undefined}
    >
      <StatusPrimaryButton onClick={reset}>
        Probar de nuevo
      </StatusPrimaryButton>
      <StatusSecondaryLink href="/">Ir al inicio</StatusSecondaryLink>
    </StatusScreen>
  );
}
