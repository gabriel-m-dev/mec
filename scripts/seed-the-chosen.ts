/**
 * Carga el contenido inicial de The Chosen: la persona a cargo y las
 * actividades, con sus fotos.
 *
 * TODO ESTO ES CONTENIDO DE RELLENO. Los textos están inventados y las fotos
 * son de Unsplash —licencia libre para uso comercial, sin atribución
 * obligatoria—. Existe para que la iglesia vea la sección armada y la edite
 * desde el Studio, en vez de arrancar frente a tres secciones vacías.
 *
 * La persona a cargo es un singleton: se usa `createIfNotExists` con el `_id`
 * fijo `chosenLeader`, así una segunda corrida no pisa lo que hayan editado.
 * Las actividades usan `create` con `_id` determinista y NO `createOrReplace`:
 * si ya existen, la API tira conflicto y el script las reporta como salteadas.
 *
 * Usage:
 *   npm run seed:the-chosen                 # escribe (requiere SANITY_API_WRITE_TOKEN)
 *   npm run seed:the-chosen -- --dry-run    # imprime el plan, no escribe
 */

import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

const IMAGE_DIR = "public/images/the-chosen";

const LEADER = {
  _id: "chosenLeader",
  file: "angel-palavecino.jpg",
  name: "Ángel A. Palavecino",
  role: "Coordinador general",
  description:
    "Acompaña a The Chosen desde sus primeros encuentros. Coordina al equipo de voluntarios, arma el calendario de actividades y está en contacto con las familias durante todo el año.\n\nSi querés que tu hijo o hija se sume, o si te interesa colaborar como voluntario, escribinos y te ponemos en contacto con él.",
  imageAlt: "Retrato del coordinador de The Chosen sonriendo",
};

const ACTIVITIES = [
  {
    _id: "chosenActivity-dia-del-nino",
    file: "dia-del-nino.jpg",
    title: "Día del niño",
    when: "recent",
    date: "Agosto",
    imageAlt: "Chicos jugando con un paracaídas de colores sobre el césped",
  },
  {
    _id: "chosenActivity-juegos-cooperativos",
    file: "juegos-cooperativos.jpg",
    title: "Juegos cooperativos",
    when: "recent",
    date: "Julio",
    imageAlt: "Grupo de chicos tirando de una soga durante un juego en equipo",
  },
  {
    _id: "chosenActivity-taller-manualidades",
    file: "taller-manualidades.jpg",
    title: "Taller de manualidades",
    when: "recent",
    date: "Junio",
    imageAlt: "Manos pintadas de azul durante un taller de manualidades",
  },
  {
    _id: "chosenActivity-torneo-futbol",
    file: "torneo-futbol.jpg",
    title: "Torneo de fútbol",
    when: "upcoming",
    date: "Noviembre",
    imageAlt: "Chicos jugando a la pelota en una cancha de césped",
  },
  {
    _id: "chosenActivity-campamento",
    file: "campamento.jpg",
    title: "Campamento de verano",
    when: "upcoming",
    date: "Enero",
    imageAlt: "Carpa de colores armada entre los árboles de un bosque",
  },
];

/**
 * Una galería de ejemplo, para que la iglesia vea cómo queda una actividad con
 * fotos y de dónde sale el enlace de la tarjeta. Se reusan las mismas fotos
 * que ya están en el repo: son de relleno igual que el resto.
 *
 * Solo se carga si la actividad NO tiene galería todavía.
 */
const GALLERY = {
  docId: "chosenActivity-dia-del-nino",
  files: ["dia-del-nino.jpg", "juegos-cooperativos.jpg", "torneo-futbol.jpg"],
};

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  console.log(
    DRY_RUN
      ? "=== The Chosen — DRY RUN (no writes performed) ===\n"
      : "=== The Chosen (contenido inicial, nunca pisa lo existente) ===\n",
  );

  // Se valida ANTES de escribir: si falta una foto, mejor cortar que dejar la
  // sección a medio cargar.
  for (const { file } of [LEADER, ...ACTIVITIES]) {
    if (!fs.existsSync(path.join(process.cwd(), IMAGE_DIR, file))) {
      console.error(`No existe el archivo: ${IMAGE_DIR}/${file}`);
      process.exit(1);
    }
  }

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!DRY_RUN && !token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
        "Tip: run `npm run seed:the-chosen -- --dry-run` to preview the plan.",
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

  async function uploadImage(file: string) {
    const asset = await client.assets.upload(
      "image",
      fs.createReadStream(path.join(process.cwd(), IMAGE_DIR, file)),
      { filename: file },
    );

    return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
  }

  // --- persona a cargo ---
  const existingLeader = await client.fetch<{ _id: string } | null>(
    '*[_id == "chosenLeader"][0]{_id}',
  );

  if (existingLeader) {
    console.log("  chosenLeader — ya existe, salteada");
  } else if (DRY_RUN) {
    console.log(`  chosenLeader — crearía "${LEADER.name}"`);
  } else {
    const { _id, file, ...fields } = LEADER;
    await client.create({
      _id,
      _type: "chosenLeader",
      ...fields,
      image: await uploadImage(file),
    });
    console.log(`  chosenLeader — "${LEADER.name}" creada`);
  }

  console.log("");

  // --- actividades ---
  let created = 0;
  let skipped = 0;

  for (const activity of ACTIVITIES) {
    if (DRY_RUN) {
      console.log(`  ${activity._id} — crearía "${activity.title}"`);
      created += 1;
      continue;
    }

    try {
      const { _id, file, ...fields } = activity;
      await client.create({
        _id,
        _type: "chosenActivity",
        ...fields,
        image: await uploadImage(file),
      });
      console.log(`  ${activity._id} — "${activity.title}" creada`);
      created += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already exists") || message.includes("conflict")) {
        console.log(`  ${activity._id} — ya existe, salteada`);
        skipped += 1;
        continue;
      }
      throw err;
    }
  }

  // --- galería de ejemplo ---
  console.log("");

  const conGaleria = await client.fetch<{ gallery?: unknown[] } | null>(
    "*[_id == $id][0]{gallery}",
    { id: GALLERY.docId },
  );

  if (!conGaleria) {
    console.log(`  ${GALLERY.docId} — no existe, galería salteada`);
  } else if ((conGaleria.gallery?.length ?? 0) > 0) {
    console.log(`  ${GALLERY.docId} — ya tiene galería, salteada`);
  } else if (DRY_RUN) {
    console.log(`  ${GALLERY.docId} — cargaría ${GALLERY.files.length} fotos`);
  } else {
    const gallery = [];

    for (const file of GALLERY.files) {
      const image = await uploadImage(file);
      // `_key` es obligatorio en los arrays de Sanity: sin él el Studio no
      // puede reordenar ni borrar elementos, y React duplica claves.
      gallery.push({ ...image, _key: file.replace(/\.[a-z]+$/i, "") });
    }

    await client.patch(GALLERY.docId).set({ gallery }).commit();
    console.log(`  ${GALLERY.docId} — ${gallery.length} fotos cargadas`);
  }

  console.log("");
  console.log(`Actividades ${DRY_RUN ? "a crear" : "creadas"}: ${created}`);
  console.log(`Salteadas — ya existían: ${skipped}`);
  console.log(
    DRY_RUN
      ? "\nDry run only — nothing was written."
      : "\nListo. Todo esto es contenido de relleno: se edita desde el Studio.",
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
