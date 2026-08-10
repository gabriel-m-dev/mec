/**
 * Estas reglas solo se manifiestan adentro del Studio, que no se puede
 * inspeccionar desde acá — el mismo punto ciego que dejó pasar el bug de
 * `_key`, donde el sitio público renderizaba perfecto y el Studio estaba
 * roto. Ejecutarlas aisladas es la única forma de saber que hacen lo que
 * dicen.
 */

import { describe, expect, it } from "vitest";

import {
  SECTION_KEYS_BY_ROUTE,
  allowedSectionKeys,
  duplicatedSectionKeys,
  faqHeadingWithoutQuestions,
  questionsWithoutFaqHeading,
  sectionKeyNotUsedByRoute,
} from "./pageBannerValidation";

const LABELS = [
  { title: "Principal", value: "main" },
  { title: "Valores", value: "values" },
  { title: "Preguntas frecuentes", value: "faq" },
];

const main = { key: "main", title: "T" };
const faqHeading = { key: "faq", title: "Preguntas" };
const question = { question: "P", answer: "R" };

describe("duplicatedSectionKeys", () => {
  it("acepta cuando no hay secciones", () => {
    expect(duplicatedSectionKeys(undefined, LABELS)).toBe(true);
    expect(duplicatedSectionKeys([], LABELS)).toBe(true);
  });

  it("acepta claves distintas", () => {
    expect(duplicatedSectionKeys([main, faqHeading], LABELS)).toBe(true);
  });

  it("rechaza dos secciones con la misma clave", () => {
    const message = duplicatedSectionKeys([main, { key: "main", title: "Otra" }], LABELS);
    expect(message).toContain("Principal");
  });

  it("habla con la etiqueta legible, no con la clave interna", () => {
    const message = duplicatedSectionKeys([faqHeading, { key: "faq", title: "Otra" }], LABELS);
    expect(message).toContain("Preguntas frecuentes");
    expect(message).not.toContain('"faq"');
  });

  it("sin etiquetas cae en la clave cruda en vez de romperse", () => {
    expect(duplicatedSectionKeys([main, { key: "main", title: "Otra" }])).toContain("main");
  });

  it("ignora las secciones que todavía no tienen clave elegida", () => {
    expect(duplicatedSectionKeys([{}, {}], LABELS)).toBe(true);
  });
});

describe("faqHeadingWithoutQuestions", () => {
  it("acepta encabezado con preguntas", () => {
    expect(faqHeadingWithoutQuestions([faqHeading], [question])).toBe(true);
  });

  it("acepta cuando no hay encabezado de FAQ", () => {
    expect(faqHeadingWithoutQuestions([main], [])).toBe(true);
  });

  it("rechaza un encabezado sin preguntas: el bloque no se mostraría", () => {
    expect(faqHeadingWithoutQuestions([main, faqHeading], [])).toContain("al menos una pregunta");
  });

  it("rechaza igual si el campo faqs directamente no existe", () => {
    expect(faqHeadingWithoutQuestions([faqHeading], undefined)).toContain(
      "al menos una pregunta",
    );
  });
});

describe("allowedSectionKeys", () => {
  it("da las claves que cada página dibuja de verdad", () => {
    expect(allowedSectionKeys("/quienes-somos")).toEqual(["main", "values"]);
    expect(allowedSectionKeys("/cultos")).toEqual(["main", "faq"]);
    expect(allowedSectionKeys("/noticias")).toEqual(["main"]);
    expect(allowedSectionKeys("/eventos")).toEqual(["main"]);
  });

  it("no habilita ninguna en las páginas con títulos escritos en el código", () => {
    expect(allowedSectionKeys("/capellanes")).toEqual([]);
    expect(allowedSectionKeys("/the-chosen")).toEqual([]);
    expect(allowedSectionKeys("/contacto")).toEqual([]);
  });

  it("una ruta desconocida no habilita nada, en vez de romperse", () => {
    expect(allowedSectionKeys("/inventada")).toEqual([]);
    expect(allowedSectionKeys(undefined)).toEqual([]);
    expect(allowedSectionKeys(42)).toEqual([]);
  });

  it("las 7 rutas del sitio están contempladas", () => {
    // Si mañana se agrega una página y se olvidan de este mapa, la ruta nueva
    // no habilitaría ninguna clave y el campo quedaría oculto sin explicación.
    expect(Object.keys(SECTION_KEYS_BY_ROUTE).sort()).toEqual([
      "/capellanes",
      "/contacto",
      "/cultos",
      "/eventos",
      "/noticias",
      "/quienes-somos",
      "/the-chosen",
    ]);
  });

  it("solo usa claves que existen", () => {
    const validas = new Set(LABELS.map((l) => l.value));
    for (const claves of Object.values(SECTION_KEYS_BY_ROUTE)) {
      for (const clave of claves) expect(validas.has(clave)).toBe(true);
    }
  });
});

