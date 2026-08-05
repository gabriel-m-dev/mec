/**
 * Chequeo del comparador que usa el guard de `scripts/seed-sanity.ts`.
 *
 * El proyecto todavía no tiene test runner, así que esto es un script suelto
 * sin dependencias nuevas: `npm run check:seed-guard`. Sale con código 1 si
 * algo falla, así que sirve igual en CI.
 *
 * Por qué existe justo para esto y no para otra cosa: `driftedFields` es lo
 * único que separa un `npm run seed` accidental de borrar, sin rastro, todo
 * lo que el cliente escribió desde el Studio. Un falso negativo acá no rompe
 * un test: destruye contenido real. De hecho ya atajó un bug — al extraer el
 * comparador a su propio módulo se perdió el filtro de `image` en dry-run y
 * el guard empezó a reportar 24 documentos con deriva falsa.
 */

import { driftedFields } from "./seed-guard";

let failed = 0;

function check(name: string, got: string[], want: string[]): void {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed += 1;
  console.log(
    `  ${ok ? "ok  " : "FALLA"} ${name}` +
      (ok ? "" : ` — obtuvo [${got.join(", ")}], esperaba [${want.join(", ")}]`),
  );
}

const base = { _id: "a", _type: "t", title: "Hola", tags: ["x", "y"] };

console.log("=== Guard del seed: comparador de deriva ===\n");
console.log("Sin deriva:");
check("documentos idénticos", driftedFields({ ...base }, { ...base }), []);
check(
  "campos de sistema ignorados",
  driftedFields({ ...base, _rev: "r1", _updatedAt: "2020" }, { ...base }),
  [],
);
check(
  "el orden de las claves no importa",
  driftedFields({ tags: ["x", "y"], title: "Hola", _id: "a", _type: "t" }, { ...base }),
  [],
);
check(
  "`ignore` respetado (el caso de `image` en dry-run)",
  driftedFields({ ...base, image: { asset: 1 } }, { ...base }, ["image"]),
  [],
);

console.log("\nCon deriva — esto es lo que el seed borraría:");
check(
  "texto editado desde el Studio",
  driftedFields({ ...base, title: "Editado por el cliente" }, { ...base }),
  ["title"],
);
check(
  "campo que el cliente agregó y el seed no conoce",
  driftedFields({ ...base, nuevo: "algo" }, { ...base }),
  ["nuevo"],
);
check(
  "campo que el seed escribe y no existe vivo",
  driftedFields({ ...base }, { ...base, extra: "v" }),
  ["extra"],
);
check("array reordenado", driftedFields({ ...base, tags: ["y", "x"] }, { ...base }), ["tags"]);
check("array más corto", driftedFields({ ...base, tags: ["x"] }, { ...base }), ["tags"]);
check("null no es lo mismo que ausente", driftedFields({ ...base, opt: null }, { ...base }), [
  "opt",
]);
check(
  "varios campos, ordenados alfabéticamente",
  driftedFields({ ...base, title: "T2", tags: ["z"] }, { ...base }),
  ["tags", "title"],
);

const withFaqs = {
  _id: "b",
  _type: "pageBanner",
  faqs: [{ _key: "faq-0", question: "P", answer: "R" }],
};
console.log("\nObjetos anidados dentro de arrays (el caso real de las FAQ):");
check("FAQ idéntica", driftedFields({ ...withFaqs }, { ...withFaqs }), []);
check(
  "respuesta de FAQ editada",
  driftedFields(
    { ...withFaqs, faqs: [{ _key: "faq-0", question: "P", answer: "R EDITADA" }] },
    withFaqs,
  ),
  ["faqs"],
);

console.log("");
if (failed > 0) {
  console.error(`${failed} chequeo(s) fallaron.`);
  process.exit(1);
}
console.log("Todo OK.");
