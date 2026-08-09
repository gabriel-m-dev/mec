/**
 * Estas reglas solo se manifiestan adentro del Studio, que no se puede
 * inspeccionar desde acá. Ejecutarlas aisladas es la única forma de saber que
 * hacen lo que dicen. Mismo criterio que `pageBannerValidation.test.ts`.
 */

import { describe, expect, it } from "vitest";

import {
  HERO_DESKTOP_SPEC,
  HERO_MOBILE_SPEC,
  dimensionsFromAssetRef,
  heroImageIssue,
} from "./heroImageValidation";

/** Un valor de campo `image` como lo guarda Sanity. */
const image = (ref: string) => ({ asset: { _type: "reference", _ref: ref } });

describe("dimensionsFromAssetRef", () => {
  it("lee las medidas del _ref", () => {
    expect(dimensionsFromAssetRef(image("image-abc123-2560x1440-jpg"))).toEqual({
      width: 2560,
      height: 1440,
    });
  });

  it("no se confunde con los guiones del id del asset", () => {
    // El id real de Sanity es un hash largo; si el patrón no estuviera anclado
    // al final, un id con dígitos y guiones podría hacer coincidir el trozo
    // equivocado.
    expect(
      dimensionsFromAssetRef(image("image-9f8e-7d6c-5b4a-1080x1920-png")),
    ).toEqual({ width: 1080, height: 1920 });
  });

  it("devuelve null cuando todavía no hay imagen", () => {
    expect(dimensionsFromAssetRef(undefined)).toBeNull();
    expect(dimensionsFromAssetRef(null)).toBeNull();
    expect(dimensionsFromAssetRef({})).toBeNull();
    expect(dimensionsFromAssetRef({ asset: {} })).toBeNull();
  });

  it("devuelve null si el _ref no tiene el formato esperado", () => {
    expect(dimensionsFromAssetRef(image("image-abc123-jpg"))).toBeNull();
    expect(dimensionsFromAssetRef(image("file-abc123-pdf"))).toBeNull();
    expect(dimensionsFromAssetRef(image("image-abc123-0x0-jpg"))).toBeNull();
  });
});

describe("heroImageIssue — escritorio", () => {
  it("acepta la resolución recomendada", () => {
    expect(heroImageIssue(image("image-a-2560x1440-jpg"), HERO_DESKTOP_SPEC)).toBe(true);
  });

  it("acepta el mínimo exacto", () => {
    expect(heroImageIssue(image("image-a-1920x1080-jpg"), HERO_DESKTOP_SPEC)).toBe(true);
  });

  it("acepta una apaisada más ancha que 16:9", () => {
    // La que está hoy en producción es 2.5:1. El recorte lo decide el CDN con
    // el hotspot, así que la proporción no se exige: solo la orientación.
    expect(heroImageIssue(image("image-a-2600x1100-jpg"), HERO_DESKTOP_SPEC)).toBe(true);
  });

  it("avisa cuando es más chica que el mínimo", () => {
    const message = heroImageIssue(image("image-a-1280x720-jpg"), HERO_DESKTOP_SPEC);
    expect(message).toContain("1280 × 720");
    expect(message).toContain("1920 × 1080");
    expect(message).toContain("borrosa");
  });

  it("avisa cuando está parada, aunque sea grande", () => {
    const message = heroImageIssue(image("image-a-2000x3000-jpg"), HERO_DESKTOP_SPEC);
    expect(message).toContain("parada");
    expect(message).not.toContain("borrosa");
  });

  it("prioriza la orientación sobre la medida: una vertical chica se corrige girando, no agrandando", () => {
    const message = heroImageIssue(image("image-a-400x900-jpg"), HERO_DESKTOP_SPEC);
    expect(message).toContain("parada");
    expect(message).not.toContain("chica para ocupar");
  });
});

describe("heroImageIssue — celular", () => {
  it("acepta la resolución recomendada", () => {
    expect(heroImageIssue(image("image-a-1080x1920-jpg"), HERO_MOBILE_SPEC)).toBe(true);
  });

  it("acepta la que está hoy en producción (940 × 1672)", () => {
    // Está justo arriba del mínimo de 900 × 1600. Si este test se pusiera en
    // rojo, el mínimo se habría subido por encima de lo que la iglesia ya usa.
    expect(heroImageIssue(image("image-a-940x1672-png"), HERO_MOBILE_SPEC)).toBe(true);
  });

  it("avisa cuando está acostada", () => {
    const message = heroImageIssue(image("image-a-1920x1080-jpg"), HERO_MOBILE_SPEC);
    expect(message).toContain("acostada");
  });

  it("avisa cuando es más chica que el mínimo", () => {
    const message = heroImageIssue(image("image-a-540x960-jpg"), HERO_MOBILE_SPEC);
    expect(message).toContain("540 × 960");
    expect(message).toContain("900 × 1600");
  });
});

describe("heroImageIssue — sin imagen", () => {
  it("no se queja: obligatorio u opcional lo decide el schema", () => {
    expect(heroImageIssue(undefined, HERO_DESKTOP_SPEC)).toBe(true);
    expect(heroImageIssue(null, HERO_MOBILE_SPEC)).toBe(true);
  });

  it("no inventa un problema si el _ref todavía no se puede leer", () => {
    expect(heroImageIssue({ asset: {} }, HERO_DESKTOP_SPEC)).toBe(true);
  });
});
