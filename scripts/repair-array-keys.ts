/**
 * Reparación: agrega `_key` (y `_type`) a los objetos que viven adentro de
 * arrays en el dataset y no lo tienen.
 *
 * POR QUÉ EXISTE: la API de mutación de Sanity no valida contra el schema, así
 * que `scripts/seed-sanity.ts` y `scripts/migrate-page-sections.ts` escribieron
 * items de array sin `_key` y la escritura pasó sin un solo error. El sitio
 * público renderiza perfecto — las queries proyectan campos explícitos y nunca
 * miran `_key` — pero el Studio muestra "Claves faltantes" y BLOQUEA la edición
 * del array entero. El cliente no puede tocar la lista.
 *
 * QUÉ TOCA: exclusivamente `_key` y `_type` de los items que les falten.
 * El contenido vivo NO se toca: los valores se leen del dataset, no de los
 * literales congelados de `scripts/page-banners-data.ts`, así que todo lo que
 * el cliente haya editado desde el Studio se preserva tal cual. Un item que ya
 * tenga `_key` se deja intacto.
 *
 * Campos reparados (los únicos arrays de objetos del schema):
 *   - `pageBanner.sections`   -> `_type: "pageSection"`, `_key` desde `key`
 *   - `pageBanner.faqs`       -> `_type: "faqItem"`,     `_key` posicional
 *   - `siteSettings.socialLinks` -> `_type: "socialLink"`, `_key` desde `icon`
 *
 * Idempotente: correrlo dos veces no cambia nada la segunda vez. Las claves son
 * las mismas que derivan el seed y la migración, así que los tres convergen.
 *
 * Usage:
 *   npm run repair:array-keys              # escribe (requiere SANITY_API_WRITE_TOKEN)
 *   npm run repair:array-keys -- --dry-run  # audita e imprime el plan, no escribe
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

import { keyedFaqs, keyedSections, keyedSocialLinks, type Keyed } from "./sanity-array-keys";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

type ArrayItem = Record<string, unknown>;

/** Los arrays de objetos del schema, con la función que estampa sus claves. */
const REPAIRABLE: {
  docType: string;
  field: string;
  keyer: (items: readonly ArrayItem[]) => Keyed<ArrayItem>[];
}[] = [
  { docType: "pageBanner", field: "sections", keyer: keyedSections },
  { docType: "pageBanner", field: "faqs", keyer: keyedFaqs },
  { docType: "siteSettings", field: "socialLinks", keyer: keyedSocialLinks },
];

/**
 * Recorre el documento entero buscando objetos sin `_key` dentro de arrays.
 * El reparador de arriba es explícito a propósito, pero este walker es genérico
 * para que un array nuevo que aparezca en el futuro se reporte en vez de pasar
 * en silencio: si esto encuentra algo que `REPAIRABLE` no cubre, lo avisa.
 */
function findKeylessPaths(node: unknown, path = ""): string[] {
  if (Array.isArray(node)) {
    return node.flatMap((item, index) => {
      const nested = findKeylessPaths(item, `${path}[${index}]`);
      const isPlainObject =
        item !== null && typeof item === "object" && !Array.isArray(item);
      const missing =
        isPlainObject && !(item as ArrayItem)._key ? [path] : [];
      return [...missing, ...nested];
    });
  }

  if (node !== null && typeof node === "object") {
    return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
      findKeylessPaths(value, path ? `${path}.${key}` : key),
    );
  }

  return [];
}

async function main() {
  if (!PROJECT_ID) {
    throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  }
  if (!DATASET) {
    throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");
  }

  console.log(
    DRY_RUN
      ? "=== Reparación de _key en arrays — DRY RUN (no writes performed) ===\n"
      : "=== Reparación de _key en arrays (solo agrega _key/_type, no toca contenido) ===\n",
  );

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!DRY_RUN && !token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
        "Tip: run `npm run repair:array-keys -- --dry-run` to audit without a token.",
    );
    process.exit(1);
  }

  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: false,
    ...(token ? { token } : {}),
  });

  // Incluye borradores: un borrador con items sin `_key` rompe el Studio igual
  // que uno publicado, y hoy el editor trabaja sobre el borrador.
  //
  // Excluye los documentos de sistema de Sanity (`system.group` de permisos,
  // `sanity.imageAsset`, etc.): son del backend, no contenido nuestro, algunos
  // tienen arrays sin `_key` por diseño y NO hay que tocarlos.
  const docs = await client.fetch<Record<string, unknown>[]>(
    '*[!(_type match "system.**") && !(_type match "sanity.**")]',
  );

  let patched = 0;
  let itemsFixed = 0;
  const unhandled = new Set<string>();

  for (const doc of docs) {
    const docId = doc._id as string;
    const docType = doc._type as string;

    const patch: Record<string, Keyed<ArrayItem>[]> = {};

    for (const { docType: type, field, keyer } of REPAIRABLE) {
      if (type !== docType) continue;

      const items = doc[field];
      if (!Array.isArray(items) || items.length === 0) continue;

      const needsKeys = items.some(
        (item) => item !== null && typeof item === "object" && !item._key,
      );
      if (!needsKeys) continue;

      // Se re-derivan las claves sobre los items VIVOS, preservando el `_key`
      // de los que ya lo tengan para no renombrar nada que el Studio ya use.
      const keyed = keyer(items as ArrayItem[]);
      patch[field] = keyed.map((item, index) => {
        const existing = (items[index] as ArrayItem)._key;
        return existing ? { ...item, _key: existing as string } : item;
      });
      itemsFixed += items.filter(
        (item) => item !== null && typeof item === "object" && !item._key,
      ).length;
    }

    // Reporta cualquier array sin `_key` que `REPAIRABLE` no haya cubierto.
    for (const path of findKeylessPaths(doc)) {
      const covered = REPAIRABLE.some(
        (entry) => entry.docType === docType && entry.field === path,
      );
      if (!covered) unhandled.add(`${docType} :: ${path}`);
    }

    if (Object.keys(patch).length === 0) continue;

    const summary = Object.entries(patch)
      .map(([field, items]) => `${field} (${items.length})`)
      .join(", ");

    if (DRY_RUN) {
      console.log(`  ${docId} — repararía ${summary}`);
    } else {
      await client.patch(docId).set(patch).commit();
      console.log(`  ${docId} — reparado ${summary}`);
    }
    patched += 1;
  }

  console.log("");
  console.log(`Documentos revisados: ${docs.length}`);
  console.log(`Documentos ${DRY_RUN ? "a reparar" : "reparados"}: ${patched}`);
  console.log(`Items sin _key ${DRY_RUN ? "detectados" : "corregidos"}: ${itemsFixed}`);

  if (unhandled.size > 0) {
    console.log("");
    console.log("AVISO — arrays sin _key que este script NO cubre:");
    for (const entry of unhandled) console.log(`  ${entry}`);
    console.log("Agregarlos a REPAIRABLE y volver a correr.");
    process.exitCode = 1;
    return;
  }

  console.log(DRY_RUN ? "\nDry run only — nothing was written." : "\nReparación completa.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
