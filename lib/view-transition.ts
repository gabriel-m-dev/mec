/**
 * Qué clics de enlace se convierten en una transición animada, como función
 * pura.
 *
 * Vive afuera del componente por lo mismo que el cálculo del carrusel: acá se
 * concentran todas las excepciones —abrir en pestaña nueva, descargar, salir
 * del sitio— y equivocarse en una no rompe la pantalla, rompe algo peor: que
 * el visitante crea que el sitio le ignoró el clic. Es exactamente el tipo de
 * regla que hay que poder ejecutar aislada.
 */

export type NavigationIntent = {
  /** El destino del enlace, absoluto. */
  href: string;
  /** La dirección que se está viendo, absoluta. */
  currentUrl: string;
  /** `0` es el botón principal. */
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  /** El atributo `target` del enlace, si tiene. */
  target: string | null;
  /** Si el enlace declara `download`. */
  hasDownload: boolean;
  /** Si alguien más ya canceló el evento. */
  defaultPrevented: boolean;
};

/**
 * `true` solo si el clic va a producir una navegación interna común.
 *
 * Cada `false` es un caso donde interceptar ROMPERÍA algo que el navegador ya
 * hace bien:
 *
 * - Botón del medio o derecho: abren en pestaña nueva o el menú contextual.
 * - Ctrl / Cmd / Shift / Alt: el visitante está pidiendo pestaña o ventana
 *   nueva, o descargar. Cancelar el evento se lo impediría.
 * - `target` propio: el enlace ya declaró que va a otro lado.
 * - `download`: no es una navegación, es bajar un archivo.
 * - Otro dominio: no hay página nuestra que dibujar del otro lado.
 * - El mismo camino: un enlace a la misma página, o solo a un ancla de la
 *   misma página. Animar una transición hacia donde ya estamos deja la
 *   pantalla parpadeando sin motivo, y encima rompe el salto al ancla.
 * - Ya cancelado: otro manejador decidió antes que este clic no navega.
 */
export function shouldInterceptNavigation(intent: NavigationIntent): boolean {
  if (intent.defaultPrevented) return false;
  if (intent.button !== 0) return false;
  if (intent.metaKey || intent.ctrlKey || intent.shiftKey || intent.altKey) return false;
  if (intent.hasDownload) return false;
  if (intent.target && intent.target !== "_self") return false;

  let destino: URL;
  let actual: URL;
  try {
    destino = new URL(intent.href);
    actual = new URL(intent.currentUrl);
  } catch {
    // Un href que no se puede interpretar no es asunto nuestro.
    return false;
  }

  if (destino.origin !== actual.origin) return false;

  // Mismo camino y misma consulta: o es la página actual, o es un ancla.
  if (destino.pathname === actual.pathname && destino.search === actual.search) {
    return false;
  }

  return true;
}
