/**
 * Estos tests existen por un bug real: deslizar en ráfaga dejaba el carrusel
 * vacío. La causa era enteramente de este cálculo, pero estaba enterrado
 * adentro de un componente y no había forma de ejecutarlo aislado, así que el
 * único modo de encontrarlo fue que lo reportara el usuario.
 */

import { describe, expect, it } from "vitest";

import {
  activeSlide,
  isCentered,
  recenter,
  startIndex,
  step,
  wrap,
} from "./carousel-index";

/** Cuatro destacados es lo que tiene la portada hoy. */
const TOTAL = 4;
/** Las posiciones dibujadas van de 0 a esto. */
const ULTIMA_POSICION = TOTAL * 3 - 1;

describe("wrap", () => {
  it("deja los valores que ya están en rango", () => {
    expect(wrap(0, 5)).toBe(0);
    expect(wrap(4, 5)).toBe(4);
  });

  it("da la vuelta hacia adelante", () => {
    expect(wrap(5, 5)).toBe(0);
    expect(wrap(7, 5)).toBe(2);
  });

  it("da la vuelta hacia atrás, que es donde falla el módulo pelado", () => {
    // `-1 % 5` en JavaScript da -1. Con eso, retroceder desde la primera
    // rompía el cálculo entero.
    expect(-1 % 5).toBe(-1);
    expect(wrap(-1, 5)).toBe(4);
    expect(wrap(-6, 5)).toBe(4);
  });
});

describe("startIndex / activeSlide / recenter / isCentered", () => {
  it("arranca en la copia del medio", () => {
    expect(startIndex(TOTAL, true)).toBe(TOTAL);
    expect(isCentered(startIndex(TOTAL, true), TOTAL)).toBe(true);
  });

  it("sin bucle arranca en cero", () => {
    expect(startIndex(TOTAL, false)).toBe(0);
  });

  it("traduce cualquier copia a la misma diapositiva real", () => {
    // Las tres posiciones que muestran la diapositiva 1.
    expect(activeSlide(1, TOTAL, true)).toBe(1);
    expect(activeSlide(1 + TOTAL, TOTAL, true)).toBe(1);
    expect(activeSlide(1 + TOTAL * 2, TOTAL, true)).toBe(1);
  });

  it("reubica sin cambiar la diapositiva que se ve", () => {
    for (let index = 0; index <= ULTIMA_POSICION; index++) {
      const recentrado = recenter(index, TOTAL);
      expect(activeSlide(recentrado, TOTAL, true)).toBe(activeSlide(index, TOTAL, true));
      expect(isCentered(recentrado, TOTAL)).toBe(true);
    }
  });
});

describe("step — dentro de la banda", () => {
  it("un paso normal se anima", () => {
    expect(step(TOTAL, 1, TOTAL, true)).toEqual({ index: TOTAL + 1, animated: true });
    expect(step(TOTAL + 2, -1, TOTAL, true)).toEqual({ index: TOTAL + 1, animated: true });
  });

  it("salir de la copia del medio se anima: es el paso que da la vuelta", () => {
    // Desde la última de la copia del medio hacia adelante. Tiene que
    // deslizarse, porque es el movimiento que el visitante ve como "sigue".
    expect(step(TOTAL * 2 - 1, 1, TOTAL, true)).toEqual({
      index: TOTAL * 2,
      animated: true,
    });
    // Y hacia atrás desde la primera.
    expect(step(TOTAL, -1, TOTAL, true)).toEqual({
      index: TOTAL - 1,
      animated: true,
    });
  });
});

describe("step — el bug de la ráfaga", () => {
  it("pasarse de la banda reubica en vez de seguir creciendo", () => {
    const resultado = step(TOTAL * 2, 1, TOTAL, true);
    expect(resultado.animated).toBe(false);
    expect(isCentered(resultado.index, TOTAL)).toBe(true);
    // Y muestra la diapositiva correcta: la siguiente a la que estaba.
    expect(activeSlide(resultado.index, TOTAL, true)).toBe(
      activeSlide(TOTAL * 2 + 1, TOTAL, true),
    );
  });

  it("lo mismo hacia atrás", () => {
    const resultado = step(TOTAL - 1, -1, TOTAL, true);
    expect(resultado.animated).toBe(false);
    expect(isCentered(resultado.index, TOTAL)).toBe(true);
    expect(activeSlide(resultado.index, TOTAL, true)).toBe(
      activeSlide(TOTAL - 2, TOTAL, true),
    );
  });

  it("200 pasos seguidos sin reubicar nunca: la posición JAMÁS se sale de lo dibujado", () => {
    // Es exactamente el escenario que rompía: deslizar sin darle tiempo al
    // temporizador que reubica. Antes, la posición crecía sin techo y el riel
    // quedaba trasladado a donde no hay diapositivas.
    for (const direction of [1, -1] as const) {
      let index = startIndex(TOTAL, true);

      for (let i = 0; i < 200; i++) {
        index = step(index, direction, TOTAL, true).index;
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThanOrEqual(ULTIMA_POSICION);
      }
    }
  });

  it("la ráfaga avanza de a una: no se saltea ni repite diapositivas", () => {
    let index = startIndex(TOTAL, true);
    let esperada = 0;

    for (let i = 0; i < 200; i++) {
      index = step(index, 1, TOTAL, true).index;
      esperada = wrap(esperada + 1, TOTAL);
      expect(activeSlide(index, TOTAL, true)).toBe(esperada);
    }
  });

  it("aguanta cambios de sentido en el medio de la ráfaga", () => {
    let index = startIndex(TOTAL, true);
    let esperada = 0;

    // Un patrón irregular, como el de alguien deslizando para los dos lados.
    const movimientos: (1 | -1)[] = [1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, 1, 1, -1];

    for (let vuelta = 0; vuelta < 20; vuelta++) {
      for (const direction of movimientos) {
        index = step(index, direction, TOTAL, true).index;
        esperada = wrap(esperada + direction, TOTAL);

        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThanOrEqual(ULTIMA_POSICION);
        expect(activeSlide(index, TOTAL, true)).toBe(esperada);
      }
    }
  });

  it("las vecinas existen siempre: nunca se ve un hueco al lado", () => {
    let index = startIndex(TOTAL, true);

    for (let i = 0; i < 200; i++) {
      index = step(index, 1, TOTAL, true).index;
      expect(index - 1).toBeGreaterThanOrEqual(0);
      expect(index + 1).toBeLessThanOrEqual(ULTIMA_POSICION);
    }
  });
});

describe("step — con pocas diapositivas", () => {
  it("aguanta el mínimo con bucle, que son dos", () => {
    let index = startIndex(2, true);

    for (let i = 0; i < 100; i++) {
      index = step(index, 1, 2, true).index;
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThanOrEqual(2 * 3 - 1);
      expect(index - 1).toBeGreaterThanOrEqual(0);
      expect(index + 1).toBeLessThanOrEqual(2 * 3 - 1);
    }
  });

  it("sin bucle no reubica: no hay copias que rotar", () => {
    expect(step(0, 1, 1, false)).toEqual({ index: 1, animated: true });
  });
});
