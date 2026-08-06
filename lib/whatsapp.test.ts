import { describe, expect, it } from "vitest";

import { buildWhatsAppUrl } from "./whatsapp";

const PHONE = "5491122334455";

describe("buildWhatsAppUrl — cuándo NO hay botón", () => {
  it("sin número", () => {
    expect(buildWhatsAppUrl(undefined)).toBeNull();
    expect(buildWhatsAppUrl(null)).toBeNull();
    expect(buildWhatsAppUrl("")).toBeNull();
  });

  it("un campo con solo espacios no cuenta como número", () => {
    expect(buildWhatsAppUrl("   ")).toBeNull();
  });

  it("texto sin dígitos", () => {
    expect(buildWhatsAppUrl("poner el numero")).toBeNull();
  });

  it("demasiado corto", () => {
    expect(buildWhatsAppUrl("1122334")).toBeNull();
  });

  it("demasiado largo para E.164", () => {
    expect(buildWhatsAppUrl("1234567890123456")).toBeNull();
  });
});

describe("buildWhatsAppUrl — normalización", () => {
  it("un número limpio pasa tal cual", () => {
    expect(buildWhatsAppUrl(PHONE)).toBe(`https://wa.me/${PHONE}`);
  });

  it("acepta el formato que la gente escribe de memoria", () => {
    expect(buildWhatsAppUrl("+54 9 11 2233-4455")).toBe(
      `https://wa.me/${PHONE}`,
    );
  });

  it("saca paréntesis y puntos", () => {
    expect(buildWhatsAppUrl("(549) 11.2233.4455")).toBe(
      `https://wa.me/${PHONE}`,
    );
  });
});

describe("buildWhatsAppUrl — mensaje inicial", () => {
  it("sin mensaje no agrega query string", () => {
    expect(buildWhatsAppUrl(PHONE)).toBe(`https://wa.me/${PHONE}`);
    expect(buildWhatsAppUrl(PHONE, "")).toBe(`https://wa.me/${PHONE}`);
    expect(buildWhatsAppUrl(PHONE, "   ")).toBe(`https://wa.me/${PHONE}`);
  });

  it("codifica espacios y acentos", () => {
    expect(buildWhatsAppUrl(PHONE, "Hola, quiero información")).toBe(
      `https://wa.me/${PHONE}?text=Hola%2C%20quiero%20informaci%C3%B3n`,
    );
  });

  it("codifica el & para que no corte la query string", () => {
    const url = buildWhatsAppUrl(PHONE, "cultos & eventos");
    expect(url).toBe(`https://wa.me/${PHONE}?text=cultos%20%26%20eventos`);
    // Un & sin codificar partiría el texto en dos parámetros.
    expect(new URL(url!).searchParams.get("text")).toBe("cultos & eventos");
  });

  it("recorta los espacios de los bordes", () => {
    expect(buildWhatsAppUrl(PHONE, "  Hola  ")).toBe(
      `https://wa.me/${PHONE}?text=Hola`,
    );
  });
});
