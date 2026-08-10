/**
 * Limpieza acotada: saca los encabezados de sección que su página no dibuja.
 *
 * El desplegable de "Sección" ofrecía las tres claves en las siete páginas,
 * así que se cargaron encabezados en rutas que no los leen. `/capellanes` y
 * `/the-chosen` quedaron con una sección `main` que no se muestra en ningún
 * lado. Ahora el campo está oculto en esas páginas, o sea que desde el Studio
 * ya no se puede borrar: este script es la única forma de sacarlos.
 *
 * QUÉ CLAVES VALEN LO DECIDE `allowedSectionKeys`, el MISMO mapa que usa el
 * schema para avisar y para ocultar el campo. Si se copiara acá, las dos
 * verdades se separarían en la primera página nueva.
 *
 * Mismo criterio que las otras migraciones: `patch()` sobre documentos que YA
 * EXISTEN, nunca `createOrReplace`, nunca crea nada. Idempotente: correrlo dos
 * veces no cambia nada la segunda.
 *
 * Los encabezados que la página SÍ dibuja no se tocan. Si después de filtrar
 * no queda ninguno, se saca el campo entero en vez de dejar una lista vacía.
 *
 * Usage:
 *   npm run clean:sections                 # escribe (requiere SANITY_API_WRITE_TOKEN)
 *   npm run clean:sections -- --dry-run    # imprime el plan, no escribe
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

import { allowedSectionKeys } from "../sanity/schemaTypes/pageBannerValidation";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

interface SectionDoc {
  _id: string;
  route?: string;
  sections?: { _key: string; key?: string; title?: string }[];
}

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  console.log(
    DRY_RUN
      ? "=== Encabezados que su página no dibuja — DRY RUN (no writes performed) ===\n"
      : "=== Encabezados que su página no dibuja (patch acotado, no destructivo) ===\n",
  );

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!DRY_RUN && !token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
        "Tip: run `npm run clean:sections -- --dry-run` to preview the plan.",
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

  const banners = await client.fetch<SectionDoc[]>(
    '*[_type == "pageBanner"] | order(route asc){_id, route, sections}',
  );

  let tocados = 0;
  let sinCambios = 0;

  for (const banner of banners) {
    const cargadas = banner.sections ?? [];
    if (cargadas.length === 0) {
      sinCambios += 1;
      continue;
    }

    const permitidas = allowedSectionKeys(banner.route);
    const sobran = cargadas.filter((s) => !s.key || !permitidas.includes(s.key));

    if (sobran.length === 0) {
      console.log(`  ${banner.route} — las ${cargadas.length} sirven, sin cambios`);
      sinCambios += 1;
      continue;
    }

    const quedan = cargadas.filter((s) => s.key && permitidas.includes(s.key));
    const detalle = sobran.map((s) => `"${s.key}" (${s.title ?? "sin título"})`).join(", ");

    console.log(
      `  ${banner.route} — saca ${sobran.length}: ${detalle}` +
        (quedan.length > 0 ? ` | conserva ${quedan.length}` : " | queda sin encabezados"),
    );

    if (!DRY_RUN) {
      const patch = client.patch(banner._id);
      // Sin encabezados válidos se saca el campo entero: una lista vacía no es
      // lo mismo que no tener el campo, y ensucia igual.
      await (quedan.length > 0 ? patch.set({ sections: quedan }) : patch.unset(["sections"])).commit();
    }

    tocados += 1;
  }

  console.log("");
  console.log(`Páginas revisadas: ${banners.length}`);
  console.log(`${DRY_RUN ? "A limpiar" : "Limpiadas"}: ${tocados}`);
  console.log(`Sin cambios: ${sinCambios}`);
  console.log(DRY_RUN ? "\nDry run only — nothing was written." : "\nLimpieza completa.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
