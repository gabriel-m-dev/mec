/**
 * Estas reglas solo se manifiestan adentro del Studio, que no se puede
 * inspeccionar desde acá — el mismo punto ciego que dejó pasar el bug de
 * `_key`, donde el sitio público renderizaba perfecto y el Studio estaba
 * roto. Ejecutarlas aisladas es la única forma de saber que hacen lo que
 * dicen.
 */

import { describe, expect, it } from "vitest";

import {
  duplicatedSectionKeys,
  faqHeadingWithoutQuestions,
  questionsWithoutFaqHeading,
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
