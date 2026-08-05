/**
 * El comparador que usa el guard de `scripts/seed-sanity.ts`.
 *
 * Vive en su propio módulo, sin estado ni efectos, por dos razones: es la
 * pieza de la que depende que el seed NO borre trabajo del cliente, así que
 * tiene que poder verificarse aislada; y el seed no se puede importar para
 * probarlo porque ejecuta `main()` al cargar el módulo.
 */

/** Campos de sistema de Sanity: cambian solos, compararlos daría falsos positivos. */
export const SYSTEM_FIELDS = new Set(["_id", "_type", "_rev", "_createdAt", "_updatedAt"]);

/** Igualdad estructural con claves ordenadas, para que el orden no invente diferencias. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
  }

  const aKeys = Object.keys(a as object).sort();
  const bKeys = Object.keys(b as object).sort();
  if (aKeys.length !== bKeys.length || aKeys.some((k, i) => k !== bKeys[i])) return false;

  return aKeys.every((k) =>
    deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
  );
}

/**
 * Campos donde el documento VIVO difiere de lo que el seed escribiría.
 *
 * Mira la unión de las claves de los dos lados a propósito: un campo que el
 * cliente agregó y el seed no conoce igual se pierde con `createOrReplace`,
 * así que también cuenta como deriva.
 *
 * `ignore` existe para el dry-run, donde las imágenes no se suben y por lo
 * tanto `next.image` viene vacío en todos los documentos.
 */
export function driftedFields(
  live: Record<string, unknown>,
  next: Record<string, unknown>,
  ignore: Iterable<string> = [],
): string[] {
  const ignored = new Set(ignore);
  const keys = new Set([...Object.keys(live), ...Object.keys(next)]);
  const drifted: string[] = [];

  for (const key of keys) {
    if (SYSTEM_FIELDS.has(key) || ignored.has(key)) continue;
    if (!deepEqual(live[key], next[key])) drifted.push(key);
  }

  return drifted.sort();
}
