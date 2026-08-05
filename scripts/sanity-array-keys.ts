/**
 * Sanity exige `_key` — un string único DENTRO de cada array — en todo objeto
 * que viva adentro de un array. Sin `_key`, la API de mutación acepta la
 * escritura igual (no valida contra el schema, ver el mismo problema en
 * `siteSettings.socialLinks`), el sitio renderiza perfecto porque las queries
 * proyectan campos explícitos... pero el Studio muestra "Claves faltantes" y
 * BLOQUEA la edición del array entero. El cliente no puede tocar la lista.
 *
 * Por eso `_key` NUNCA se escribe a mano en los literales de
 * `scripts/page-banners-data.ts` ni en los del seed: se estampa acá, en un
 * solo lugar, en el momento de escribir. Cualquier script que mande un array
 * de objetos a Sanity tiene que pasarlo por una de estas funciones.
 *
 * Las claves son DETERMINISTAS a propósito: el seed, la migración y la
 * reparación derivan exactamente la misma clave para el mismo item, así que
 * correr cualquiera de los tres dos veces no genera churn ni duplica nada.
 *
 * También se estampa `_type` con el nombre del objeto declarado en el schema
 * (`pageSection`, `faqItem`, `socialLink`) — es lo que escribe el Studio
 * cuando el editor agrega un item a mano, y así los items migrados y los
 * creados desde el Studio quedan idénticos.
 */

/** Item de array tal como lo espera Sanity: el objeto original + `_key` y `_type`. */
export type Keyed<T> = T & { _key: string; _type: string };

/**
 * Normaliza un candidato a `_key`: Sanity acepta cualquier string, pero
 * conviene que sea legible en el JSON del documento y estable.
 */
const COMBINING_MARKS = /[\u0300-\u036f]/g;

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Estampa `_key`/`_type` sobre cada item, derivando la clave con `derive` y
 * garantizando unicidad dentro del array: si dos items derivan la misma clave
 * (por ejemplo dos `sections` con el mismo `key`, que hoy nada impide), al
 * segundo se le agrega un sufijo posicional en vez de generar un `_key`
 * duplicado — que es justo lo que rompe el Studio.
 */
function withKeys<T>(
  items: readonly T[],
  type: string,
  derive: (item: T, index: number) => string,
): Keyed<T>[] {
  const used = new Set<string>();

  return items.map((item, index) => {
    const base = slug(derive(item, index)) || `${type}-${index}`;
    let key = base;
    let suffix = 2;
    while (used.has(key)) {
      key = `${base}-${suffix}`;
      suffix += 1;
    }
    used.add(key);

    return { ...item, _key: key, _type: type };
  });
}

/** `pageBanner.sections` — clave derivada del campo `key` (`main`, `values`, `faq`). */
export function keyedSections<T extends { key?: string }>(sections: readonly T[]): Keyed<T>[] {
  return withKeys(sections, "pageSection", (section, index) => section.key ?? `section-${index}`);
}

/**
 * `pageBanner.faqs` — no hay campo natural que las identifique, así que la
 * clave es posicional. No importa que el cliente después las reordene: Sanity
 * mueve el objeto entero con su `_key` puesto, la clave solo tiene que ser
 * única, no indicar el orden.
 */
export function keyedFaqs<T>(faqs: readonly T[]): Keyed<T>[] {
  return withKeys(faqs, "faqItem", (_faq, index) => `faq-${index}`);
}

/** `pageBanner.stats` — clave derivada de la descripción, única por cifra. */
export function keyedStats<T extends { label?: string }>(stats: readonly T[]): Keyed<T>[] {
  return withKeys(stats, "statItem", (stat, index) => stat.label ?? `stat-${index}`);
}

/** `pageBanner.values` — clave derivada del ícono, uno por tarjeta. */
export function keyedValues<T extends { icon?: string }>(values: readonly T[]): Keyed<T>[] {
  return withKeys(values, "valueItem", (value, index) => value.icon ?? `value-${index}`);
}

/** `siteSettings.socialLinks` — clave derivada de `icon`, único por plataforma. */
export function keyedSocialLinks<T extends { icon?: string }>(links: readonly T[]): Keyed<T>[] {
  return withKeys(links, "socialLink", (link, index) => link.icon ?? `social-${index}`);
}
