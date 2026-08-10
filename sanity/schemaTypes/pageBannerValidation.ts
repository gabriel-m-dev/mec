/**
 * Las reglas de validación de `pageBanner`, como funciones puras.
 *
 * Viven afuera del schema por la misma razón que el comparador del seed vive
 * afuera del seed: solo se manifiestan adentro del Studio, que no se puede
 * inspeccionar desde acá, así que la única forma de saber que hacen lo que
 * dicen es poder ejecutarlas aisladas. Ver `scripts/seed-guard.check.ts`.
 *
 * OJO — ESTO NO PROTEGE EL DATASET: la validación de Sanity corre en el
 * Studio, NO en la API de mutación. Un script puede escribir documentos que
 * estas reglas rechazarían y la escritura pasa sin un error. Son avisos para
 * la persona que edita, no una garantía de integridad.
 */

export interface SectionLike {
  key?: string;
}

/**
 * Qué encabezados dibuja realmente cada página.
 *
 * NO es una preferencia editorial: es lo que hay escrito en el código de cada
 * página. `/noticias` busca `main` y nada más; `/cultos` busca `main` y `faq`;
 * `/capellanes`, `/the-chosen` y `/contacto` no leen el campo en absoluto y
 * sus títulos van escritos en el código, porque son la ESTRUCTURA de la página
 * y no su contenido.
 *
 * Existe porque el desplegable de "Sección" ofrecía las tres claves en las
 * siete páginas. Elegir una que esa página no dibuja no daba ningún error: se
 * cargaba el título, se publicaba, y no aparecía en ningún lado. De hecho
 * `/capellanes` y `/the-chosen` quedaron con una sección `main` cargada que no
 * se muestra en ninguna parte.
 *
 * Es el mismo criterio que el schema ya aplica con `hiddenUnlessAbout` y
 * `hiddenUnlessChaplaincy`: no ofrecer lo que no va a hacer nada.
 */
export const SECTION_KEYS_BY_ROUTE: Record<string, readonly string[]> = {
  "/quienes-somos": ["main", "values"],
  "/cultos": ["main", "faq"],
  "/eventos": ["main"],
  "/noticias": ["main"],
  "/capellanes": [],
  "/the-chosen": [],
  "/contacto": [],
};

/** Las claves que esa ruta dibuja. Una ruta desconocida no habilita ninguna. */
export function allowedSectionKeys(route: unknown): readonly string[] {
  return typeof route === "string" ? (SECTION_KEYS_BY_ROUTE[route] ?? []) : [];
}

/**
 * Avisa cuando se cargó un encabezado que ESA página no dibuja.
 *
 * El mensaje nombra las opciones que sí sirven en vez de decir solamente que
 * está mal: quien edita no tiene por qué saber qué lee cada página.
 */
export function sectionKeyNotUsedByRoute(
  sections: unknown,
  route: unknown,
  labels: SectionKeyLabels = [],
): string | true {
  if (!Array.isArray(sections)) return true;

  const permitidas = allowedSectionKeys(route);
  const nombre = (key: string) =>
    labels.find((label) => label.value === key)?.title ?? key;

  const sobrantes = [
    ...new Set(
      (sections as SectionLike[])
        .map((section) => section?.key)
        // `typeof` y no `Boolean(key)`: lo primero estrecha el tipo, lo
        // segundo no, y TypeScript sigue viendo `string | undefined`.
        .filter((key): key is string => typeof key === "string" && !permitidas.includes(key)),
    ),
  ];

  if (sobrantes.length === 0) return true;

  const listaSobrantes = sobrantes.map(nombre).join('", "');

  if (permitidas.length === 0) {
    return `Esta página no muestra encabezados de sección: sus títulos están escritos en el código. Sacá "${listaSobrantes}", porque no se va a ver en ningún lado.`;
  }

  return `Esta página no muestra "${listaSobrantes}". Las que sí usa son: "${permitidas
    .map(nombre)
    .join('", "')}".`;
}

/** Etiqueta legible de cada `key`, para que el mensaje no hable en jerga. */
export type SectionKeyLabels = { title: string; value: string }[];

/**
 * Un encabezado de preguntas frecuentes sin preguntas cargadas no se muestra:
 * la página exige las dos cosas. Sin este aviso el encabezado queda escrito
 * en el Studio y nunca aparece en el sitio, sin ninguna pista de por qué.
 */
export function faqHeadingWithoutQuestions(
  sections: unknown,
  faqs: unknown,
): string | true {
  if (!Array.isArray(sections)) return true;

  const hasFaqHeading = (sections as SectionLike[]).some((section) => section?.key === "faq");
  if (!hasFaqHeading) return true;

  const hasQuestions = Array.isArray(faqs) && faqs.length > 0;
  return hasQuestions
    ? true
    : 'La sección "Preguntas frecuentes" no se va a mostrar hasta que cargues al menos una pregunta abajo.';
}

/** El espejo: preguntas cargadas sin su encabezado tampoco se muestran. */
export function questionsWithoutFaqHeading(faqs: unknown, sections: unknown): string | true {
  if (!Array.isArray(faqs) || faqs.length === 0) return true;

  const hasFaqHeading =
    Array.isArray(sections) &&
    (sections as SectionLike[]).some((section) => section?.key === "faq");

  return hasFaqHeading
    ? true
    : 'Falta el encabezado: agregá una sección "Preguntas frecuentes" arriba, o estas preguntas no se van a mostrar.';
}

/**
 * Cada página busca su encabezado con `.find(s => s.key === "...")`, así que
 * una segunda sección con la misma `key` queda muerta: no se muestra en ningún
 * lado y nada indica por qué.
 */
export function duplicatedSectionKeys(
  sections: unknown,
  labels: SectionKeyLabels = [],
): string | true {
  if (!Array.isArray(sections)) return true;

  const seen = new Set<string>();
  const duplicated = new Set<string>();
  for (const section of sections as SectionLike[]) {
    if (!section?.key) continue;
    if (seen.has(section.key)) duplicated.add(section.key);
    seen.add(section.key);
  }

  if (duplicated.size === 0) return true;

  const names = [...duplicated].map(
    (key) => labels.find((label) => label.value === key)?.title ?? key,
  );
  return `Hay más de una sección "${names.join('", "')}". Solo se muestra la primera; borrá la repetida.`;
}
