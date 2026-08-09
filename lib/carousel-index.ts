/**
 * El cálculo de posición del carrusel de la portada, como funciones puras.
 *
 * Vive afuera del componente porque el bug que tuvo —deslizar en ráfaga dejaba
 * el riel vacío— era enteramente de ESTE cálculo, y adentro de un componente
 * no había forma de ejecutarlo aislado. Mismo criterio que las validaciones de
 * los schemas.
 *
 * EL MODELO. La lista de diapositivas se dibuja TRES VECES seguidas y el
 * índice se mantiene en la copia del medio, así siempre hay una copia entera a
 * cada lado de donde sacar las vecinas que asoman. Las posiciones válidas van
 * de 0 a `total * 3 - 1`.
 */

/** Resto siempre positivo: `-1 % 5` da `-1` en JavaScript, y acá hace falta 4. */
export function wrap(value: number, length: number): number {
  return ((value % length) + length) % length;
}

export type CarouselView = {
  /** Posición dentro de las tres copias. */
  index: number;
  /** Si el cambio se anima o se aplica de golpe. */
  animated: boolean;
};

/**
 * La primera posición: el comienzo de la copia del medio.
 *
 * Sin bucle no hay copias y se arranca en cero.
 */
export function startIndex(total: number, loops: boolean): number {
  return loops ? total : 0;
}

/**
 * Cuál de las diapositivas REALES corresponde a una posición, sin importar en
 * qué copia esté. Es lo que miran los puntos.
 */
export function activeSlide(index: number, total: number, loops: boolean): number {
  return loops ? wrap(index, total) : 0;
}

/**
 * La posición equivalente dentro de la copia del medio.
 *
 * Se ve exactamente igual que la de entrada: cambia en qué copia estamos
 * parados, no qué diapositiva ni dónde. Por eso el salto puede hacerse sin
 * animar y no se nota.
 */
export function recenter(index: number, total: number): number {
  return total + wrap(index, total);
}

/** Si la posición ya está en la copia del medio y no hay nada que reubicar. */
export function isCentered(index: number, total: number): boolean {
  return index >= total && index < total * 2;
}

/**
 * Un paso, sin dejar nunca que la posición se salga de lo dibujado.
 *
 * LA BANDA SEGURA es la copia del medio más UNA posición a cada lado:
 * `[total - 1, total * 2]`. Ahí siempre existen la diapositiva y sus dos
 * vecinas. Un paso que cae adentro se anima normal.
 *
 * EL BUG QUE ESTO EVITA. La reubicación a la copia del medio corre con un
 * temporizador que se reinicia con cada movimiento, así que deslizando en
 * ráfaga no llega a ejecutarse. Sin esta banda la posición seguía creciendo,
 * se pasaba de `total * 3 - 1`, y el riel quedaba trasladado a un lugar donde
 * no hay ninguna diapositiva: la pantalla vacía. Los puntos seguían bien
 * porque leen `activeSlide`, que siempre devuelve un valor válido — de ahí el
 * síntoma de "cambian los puntos y no se ve ninguna foto".
 *
 * Cuando el paso se pasaría de la banda se reubica Y se aplica el paso en la
 * misma tanda, sin animar: se pierde el deslizamiento de ESE paso, que es
 * preferible a quedarse en blanco.
 */
export function step(
  index: number,
  direction: 1 | -1,
  total: number,
  loops: boolean,
): CarouselView {
  const next = index + direction;

  if (!loops || (next >= total - 1 && next <= total * 2)) {
    return { index: next, animated: true };
  }

  return { index: recenter(next, total), animated: false };
}
