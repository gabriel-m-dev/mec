/**
 * Additive seed script for the Sanity dataset.
 *
 * ADDITIVE ONLY — this script NEVER deletes anything. It writes documents
 * with `createOrReplace` targeting deterministic, slug-derived IDs, so
 * re-running it is always safe: existing content gets updated in place,
 * nothing is duplicated. For the destructive counterpart (which deletes
 * every document of the managed types), see `scripts/seed-reset.ts`.
 *
 * Usage:
 *   npm run seed                # escribe (requiere SANITY_API_WRITE_TOKEN)
 *   npm run seed -- --dry-run   # imprime el plan y corre el guard, sin token ni escrituras
 *   npm run seed -- --force     # pisa las ediciones del cliente (ver el guard)
 *
 * ⚠️ POR QUÉ ESTE SCRIPT ES PELIGROSO:
 * usa `createOrReplace` con IDs deterministas, así que reemplaza el documento
 * ENTERO por los literales congelados de este archivo. Desde que el sitio lee
 * todo en vivo desde Sanity y el cliente edita desde `/studio`, correrlo a lo
 * bruto pisaría el trabajo del cliente sin dejar rastro.
 *
 * 🛡️ EL GUARD (ver `flush()`):
 * antes de escribir NADA, el script compara cada documento que va a escribir
 * contra el que está vivo en el dataset. Si encuentra diferencias — que por
 * definición son ediciones hechas desde el Studio — imprime QUÉ documentos y
 * QUÉ campos se perderían y ABORTA sin escribir una sola letra. `--force` lo
 * saltea, pero recién después de haber mostrado el daño.
 *
 * Esto invierte el default: antes había que acordarse de la advertencia, ahora
 * el script se frena solo. Un dataset recién creado no tiene nada que perder y
 * el seed corre igual que siempre.
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

import type {
  SiteSettings,
  Venue,
  Ministry,
  Chaplain,
  WorshipService,
  Event as EventDoc,
  NewsItem,
  PageBanner,
  SocialLink,
  SocialIcon,
} from "../sanity/lib/types";
import { PAGE_BANNERS } from "./page-banners-data";
import { driftedFields } from "./seed-guard";
import {
  keyedFaqs,
  keyedSections,
  keyedSocialLinks,
  keyedStats,
  keyedValues,
} from "./sanity-array-keys";

// Load .env.local the same way Next.js does — this script runs standalone via
// tsx, outside the Next.js process, so env vars are not loaded automatically.
loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

const DOC_TYPES = {
  SITE_SETTINGS: "siteSettings",
  VENUE: "venue",
  MINISTRY: "ministry",
  CHAPLAIN: "chaplain",
  WORSHIP_SERVICE: "worshipService",
  EVENT: "event",
  NEWS_ITEM: "newsItem",
  PAGE_BANNER: "pageBanner",
} as const;

type DocType = (typeof DOC_TYPES)[keyof typeof DOC_TYPES];

const DOC_TYPE_ORDER: DocType[] = [
  DOC_TYPES.SITE_SETTINGS,
  DOC_TYPES.VENUE,
  DOC_TYPES.MINISTRY,
  DOC_TYPES.CHAPLAIN,
  DOC_TYPES.WORSHIP_SERVICE,
  DOC_TYPES.EVENT,
  DOC_TYPES.NEWS_ITEM,
  DOC_TYPES.PAGE_BANNER,
];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Snapshot histórico congelado del contenido estático original de
// `lib/content.ts` (PR C3). Estos 8 conjuntos de datos vivían antes como
// exports públicos ahí, pero ya nadie en `app/` ni `components/` los
// importa — las páginas leen de Sanity desde PR C1/C2. Se mueven acá,
// como constantes locales (no exportadas), en vez de borrarse, porque son
// el único consumidor real que queda: el seed necesita estos valores tal
// cual se escribieron en el dataset la primera vez. NO editar estos
// literales para reflejar cambios hechos por el cliente en el Studio — el
// dataset vivo es la fuente de verdad ahora, esto es solo el punto de
// partida histórico.
const ministries = [
  {
    name: "Alabanza y adoración",
    description:
      "Diseñamos atmósferas de adoración que elevan la presencia de Dios con excelencia.",
    image: "/images/ministries/alabanza.jpg",
    imageAlt: "Personas con las manos levantadas en un tiempo de adoración",
  },
  {
    name: "Juventud MEC",
    description:
      "Espacios para formación, comunidad y liderazgo con identidad firme.",
    image: "/images/ministries/juventud.jpg",
    imageAlt: "Grupo de jóvenes orando juntos al aire libre",
  },
  {
    name: "Niños y familias",
    description:
      "Formación bíblica creativa para sembrar fe sólida en cada hogar.",
    image: "/images/ministries/ninos-familias.jpg",
    imageAlt: "Familia jugando y compartiendo tiempo juntos en casa",
  },
  {
    name: "Intercesión y misericordia",
    description:
      "Oración estratégica, apoyo a necesitados y respuesta pastoral oportuna.",
    image: "/images/ministries/intercesion.jpg",
    imageAlt: "Primer plano de manos en oración con un rosario",
  },
];

const chaplains = [
  {
    name: "Pr. Daniel Medina",
    role: "Capellán general",
    description:
      "Lidera el cuidado espiritual, la escucha pastoral y el acompañamiento a familias.",
    image: "/images/chaplains/daniel-medina.jpg",
    imageAlt: "Retrato de un pastor con traje oscuro mirando a la cámara",
  },
  {
    name: "Lic. Andrea López",
    role: "Consejería y orientación",
    description:
      "Acompaña procesos emocionales y familiares con enfoque humano y bíblico.",
    image: "/images/chaplains/andrea-lopez.jpg",
    imageAlt: "Retrato de una consejera sonriendo con actitud profesional",
  },
  {
    name: "Pr. Esteban Ruiz",
    role: "Capellán de misión",
    description:
      "Coordina visitas, oración en territorio y soporte a equipos de servicio.",
    image: "/images/chaplains/esteban-ruiz.jpg",
    imageAlt: "Retrato de un pastor sonriendo con calidez",
  },
];

const worshipServices = [
  {
    title: "Presencial",
    description: "Auditorio Luz de Vida",
    detail: "Domingos 10:00 AM y miércoles 7:30 PM",
    cta: "Ver dirección",
  },
  {
    title: "En vivo",
    description: "YouTube y Facebook Live",
    detail: "Transmisión con chat activo y oración en línea",
    cta: "Ver transmisión",
  },
  {
    title: "En línea",
    description: "MEC Online",
    detail: "Mensajes, devocionales y recursos bajo demanda",
    cta: "Entrar al sitio",
  },
];

const events = [
  {
    day: "Viernes",
    title: "Noche de adoración",
    description: "Un tiempo de ministración profunda y oración congregacional.",
    image: "/images/events/noche-adoracion.jpg",
    imageAlt: "Persona con las manos levantadas durante un tiempo de adoración",
  },
  {
    day: "Domingo",
    title: "Encuentro de familias",
    description: "Herramientas prácticas para fortalecer el hogar y la fe.",
    image: "/images/events/encuentro-familias.jpg",
    imageAlt: "Familia sonriendo junta en la sala de su casa",
  },
  {
    day: "Sábado",
    title: "Conferencia de liderazgo",
    description: "Formación para servidores, líderes y nuevos equipos.",
    image: "/images/events/conferencia-liderazgo.jpg",
    imageAlt: "Orador dirigiéndose a una audiencia desde un podio",
  },
  {
    day: "Jueves",
    title: "Vigilia de oración",
    description: "Una noche extendida de intercesión, quietud y búsqueda de Dios en comunidad.",
    image: "/images/events/vigilia-oracion.jpg",
    imageAlt: "Personas sosteniendo velas encendidas durante una vigilia nocturna",
  },
  {
    day: "Martes",
    title: "Encuentro de mentoría",
    description: "Espacios uno a uno para acompañar procesos de discipulado y crecimiento personal.",
    image: "/images/events/encuentro-mentoria.jpg",
    imageAlt: "Dos personas conversando sentadas en un banco",
  },
];

const news = [
  {
    category: "Institucional",
    title: "Renovamos nuestras noches de oración con enfoque pastoral",
    summary:
      "Más acompañamiento, más escucha y una ruta clara para quien necesita apoyo espiritual.",
    image: "/images/news/noches-oracion.jpg",
    imageAlt: "Grupo de personas sosteniendo velas durante una noche de oración",
  },
  {
    category: "Comunidad",
    title: "Lanzamos una red de voluntariado para visitas y ayuda social",
    summary:
      "Servir mejor, llegar más lejos y responder con compasión donde hay necesidad.",
    image: "/images/news/voluntariado.jpg",
    imageAlt: "Voluntarios entregando agua y ayuda a personas en la calle",
  },
  {
    category: "Alianzas",
    title: "Nueva alianza con el banco de alimentos del barrio",
    summary:
      "Sumamos esfuerzos logísticos para que más familias reciban una caja de alimentos cada mes.",
    image: "/images/news/banco-alimentos.jpg",
    imageAlt: "Voluntarios apilando cajas de alimentos para distribución",
  },
  {
    category: "Comunidad",
    title: "Celebramos un nuevo aniversario de la congregación",
    summary:
      "Un domingo especial de gratitud, testimonios y celebración por lo que Dios ha hecho en estos años.",
    image: "/images/news/celebracion-comunidad.jpg",
    imageAlt: "Grupo de personas aplaudiendo durante una celebración",
  },
];

const contactDetails = {
  address: "Av. Esperanza 123, Ciudad de Fe",
  schedule: "Domingos 10:00 AM · Miércoles 7:30 PM",
};

const venue = {
  name: "Auditorio Luz de Vida",
  address: contactDetails.address,
  schedule: contactDetails.schedule,
  image: "/images/venue/auditorio-luz-de-vida.jpg",
  imageAlt: "Interior de un auditorio con butacas en filas e iluminación cálida",
};

const socialLinks = [
  { name: "YouTube", href: "#", icon: "youtube" },
  { name: "Facebook", href: "#", icon: "facebook" },
  { name: "Instagram", href: "#", icon: "instagram" },
  { name: "Plataforma web", href: "/cultos", icon: "globe" },
] as const;

type ImageValue = { _type: "image"; asset: { _type: "reference"; _ref: string } };

/**
 * El documento tal como lo arma el seed, donde `image` PUEDE faltar.
 *
 * `resolveImage()` devuelve `undefined` en dry-run, porque ahí no se sube
 * nada. Los tipos de la app declaran `image` obligatoria — y está bien, el
 * sitio siempre lee documentos ya escritos — así que cada `upsert` llevaba un
 * `as Venue["image"]` para tapar el hueco. Eso le miente al compilador en el
 * único script capaz de escribir en producción.
 *
 * Modelarlo acá dice la verdad: en dry-run falta la imagen, y en dry-run no
 * se escribe (ver `flush()`), así que ese `undefined` nunca llega a Sanity.
 */
