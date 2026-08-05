/**
 * Chequeo de las reglas de validación de `pageBanner`.
 *
 * Estas reglas solo se ven adentro del Studio, que no se puede inspeccionar
 * desde acá — el mismo punto ciego que dejó pasar el bug de `_key`, donde el
 * sitio público renderizaba perfecto y el Studio estaba roto. Ejecutarlas
 * aisladas es la única forma de saber que hacen lo que dicen.
 *
 * `npm run check:page-banner` — sale con código 1 si algo falla.
 */

import {
  duplicatedSectionKeys,
  faqHeadingWithoutQuestions,
  questionsWithoutFaqHeading,
} from "../sanity/schemaTypes/pageBannerValidation";

const LABELS = [
  { title: "Principal", value: "main" },
  { title: "Valores", value: "values" },
  { title: "Preguntas frecuentes", value: "faq" },
];

let failed = 0;

/** `want: true` = válido. `want: string` = tiene que fallar mencionando ese texto. */
function check(name: string, got: string | true, want: true | string): void {
  const ok = want === true ? got === true : typeof got === "string" && got.includes(want);
  if (!ok) failed += 1;
  console.log(
    `  ${ok ? "ok  " : "FALLA"} ${name}` +
      (ok ? "" : ` — obtuvo ${JSON.stringify(got)}, esperaba ${JSON.stringify(want)}`),
  );
}

const main = { key: "main", title: "T" };
const faqHeading = { key: "faq", title: "Preguntas" };
const question = { question: "P", answer: "R" };

console.log("=== Validación de pageBanner ===\n");

console.log("Claves de sección duplicadas:");
check("sin secciones", duplicatedSectionKeys(undefined, LABELS), true);
check("array vacío", duplicatedSectionKeys([], LABELS), true);
check("claves distintas", duplicatedSectionKeys([main, faqHeading], LABELS), true);
check(
  "dos secciones con la misma clave",
  duplicatedSectionKeys([main, { key: "main", title: "Otra" }], LABELS),
  "Principal",
);
check(
  "usa la etiqueta legible, no la clave interna",
  duplicatedSectionKeys([faqHeading, { key: "faq", title: "Otra" }], LABELS),
  "Preguntas frecuentes",
);
check(
  "sin etiquetas cae en la clave cruda",
  duplicatedSectionKeys([main, { key: "main", title: "Otra" }]),
  "main",
);
check("secciones sin clave se ignoran", duplicatedSectionKeys([{}, {}], LABELS), true);

console.log("\nEncabezado de FAQ sin preguntas:");
check("con encabezado y preguntas", faqHeadingWithoutQuestions([faqHeading], [question]), true);
check("sin encabezado de FAQ", faqHeadingWithoutQuestions([main], []), true);
check(
  "encabezado con preguntas vacías",
  faqHeadingWithoutQuestions([main, faqHeading], []),
  "al menos una pregunta",
);
check(
  "encabezado sin campo faqs",
  faqHeadingWithoutQuestions([faqHeading], undefined),
  "al menos una pregunta",
);

console.log("\nPreguntas sin su encabezado:");
check("con encabezado y preguntas", questionsWithoutFaqHeading([question], [faqHeading]), true);
check("sin preguntas", questionsWithoutFaqHeading([], [main]), true);
check("faqs ausente", questionsWithoutFaqHeading(undefined, [main]), true);
check(
  "preguntas cargadas sin encabezado",
  questionsWithoutFaqHeading([question], [main]),
  "Falta el encabezado",
);
check(
  "preguntas cargadas sin ninguna sección",
  questionsWithoutFaqHeading([question], undefined),
  "Falta el encabezado",
);

console.log("");
if (failed > 0) {
  console.error(`${failed} chequeo(s) fallaron.`);
  process.exit(1);
}
console.log("Todo OK.");
