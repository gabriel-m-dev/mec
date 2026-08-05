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
