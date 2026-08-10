/**
 * Cada caso de acá es una forma concreta de romperle la navegación al
 * visitante. Interceptar de más no se ve como un error: se ve como que el
 * sitio le ignoró el clic, que es peor porque nadie lo reporta.
 */

import { describe, expect, it } from "vitest";

import { shouldInterceptNavigation, type NavigationIntent } from "./view-transition";

const SITIO = "https://iglesiawebproject.vercel.app";

/** Un clic común sobre un enlace interno, con todo lo demás en su valor neutro. */
function clic(cambios: Partial<NavigationIntent> = {}): NavigationIntent {
  return {
    href: `${SITIO}/cultos`,
    currentUrl: `${SITIO}/`,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    target: null,
    hasDownload: false,
    defaultPrevented: false,
    ...cambios,
  };
}

describe("shouldInterceptNavigation — lo que SÍ se anima", () => {
  it("una navegación interna común", () => {
    expect(shouldInterceptNavigation(clic())).toBe(true);
  });

  it("ir a una página de detalle", () => {
    expect(
      shouldInterceptNavigation(
        clic({ currentUrl: `${SITIO}/eventos`, href: `${SITIO}/eventos/kermes` }),
      ),
    ).toBe(true);
  });

  it("volver al inicio", () => {
    expect(
      shouldInterceptNavigation(clic({ currentUrl: `${SITIO}/cultos`, href: `${SITIO}/` })),
    ).toBe(true);
  });

  it("target _self es lo mismo que no declarar target", () => {
    expect(shouldInterceptNavigation(clic({ target: "_self" }))).toBe(true);
  });

  it("cambia solo la consulta: sigue siendo otra vista", () => {
    expect(
      shouldInterceptNavigation(
        clic({ currentUrl: `${SITIO}/eventos`, href: `${SITIO}/eventos?pagina=2` }),
      ),
    ).toBe(true);
  });
});

describe("shouldInterceptNavigation — abrir en otro lado", () => {
  it("no toca el clic del medio: abre pestaña nueva", () => {
    expect(shouldInterceptNavigation(clic({ button: 1 }))).toBe(false);
  });

  it("no toca el clic derecho: es el menú contextual", () => {
    expect(shouldInterceptNavigation(clic({ button: 2 }))).toBe(false);
  });

  it.each(["metaKey", "ctrlKey", "shiftKey", "altKey"] as const)(
    "no toca el clic con %s: el visitante pidió otra pestaña o ventana",
    (tecla) => {
      expect(shouldInterceptNavigation(clic({ [tecla]: true }))).toBe(false);
    },
  );

  it("no toca un enlace con target propio", () => {
    expect(shouldInterceptNavigation(clic({ target: "_blank" }))).toBe(false);
  });

  it("no toca una descarga: no es una navegación", () => {
    expect(shouldInterceptNavigation(clic({ hasDownload: true }))).toBe(false);
  });
});

describe("shouldInterceptNavigation — fuera del sitio", () => {
  it("no toca otro dominio", () => {
    expect(shouldInterceptNavigation(clic({ href: "https://youtube.com/watch?v=1" }))).toBe(
      false,
    );
  });

  it("tampoco el mismo dominio en otro protocolo", () => {
    expect(
      shouldInterceptNavigation(clic({ href: "http://iglesiawebproject.vercel.app/cultos" })),
    ).toBe(false);
  });

  it("no se rompe con un href que no se puede interpretar", () => {
    expect(shouldInterceptNavigation(clic({ href: "javascript:void(0)" }))).toBe(false);
    expect(shouldInterceptNavigation(clic({ href: "" }))).toBe(false);
  });

  it("no toca un mailto ni un tel: la página de contacto los usa", () => {
    expect(shouldInterceptNavigation(clic({ href: "mailto:hola@mec.org" }))).toBe(false);
    expect(shouldInterceptNavigation(clic({ href: "tel:+5491100000000" }))).toBe(false);
  });
});

describe("shouldInterceptNavigation — hacia donde ya estamos", () => {
  it("no toca un enlace a la página actual", () => {
    expect(
      shouldInterceptNavigation(clic({ currentUrl: `${SITIO}/cultos`, href: `${SITIO}/cultos` })),
    ).toBe(false);
  });

  it("NO toca un ancla de la misma página: animar rompería el salto al ancla", () => {
    // El hero tiene `id="inicio"`, así que este caso es real.
    expect(
      shouldInterceptNavigation(clic({ currentUrl: `${SITIO}/`, href: `${SITIO}/#inicio` })),
    ).toBe(false);
  });

  it("pero un ancla de OTRA página sí navega", () => {
    expect(
      shouldInterceptNavigation(clic({ currentUrl: `${SITIO}/cultos`, href: `${SITIO}/#inicio` })),
    ).toBe(true);
  });
});

describe("shouldInterceptNavigation — cuando otro ya decidió", () => {
  it("respeta el evento ya cancelado", () => {
    expect(shouldInterceptNavigation(clic({ defaultPrevented: true }))).toBe(false);
  });
});