describe("sectionKeyNotUsedByRoute", () => {
  it("acepta las claves que esa página sí dibuja", () => {
    expect(sectionKeyNotUsedByRoute([main], "/noticias", LABELS)).toBe(true);
    expect(
      sectionKeyNotUsedByRoute([main, { key: "values" }], "/quienes-somos", LABELS),
    ).toBe(true);
    expect(sectionKeyNotUsedByRoute([main, faqHeading], "/cultos", LABELS)).toBe(true);
  });

  it("rechaza una clave que esa página no lee: se cargaría y no se vería", () => {
    // "Valores" solo lo dibuja /quienes-somos.
    const mensaje = sectionKeyNotUsedByRoute([{ key: "values" }], "/noticias", LABELS);
    expect(mensaje).toContain("Valores");
    // El mensaje dice cuáles SÍ sirven, no solo que está mal.
    expect(mensaje).toContain("Principal");
  });

  it("rechaza las preguntas frecuentes fuera de cultos", () => {
    expect(sectionKeyNotUsedByRoute([faqHeading], "/eventos", LABELS)).toContain(
      "Preguntas frecuentes",
    );
  });

  it("en una página sin encabezados avisa que no se va a ver nada", () => {
    // Es el caso real de /capellanes y /the-chosen, que quedaron con una
    // sección "main" cargada que no se dibuja en ningún lado.
    const mensaje = sectionKeyNotUsedByRoute([main], "/capellanes", LABELS);
    expect(mensaje).toContain("no muestra encabezados");
    expect(mensaje).toContain("Principal");
  });

  it("nombra la clave sobrante una sola vez aunque esté cargada dos veces", () => {
    const mensaje = sectionKeyNotUsedByRoute(
      [{ key: "values" }, { key: "values" }],
      "/noticias",
      LABELS,
    ) as string;

    expect(mensaje.split("Valores")).toHaveLength(2);
  });

  it("acepta cuando no hay secciones cargadas", () => {
    expect(sectionKeyNotUsedByRoute([], "/contacto", LABELS)).toBe(true);
    expect(sectionKeyNotUsedByRoute(undefined, "/contacto", LABELS)).toBe(true);
  });

  it("ignora las secciones que todavía no tienen clave elegida", () => {
    expect(sectionKeyNotUsedByRoute([{}], "/noticias", LABELS)).toBe(true);
  });
});

describe("questionsWithoutFaqHeading", () => {
  it("acepta preguntas con su encabezado", () => {
    expect(questionsWithoutFaqHeading([question], [faqHeading])).toBe(true);
  });

  it("acepta cuando no hay preguntas", () => {
    expect(questionsWithoutFaqHeading([], [main])).toBe(true);
    expect(questionsWithoutFaqHeading(undefined, [main])).toBe(true);
  });

  it("rechaza preguntas cargadas sin encabezado: desaparecerían en silencio", () => {
    expect(questionsWithoutFaqHeading([question], [main])).toContain("Falta el encabezado");
  });

  it("rechaza igual si no hay ninguna sección", () => {
    expect(questionsWithoutFaqHeading([question], undefined)).toContain("Falta el encabezado");
  });
});
