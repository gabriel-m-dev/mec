/**
 * `driftedFields` es lo único que separa un `npm run seed` accidental de
 * borrar, sin rastro, todo lo que el cliente escribió desde el Studio. Un
 * falso negativo acá no rompe un test: destruye contenido real.
 *
 * Ya atajó un bug — al extraer el comparador a su propio módulo se perdió el
 * filtro de `image` en dry-run y el guard empezó a reportar 24 documentos con
 * deriva falsa.
 */

import { describe, expect, it } from "vitest";

import { driftedFields } from "./seed-guard";

const base = { _id: "a", _type: "t", title: "Hola", tags: ["x", "y"] };

describe("driftedFields — sin deriva", () => {
  it("documentos idénticos", () => {
    expect(driftedFields({ ...base }, { ...base })).toEqual([]);
  });

  it("ignora los campos de sistema, que cambian solos", () => {
    expect(driftedFields({ ...base, _rev: "r1", _updatedAt: "2020" }, { ...base })).toEqual([]);
  });

  it("el orden de las claves de un objeto no inventa diferencias", () => {
    const reordered = { tags: ["x", "y"], title: "Hola", _id: "a", _type: "t" };
    expect(driftedFields(reordered, { ...base })).toEqual([]);
  });

  it("respeta `ignore` — el caso de `image` en dry-run, donde no se sube", () => {
    expect(driftedFields({ ...base, image: { asset: 1 } }, { ...base }, ["image"])).toEqual([]);
  });
});

describe("driftedFields — con deriva, esto es lo que el seed borraría", () => {
  it("texto editado desde el Studio", () => {
    expect(driftedFields({ ...base, title: "Editado por el cliente" }, { ...base })).toEqual([
      "title",
    ]);
  });

  it("campo que el cliente agregó y el seed no conoce: createOrReplace igual lo borra", () => {
    expect(driftedFields({ ...base, nuevo: "algo" }, { ...base })).toEqual(["nuevo"]);
  });

  it("campo que el seed escribe y todavía no existe vivo", () => {
    expect(driftedFields({ ...base }, { ...base, extra: "v" })).toEqual(["extra"]);
  });

  it("array reordenado — el orden de un array SÍ es deriva real", () => {
    expect(driftedFields({ ...base, tags: ["y", "x"] }, { ...base })).toEqual(["tags"]);
  });

  it("array más corto", () => {
    expect(driftedFields({ ...base, tags: ["x"] }, { ...base })).toEqual(["tags"]);
  });

  it("null no es lo mismo que ausente", () => {
    expect(driftedFields({ ...base, opt: null }, { ...base })).toEqual(["opt"]);
  });

  it("devuelve los campos ordenados alfabéticamente", () => {
    expect(driftedFields({ ...base, title: "T2", tags: ["z"] }, { ...base })).toEqual([
      "tags",
      "title",
    ]);
  });
});

describe("driftedFields — imágenes ausentes en dry-run", () => {
  const image = { _type: "image", asset: { _type: "reference", _ref: "image-abc" } };
  const opts = { imagesMayBeMissing: true };

  it("una imagen viva contra `undefined` no es deriva", () => {
    expect(driftedFields({ ...base, image }, { ...base }, [], opts)).toEqual([]);
  });

  it("tampoco lo es anidada, como `story.image`", () => {
    const story = { title: "T", paragraphs: ["p"], image };
    const live = { ...base, story };
    const next = { ...base, story: { title: "T", paragraphs: ["p"], image: undefined } };
    expect(driftedFields(live, next, [], opts)).toEqual([]);
  });

  it("PERO el texto de al lado se sigue comparando: esto es lo que se perdería", () => {
    // El motivo de no ignorar `story` entero. Si se ignorara el campo, esta
    // edición del cliente pasaría desapercibida y el seed la borraría.
    const live = { ...base, story: { title: "EDITADO POR EL CLIENTE", image } };
    const next = { ...base, story: { title: "T", image: undefined } };
    expect(driftedFields(live, next, [], opts)).toEqual(["story"]);
  });

  it("sin la opción, la imagen ausente SÍ es deriva", () => {
    expect(driftedFields({ ...base, image }, { ...base })).toEqual(["image"]);
  });

  it("no confunde cualquier objeto ausente con una imagen", () => {
    const noImage = { _type: "otraCosa", asset: {} };
    expect(driftedFields({ ...base, x: noImage }, { ...base }, [], opts)).toEqual(["x"]);
  });
});

describe("driftedFields — objetos anidados dentro de arrays (el caso real de las FAQ)", () => {
  const withFaqs = {
    _id: "b",
    _type: "pageBanner",
    faqs: [{ _key: "faq-0", question: "P", answer: "R" }],
  };

  it("FAQ idéntica", () => {
    expect(driftedFields({ ...withFaqs }, { ...withFaqs })).toEqual([]);
  });

  it("respuesta de FAQ editada", () => {
    const edited = { ...withFaqs, faqs: [{ _key: "faq-0", question: "P", answer: "R EDITADA" }] };
    expect(driftedFields(edited, withFaqs)).toEqual(["faqs"]);
  });
});
