/**
 * Sanity exige un `_key` único en todo objeto adentro de un array. Sin él la
 * API de mutación acepta la escritura igual, el sitio público renderiza
 * perfecto — las queries proyectan campos explícitos y nunca leen `_key` — y
 * el Studio muestra "Claves faltantes" y BLOQUEA la edición del array.
 *
 * Ese bug llegó a producción y lo encontró el cliente, no la verificación:
 * el HTML renderizado no prueba que el documento sea editable.
 */

import { describe, expect, it } from "vitest";

import {
  keyedFaqs,
  keyedSections,
  keyedSocialLinks,
  keyedStats,
  keyedValues,
} from "./sanity-array-keys";

describe("keyedSections", () => {
  it("deriva la clave del campo `key` y estampa el `_type` del schema", () => {
    const result = keyedSections([
      { key: "main", title: "A" },
      { key: "values", title: "B" },
    ]);
    expect(result.map((s) => s._key)).toEqual(["main", "values"]);
    expect(result.every((s) => s._type === "pageSection")).toBe(true);
  });

  it("preserva el resto del contenido intacto", () => {
    const [section] = keyedSections([{ key: "main", title: "A", eyebrow: "E" }]);
    expect(section).toMatchObject({ key: "main", title: "A", eyebrow: "E" });
  });

  it("desambigua claves repetidas en vez de emitir un `_key` duplicado", () => {
    // Un `_key` duplicado rompe el Studio igual que uno faltante.
    const result = keyedSections([
      { key: "main", title: "A" },
      { key: "main", title: "B" },
    ]);
    expect(result.map((s) => s._key)).toEqual(["main", "main-2"]);
  });

  it("normaliza acentos y ñ, que en el proyecto abundan", () => {
    const accented = [{ key: "Sección Ñandú", title: "A" }];
    expect(keyedSections(accented)[0]._key).toBe("seccion-nandu");
  });

  it("cae en una clave posicional si no hay `key`", () => {
    // El cast es a propósito: los tipos rechazan un objeto sin `key`, pero los
    // datos que llegan de Sanity no están tipados en el borde y una sección a
    // medio cargar en el Studio no tiene `key` todavía. El fallback es para
    // runtime, no para el compilador.
    const keyless = [{ title: "sin key" }] as { key?: string; title: string }[];
    expect(keyedSections(keyless)[0]._key).toBe("section-0");
  });
});

describe("keyedFaqs", () => {
  it("usa claves posicionales y el `_type` del schema", () => {
    const result = keyedFaqs([{ question: "q1" }, { question: "q2" }]);
    expect(result.map((f) => f._key)).toEqual(["faq-0", "faq-1"]);
    expect(result.every((f) => f._type === "faqItem")).toBe(true);
  });

  it("la clave posicional no miente cuando el cliente reordena: Sanity mueve el objeto con su `_key`", () => {
    const [first, second] = keyedFaqs([{ question: "q1" }, { question: "q2" }]);
    const reordered = [second, first];
    expect(reordered.map((f) => f._key)).toEqual(["faq-1", "faq-0"]);
    expect(new Set(reordered.map((f) => f._key)).size).toBe(2);
  });
});

describe("keyedStats", () => {
  it("deriva la clave de la descripción y estampa el `_type` del schema", () => {
    const result = keyedStats([
      { value: "15+", label: "Años sirviendo" },
      { value: "7", label: "Ciudades alcanzadas" },
    ]);
    expect(result.map((s) => s._key)).toEqual(["anos-sirviendo", "ciudades-alcanzadas"]);
    expect(result.every((s) => s._type === "statItem")).toBe(true);
  });

  it("desambigua dos cifras con la misma descripción", () => {
    const result = keyedStats([
      { value: "1", label: "Sedes" },
      { value: "2", label: "Sedes" },
    ]);
    expect(result.map((s) => s._key)).toEqual(["sedes", "sedes-2"]);
  });
});

describe("keyedValues", () => {
  it("deriva la clave del ícono y estampa el `_type` del schema", () => {
    const result = keyedValues([
      { icon: "shield", title: "Fe" },
      { icon: "users", title: "Comunidad" },
      { icon: "serve", title: "Servicio" },
    ]);
    expect(result.map((v) => v._key)).toEqual(["shield", "users", "serve"]);
    expect(result.every((v) => v._type === "valueItem")).toBe(true);
  });
});

describe("keyedSocialLinks", () => {
  it("deriva la clave de `icon`, único por plataforma", () => {
    const result = keyedSocialLinks([{ icon: "youtube" }, { icon: "facebook" }]);
    expect(result.map((l) => l._key)).toEqual(["youtube", "facebook"]);
    expect(result.every((l) => l._type === "socialLink")).toBe(true);
  });
});

describe("todos los helpers", () => {
  it("no dejan ningún item sin `_key`, que es el bug original", () => {
    const all = [
      ...keyedSections([{ key: "main", title: "A" }, { title: "B" }]),
      ...keyedFaqs([{ question: "q" }]),
      ...keyedSocialLinks([{ icon: "youtube" }, {}]),
    ];
    expect(all.every((item) => typeof item._key === "string" && item._key.length > 0)).toBe(true);
  });
});
