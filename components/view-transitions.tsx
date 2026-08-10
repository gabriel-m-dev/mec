"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { shouldInterceptNavigation } from "@/lib/view-transition";

/**
 * Si la navegación tarda más que esto, se da por terminada igual.
 *
 * `startViewTransition` deja la pantalla congelada en la foto vieja hasta que
 * la promesa se resuelve. Sin este corte, una navegación que nunca llega
 * —red caída, ruta que no existe— dejaría al visitante mirando una imagen
 * inmóvil sin poder tocar nada.
 */
const NAVIGATION_TIMEOUT_MS = 2500;

/**
 * Transiciones animadas entre páginas, con la API de View Transitions.
 *
 * NO REEMPLAZA A NINGÚN `<Link>`. Escucha los clics en fase de CAPTURA sobre
 * el documento, y para los que son una navegación interna común solo hace
 * `preventDefault()`. Eso alcanza porque el `Link` de Next se abstiene cuando
 * el evento ya viene cancelado, así que él no navega y navegamos nosotros
 * adentro de la transición.
 *
 * POR QUÉ NO `stopPropagation()`. Sería la forma obvia de sacar del medio al
 * `Link`, pero mataría también los `onClick` propios de cada enlace — y el
 * menú de celular usa uno para cerrarse al navegar. Con `preventDefault()`
 * solo, esos manejadores siguen corriendo.
 *
 * POR QUÉ EN CAPTURA. React engancha sus manejadores en el contenedor raíz,
 * que cuelga del documento. Escuchando en captura sobre el documento llegamos
 * antes, que es lo único que garantiza que el `Link` vea el evento ya
 * cancelado.
 *
 * POR QUÉ UNO SOLO Y NO 27 `<Link>` CAMBIADOS. Además de no tocar nada de lo
 * que ya funciona, cubre los enlaces que se agreguen mañana. Un `TransitionLink`
 * propio obligaría a acordarse de usarlo siempre, y olvidarse no daría ningún
 * error: simplemente esa navegación no se animaría.
 *
 * LO QUE NO CUBRE: los botones de atrás y adelante del navegador no pasan por
 * un clic nuestro, así que esas navegaciones no se animan. Animarlas necesita
 * el soporte del router, que hoy solo existe en el canal experimental de React.
 */
export function ViewTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  /** La función que le avisa al navegador que el DOM nuevo ya está puesto. */
  const finishNavigation = useRef<(() => void) | null>(null);

  // La ruta cambió, o sea que React ya dibujó la página nueva: recién ahí el
  // navegador puede sacar la segunda foto y animar entre las dos.
  useEffect(() => {
    finishNavigation.current?.();
    finishNavigation.current = null;
  }, [pathname]);

  useEffect(() => {
    if (typeof document.startViewTransition !== "function") return;

    function onClick(event: MouseEvent) {
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (href === null) return;

      if (
        !shouldInterceptNavigation({
          // `anchor.href` ya viene absoluto y resuelto por el navegador.
          href: anchor.href,
          currentUrl: window.location.href,
          button: event.button,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
          target: anchor.getAttribute("target"),
          hasDownload: anchor.hasAttribute("download"),
          defaultPrevented: event.defaultPrevented,
        })
      ) {
        return;
      }

      event.preventDefault();

      const destino = anchor.href;
      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            const timer = window.setTimeout(resolve, NAVIGATION_TIMEOUT_MS);

            finishNavigation.current = () => {
              window.clearTimeout(timer);
              resolve();
            };

            router.push(destino);
          }),
      );
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