type Seeded<T> = Omit<T, "image"> & { image?: ImageValue };

interface Counts {
  created: number;
  updated: number;
}

function padLabel(label: string, width: number): string {
  return label.padEnd(width, " ");
}


async function main() {
  if (!PROJECT_ID) {
    throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  }

  // Sin fallback: escribir en el dataset equivocado por una env mal puesta es
  // silencioso y, en un script que hace createOrReplace, destructivo.
  if (!DATASET) {
    throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");
  }

  console.log(
    DRY_RUN
      ? "=== Sanity seed — DRY RUN (no writes performed, no token required) ===\n"
      : "=== Sanity seed (additive — never deletes) ===\n",
  );

  const client = DRY_RUN
    ? null
    : (() => {
        const token = process.env.SANITY_API_WRITE_TOKEN;
        if (!token) {
          console.error(
            "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
              "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
              "Tip: run `npm run seed -- --dry-run` to preview the seed plan without a token.",
          );
          process.exit(1);
        }
        return createClient({
          projectId: PROJECT_ID,
          dataset: DATASET,
          apiVersion: API_VERSION,
          useCdn: false,
          token,
        });
      })();

  const imageCache = new Map<string, ImageValue>();
  const uploadedPaths = new Set<string>();
  const pending: { type: DocType; doc: Record<string, unknown> & { _id: string } }[] = [];
  let aborted = false;
  const counts: Record<DocType, Counts> = {
    siteSettings: { created: 0, updated: 0 },
    venue: { created: 0, updated: 0 },
    ministry: { created: 0, updated: 0 },
    chaplain: { created: 0, updated: 0 },
    worshipService: { created: 0, updated: 0 },
    event: { created: 0, updated: 0 },
    newsItem: { created: 0, updated: 0 },
    pageBanner: { created: 0, updated: 0 },
  };

  async function resolveImage(imagePath: string): Promise<ImageValue | undefined> {
    uploadedPaths.add(imagePath);

    if (DRY_RUN || !client) {
      return undefined;
    }

    const cached = imageCache.get(imagePath);
    if (cached) {
      return cached;
    }

    const absPath = path.join(process.cwd(), "public", imagePath);
    if (!fs.existsSync(absPath)) {
      throw new Error(`Image referenced by seed not found on disk: ${imagePath}`);
    }

    const asset = await client.assets.upload("image", fs.createReadStream(absPath), {
      filename: path.basename(absPath),
    });

    const value: ImageValue = {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    };
    imageCache.set(imagePath, value);
    return value;
  }

  /**
   * NO escribe. Junta el documento para que `flush()` pueda comparar TODO
   * contra el dataset vivo antes de tocar nada — un `createOrReplace` a mitad
   * de camino, abortado después, dejaría el dataset en un estado mezclado.
   */
  async function upsert<T extends { _id: string; _type: string }>(
    type: DocType,
    doc: T,
  ): Promise<void> {
    pending.push({ type, doc });
    if (DRY_RUN || !client) {
      counts[type].created += 1;
    }
  }

  /**
   * EL GUARD. Compara lo que el seed va a escribir contra lo que hay vivo en
   * el dataset y ABORTA sin escribir una sola letra si encuentra diferencias.
   *
   * El seed usa `createOrReplace`: reemplaza el documento ENTERO por los
   * literales congelados de este archivo. Desde que el cliente edita en
   * `/studio`, cualquier diferencia entre el documento vivo y el literal es,
   * por definición, trabajo del cliente que este script está por borrar.
   *
   * Por eso el guard no pregunta "¿es producción?" sino "¿hay algo que se
   * pierda?". Es la pregunta correcta: un dataset recién creado no tiene nada
   * que perder y el seed corre solo, como siempre; uno editado se frena.
   *
   * `--force` lo saltea, pero recién después de haber IMPRESO qué se pierde.
   */
  async function flush(): Promise<void> {
    // La lectura no necesita token: el dataset es público (así lo lee el
    // sitio). Por eso el guard también corre en `--dry-run`, que es
    // justamente cuando más sirve — avisa antes de que exista intención de
    // escribir.
    const reader =
      client ??
      createClient({
        projectId: PROJECT_ID,
        dataset: DATASET,
        apiVersion: API_VERSION,
        useCdn: false,
      });

    const ids = pending.map((entry) => entry.doc._id);
    const live = await reader.fetch<Record<string, unknown>[]>(
      "*[_id in $ids]",
      { ids },
    );
    const liveById = new Map(live.map((doc) => [doc._id as string, doc]));

    const drifted: { id: string; fields: string[] }[] = [];

    for (const { doc } of pending) {
      const existing = liveById.get(doc._id);
      // Documento que no existe todavía: no hay nada que pisar.
      if (!existing) continue;

      // En dry-run las imágenes no se suben, así que quedan en `undefined` y
      // se reportarían como deriva. `imagesMayBeMissing` ignora exactamente
      // ese hueco a cualquier nivel — incluido el de adentro de `story`, que
      // lleva imagen Y texto — y sigue comparando todo lo demás.
      const fields = driftedFields(existing, doc, [], {
        imagesMayBeMissing: DRY_RUN,
      });
      if (fields.length > 0) drifted.push({ id: doc._id, fields });
    }

    if (drifted.length > 0) {
      const totalFields = drifted.reduce((sum, entry) => sum + entry.fields.length, 0);
      console.log("");
      console.log(
        `⚠️  EL DATASET TIENE CONTENIDO QUE ESTE SEED VA A PISAR — ${drifted.length} documento(s), ${totalFields} campo(s):`,
      );
      for (const entry of drifted) {
        console.log(`  ${entry.id} — ${entry.fields.join(", ")}`);
      }
      console.log("");
      console.log(
        "Estos campos difieren de los literales congelados de este archivo, así que\n" +
          "son ediciones hechas desde el Studio. `createOrReplace` las reemplaza por\n" +
          "los valores originales del seed y NO hay forma de recuperarlas desde acá.",
      );

      if (!FORCE) {
        console.log("");
        console.log(
          "ABORTADO — no se escribió nada.\n" +
            "  · Para ver el plan completo sin escribir:  npm run seed -- --dry-run\n" +
            "  · Si de verdad querés pisar esas ediciones: npm run seed -- --force",
        );
        process.exitCode = 1;
        aborted = true;
        return;
      }

      console.log("");
      console.log("--force presente — se pisan igual.");
    }

    if (DRY_RUN || !client) return;

    for (const { type, doc } of pending) {
      const existed = liveById.has(doc._id);
      await client.createOrReplace(doc as Parameters<typeof client.createOrReplace>[0]);
      if (existed) {
        counts[type].updated += 1;
      } else {
        counts[type].created += 1;
      }
    }
  }

  // --- siteSettings (singleton, fixed id) ---
  // Los href de lib/content.ts son placeholders muertos ("#") o rutas relativas
  // ("/cultos"), pero el schema exige una URL absoluta http(s). La API de
  // mutación NO valida contra el schema: escribir un href inválido no falla,
  // pero después le bloquea al cliente publicar CUALQUIER cambio de este
  // documento desde el Studio. Se sustituyen por la portada de cada red hasta
  // que se carguen las cuentas reales de la iglesia.
  // Deliberadamente hardcodeado y NO tomado de lib/site-url.ts: getSiteUrl()
  // cae a http://localhost:3000 cuando NEXT_PUBLIC_SITE_URL no está seteada, y
  // el seed corre desde la máquina de quien lo ejecuta. El valor que queda
  // escrito en el contenido no puede depender de eso.
  const SEED_SITE_URL = "https://iglesiawebproject.vercel.app";

  // Tipado por SocialIcon y no por string: si mañana se agrega un ícono al
  // schema, esto deja de compilar en vez de caer a un fallback en silencio.
  const PLACEHOLDER_SOCIAL_HREF: Record<SocialIcon, string> = {
    youtube: "https://www.youtube.com",
    facebook: "https://www.facebook.com",
    instagram: "https://www.instagram.com",
    globe: `${SEED_SITE_URL}/cultos`,
  };

  const isAbsoluteHttpUrl = (href: string) => /^https?:\/\//.test(href);

  const socialLinksSeed = keyedSocialLinks(
    socialLinks.map<SocialLink>((link) => ({
      name: link.name,
      href: isAbsoluteHttpUrl(link.href)
        ? link.href
        : PLACEHOLDER_SOCIAL_HREF[link.icon],
      icon: link.icon,
    })),
  );

  await upsert<SiteSettings>(DOC_TYPES.SITE_SETTINGS, {
    _id: "siteSettings",
    _type: "siteSettings",
    address: contactDetails.address,
    schedule: contactDetails.schedule,
    socialLinks: socialLinksSeed,
  });

  // --- venue (singleton, fixed id) — no address/schedule: those live only on
  // siteSettings now, collapsing the duplication that lib/content.ts had.
  const venueImage = await resolveImage(venue.image);
  await upsert<Seeded<Venue>>(DOC_TYPES.VENUE, {
    _id: "venue",
    _type: "venue",
    name: venue.name,
    image: venueImage,
    alt: venue.imageAlt,
  });

  // --- ministry ---
  for (const ministry of ministries) {
    const id = `ministry-${slugify(ministry.name)}`;
    const image = await resolveImage(ministry.image);
    await upsert<Seeded<Ministry>>(DOC_TYPES.MINISTRY, {
      _id: id,
      _type: "ministry",
      name: ministry.name,
      description: ministry.description,
      image,
      imageAlt: ministry.imageAlt,
    });
  }

  // --- chaplain ---
  for (const chaplain of chaplains) {
    const id = `chaplain-${slugify(chaplain.name)}`;
    const image = await resolveImage(chaplain.image);
    await upsert<Seeded<Chaplain>>(DOC_TYPES.CHAPLAIN, {
      _id: id,
      _type: "chaplain",
      name: chaplain.name,
      role: chaplain.role,
      description: chaplain.description,
      image,
      imageAlt: chaplain.imageAlt,
    });
  }

  // --- worshipService (no image field) ---
  for (const service of worshipServices) {
    const id = `worshipService-${slugify(service.title)}`;
    await upsert<WorshipService>(DOC_TYPES.WORSHIP_SERVICE, {
      _id: id,
      _type: "worshipService",
      title: service.title,
      description: service.description,
      detail: service.detail,
      cta: service.cta,
    });
  }

  // --- event ---
  for (const event of events) {
    const id = `event-${slugify(event.title)}`;
    const image = await resolveImage(event.image);
    await upsert<Seeded<EventDoc>>(DOC_TYPES.EVENT, {
      _id: id,
      _type: "event",
      day: event.day,
      title: event.title,
      description: event.description,
      image,
      imageAlt: event.imageAlt,
    });
  }

  // --- newsItem ---
  for (const item of news) {
    const id = `newsItem-${slugify(item.title)}`;
    const image = await resolveImage(item.image);
    await upsert<Seeded<NewsItem>>(DOC_TYPES.NEWS_ITEM, {
      _id: id,
      _type: "newsItem",
      category: item.category,
      title: item.title,
      summary: item.summary,
      image,
      imageAlt: item.imageAlt,
    });
  }

  // --- pageBanner ---
  for (const banner of PAGE_BANNERS) {
    const id = `pageBanner-${banner.route.replace(/^\//, "")}`;
    const image = await resolveImage(banner.image);
    await upsert<Seeded<PageBanner>>(DOC_TYPES.PAGE_BANNER, {
      _id: id,
      _type: "pageBanner",
      route: banner.route as PageBanner["route"],
      eyebrow: banner.eyebrow,
      title: banner.title,
      description: banner.description,
      image,
      imageAlt: banner.imageAlt,
      // `_key` estampado al escribir, nunca a mano en los literales: sin él la
      // escritura pasa igual pero el Studio bloquea la edición del array.
      sections: banner.sections && keyedSections(banner.sections),
      faqs: banner.faqs && keyedFaqs(banner.faqs),
      // Bloques de /quienes-somos. Sus dos imágenes se resuelven igual que
      // cualquier otra: ruta local -> asset subido.
      introParagraphs: banner.introParagraphs,
      introImage: banner.introImage ? await resolveImage(banner.introImage) : undefined,
      introImageAlt: banner.introImageAlt,
      stats: banner.stats && keyedStats(banner.stats),
      vision: banner.vision,
      story: banner.story && {
        ...banner.story,
        image: banner.story.image ? await resolveImage(banner.story.image) : undefined,
      },
      values: banner.values && keyedValues(banner.values),
    });
  }

  await flush();
  if (aborted) return;

  // --- summary ---
  const labelWidth = 16;
  console.log("");

  if (DRY_RUN) {
    console.log("Planned documents by type:");
    let total = 0;
    for (const type of DOC_TYPE_ORDER) {
      const n = counts[type].created;
      total += n;
      console.log(`  ${padLabel(type, labelWidth)} ${n}`);
    }
    console.log(`  ${padLabel("-".repeat(labelWidth - 1), labelWidth)} ----`);
    console.log(`  ${padLabel("TOTAL", labelWidth)} ${total}`);
    console.log("");
    console.log(
      `Images that would be uploaded (deduped by local path): ${uploadedPaths.size}`,
    );
    for (const p of uploadedPaths) {
      console.log(`  ${p}`);
    }
    console.log("");
    console.log("Dry run only — nothing was written, no token was required.");
    return;
  }

  console.log("Documents by type (created / updated):");
  let totalCreated = 0;
  let totalUpdated = 0;
  for (const type of DOC_TYPE_ORDER) {
    const { created, updated } = counts[type];
    totalCreated += created;
    totalUpdated += updated;
    console.log(`  ${padLabel(type, labelWidth)} ${created} / ${updated}`);
  }
  console.log(`  ${padLabel("TOTAL", labelWidth)} ${totalCreated} / ${totalUpdated}`);
  console.log("");
  console.log(`Images uploaded: ${uploadedPaths.size}`);
  console.log("");
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
