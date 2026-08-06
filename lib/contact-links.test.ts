import { describe, expect, it } from "vitest";

import { mailtoHref, telHref } from "./contact-links";

describe("telHref — cuándo NO hay enlace", () => {
  it("sin teléfono", () => {
    expect(telHref(undefined)).toBeNull();
    expect(telHref(null)).toBeNull();
    expect(telHref("")).toBeNull();
    expect(telHref("   ")).toBeNull();
  });

  it("texto sin dígitos", () => {
    expect(telHref("consultar")).toBeNull();
  });

  it("muy corto para ser un teléfono", () => {
    expect(telHref("1234")).toBeNull();
  });

  it("más largo que E.164", () => {
    expect(telHref("1234567890123456")).toBeNull();
  });
});

describe("telHref — limpieza del href", () => {
  it("saca paréntesis, espacios y guiones", () => {
    expect(telHref("(011) 4444-5555")).toBe("tel:01144445555");
  });

  it("conserva el + inicial, que es lo que hace andar el número internacional", () => {
    expect(telHref("+54 11 4444-5555")).toBe("tel:+541144445555");
  });

  it("un + que no está al principio no cuenta como prefijo internacional", () => {
    expect(telHref("11 4444-5555+")).toBe("tel:1144445555");
  });

  it("un número ya limpio pasa igual", () => {
    expect(telHref("01144445555")).toBe("tel:01144445555");
  });
});

describe("mailtoHref — cuándo NO hay enlace", () => {
  it("sin correo", () => {
    expect(mailtoHref(undefined)).toBeNull();
    expect(mailtoHref(null)).toBeNull();
    expect(mailtoHref("")).toBeNull();
    expect(mailtoHref("   ")).toBeNull();
  });

  it("sin arroba", () => {
    expect(mailtoHref("contacto.mec.org.ar")).toBeNull();
  });

  it("con dos arrobas", () => {
    expect(mailtoHref("hola@mec@org.ar")).toBeNull();
  });

  it("sin punto en el dominio", () => {
    expect(mailtoHref("hola@localhost")).toBeNull();
  });

  it("sin parte de usuario", () => {
    expect(mailtoHref("@mec.org.ar")).toBeNull();
  });

  it("con espacios en el medio, que romperían el enlace", () => {
    expect(mailtoHref("hola @mec.org.ar")).toBeNull();
  });
});

describe("mailtoHref — direcciones válidas", () => {
  it("una dirección común", () => {
    expect(mailtoHref("contacto@mec.org.ar")).toBe("mailto:contacto@mec.org.ar");
  });

  it("recorta los espacios de los bordes", () => {
    expect(mailtoHref("  contacto@mec.org.ar  ")).toBe(
      "mailto:contacto@mec.org.ar",
    );
  });

  it("acepta las que la gente usa de verdad, con puntos y signos", () => {
    expect(mailtoHref("info.pastoral+web@mec.org.ar")).toBe(
      "mailto:info.pastoral+web@mec.org.ar",
    );
  });
});
