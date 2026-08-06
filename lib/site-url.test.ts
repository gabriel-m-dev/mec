/**
 * Esta funcion ya fallo una vez en produccion, y en silencio: cayo en
 * `VERCEL_URL` y el `robots.txt` publicado quedo anunciando el sitemap en
 * `iglesiawebproject-5kalok2ek-gabriel-m-devs-projects.vercel.app`, la URL
 * unica de ese deploy. El siguiente push la mataba.
 *
 * Nada en la app avisa de eso: la pagina renderiza igual. Por eso el orden de
 * precedencia se fija con tests y no con una lectura del codigo.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getSiteUrl } from "./site-url";

const VARS = [
  "NEXT_PUBLIC_SITE_URL",
  "SITE_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(VARS.map((name) => [name, process.env[name]]));
  for (const name of VARS) delete process.env[name];
});

afterEach(() => {
  for (const name of VARS) {
    const value = saved[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

describe("getSiteUrl — precedencia", () => {
  it("sin ninguna variable cae en localhost", () => {
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("NEXT_PUBLIC_SITE_URL le gana a todas", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://mec.org.ar";
    process.env.SITE_URL = "https://no.example";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "no.example";
    process.env.VERCEL_URL = "no.example";
    expect(getSiteUrl()).toBe("https://mec.org.ar");
  });

  it("SITE_URL le gana a las dos de Vercel", () => {
    process.env.SITE_URL = "https://mec.org.ar";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "no.example";
    process.env.VERCEL_URL = "no.example";
    expect(getSiteUrl()).toBe("https://mec.org.ar");
  });

  it("EL BUG: el dominio de produccion le gana a la URL del deploy", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "iglesiawebproject.vercel.app";
    process.env.VERCEL_URL = "iglesiawebproject-5kalok2ek-equipo.vercel.app";
    expect(getSiteUrl()).toBe("https://iglesiawebproject.vercel.app");
  });

  it("VERCEL_URL se usa solo si no hay nada mejor", () => {
    process.env.VERCEL_URL = "preview-abc123.vercel.app";
    expect(getSiteUrl()).toBe("https://preview-abc123.vercel.app");
  });
});

describe("getSiteUrl — forma de la URL", () => {
  it("las variables de Vercel vienen sin protocolo y se les agrega https", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "iglesiawebproject.vercel.app";
    expect(getSiteUrl()).toBe("https://iglesiawebproject.vercel.app");
  });

  it("una URL que ya trae protocolo no se toca", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://mec.org.ar";
    expect(getSiteUrl()).toBe("https://mec.org.ar");
  });

  it("respeta http:// para poder trabajar en local", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:4000";
    expect(getSiteUrl()).toBe("http://localhost:4000");
  });

  it("el resultado siempre es una URL valida para metadataBase", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "iglesiawebproject.vercel.app";
    expect(() => new URL(getSiteUrl())).not.toThrow();
  });
});
