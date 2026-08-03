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
 *   npm run seed                # writes to Sanity (requires SANITY_API_WRITE_TOKEN)
 *   npm run seed -- --dry-run   # prints the plan only, no token needed, no writes
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

import {
  ministries,
  chaplains,
  worshipServices,
  events,
  news,
  contactDetails,
  venue,
  socialLinks,
} from "../lib/content";

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

// Load .env.local the same way Next.js does — this script runs standalone via
// tsx, outside the Next.js process, so env vars are not loaded automatically.
loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
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

interface BannerSeed {
  route: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

// The 7 page banners are NOT in lib/content.ts — they are hardcoded literals
// inside each app/(site)/*/page.tsx <PageHeader/> call. Transcribed here by
// hand from the current source (verified against every page.tsx at the time
// of writing).
const PAGE_BANNERS: BannerSeed[] = [
  {
    route: "/quienes-somos",
    eyebrow: "Quiénes somos",
    title: "Una comunidad que adora, aprende y sirve junta",
    description:
      "Conocé la historia, la convicción y los valores que sostienen cada encuentro, cada ministerio y cada gesto de cuidado en MEC.",
    image: "/images/pages/quienes-somos-banner.jpg",
    imageAlt: "Congregación reunida durante un culto",
  },
  {
    route: "/ministerios",
    eyebrow: "Ministerios",
    title: "Equipos que convierten la fe en acción concreta",
    description:
      "Desde la adoración hasta el cuidado de niños, cada ministerio es un espacio para poner tus dones al servicio de la comunidad.",
    image: "/images/pages/ministerios-banner.jpg",
    imageAlt: "Equipo de voluntarios sirviendo juntos",
  },
  {
    route: "/capellanes",
    eyebrow: "Capellanes",
    title: "Un equipo preparado para escuchar antes de hablar",
    description:
      "Consejería, oración y acompañamiento para atravesar procesos personales, familiares e institucionales con respaldo real.",
    image: "/images/pages/capellanes-banner.jpg",
    imageAlt: "Sesión de consejería y acompañamiento pastoral",
  },
  {
    route: "/cultos",
    eyebrow: "Cultos",
    title: "Un mismo mensaje, presencial y en vivo",
    description:
      "Sumate a nuestros encuentros semanales en el auditorio o desde donde estés, con la misma calidez y el mismo propósito.",
    image: "/images/pages/cultos-banner.jpg",
    imageAlt: "Multitud en un culto con luces de escenario",
  },
  {
    route: "/eventos",
    eyebrow: "Eventos",
    title: "Encuentros para vivir la fe más allá del domingo",
    description:
      "Vigilias, conferencias, retiros y jornadas de servicio pensadas para distintas etapas de tu caminar con Dios.",
    image: "/images/pages/eventos-banner.jpg",
    imageAlt: "Orador presentando ante una audiencia en un evento",
  },
  {
    route: "/noticias",
    eyebrow: "Noticias",
    title: "Lo que está pasando en nuestra comunidad",
    description:
      "Alianzas, celebraciones y novedades institucionales para que ninguna actualización te tome por sorpresa.",
    image: "/images/pages/noticias-banner.jpg",
    imageAlt: "Primer plano de un periódico sobre una mesa",
  },
  {
    route: "/contacto",
    eyebrow: "Contacto",
    title: "Estamos para recibirte, escribinos cuando quieras",
    description:
      "Contanos qué necesitás — una pregunta, un pedido de oración o ganas de conocernos — y te respondemos a la brevedad.",
    image: "/images/pages/contacto-banner.jpg",
    imageAlt: "Recepción con personas conversando en un lobby luminoso",
  },
];

type ImageValue = { _type: "image"; asset: { _type: "reference"; _ref: string } };

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

  async function upsert<T extends { _id: string; _type: string }>(
    type: DocType,
    doc: T,
  ): Promise<void> {
    if (DRY_RUN || !client) {
      counts[type].created += 1;
      return;
    }

    const existing = await client.getDocument(doc._id);
    await client.createOrReplace(doc);
    if (existing) {
      counts[type].updated += 1;
    } else {
      counts[type].created += 1;
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

  const socialLinksSeed: SocialLink[] = socialLinks.map((link) => ({
    name: link.name,
    href: isAbsoluteHttpUrl(link.href)
      ? link.href
      : PLACEHOLDER_SOCIAL_HREF[link.icon],
    icon: link.icon,
  }));

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
  await upsert<Venue>(DOC_TYPES.VENUE, {
    _id: "venue",
    _type: "venue",
    name: venue.name,
    image: venueImage as Venue["image"],
    alt: venue.imageAlt,
  });

  // --- ministry ---
  for (const ministry of ministries) {
    const id = `ministry-${slugify(ministry.name)}`;
    const image = await resolveImage(ministry.image);
    await upsert<Ministry>(DOC_TYPES.MINISTRY, {
      _id: id,
      _type: "ministry",
      name: ministry.name,
      description: ministry.description,
      image: image as Ministry["image"],
      imageAlt: ministry.imageAlt,
    });
  }

  // --- chaplain ---
  for (const chaplain of chaplains) {
    const id = `chaplain-${slugify(chaplain.name)}`;
    const image = await resolveImage(chaplain.image);
    await upsert<Chaplain>(DOC_TYPES.CHAPLAIN, {
      _id: id,
      _type: "chaplain",
      name: chaplain.name,
      role: chaplain.role,
      description: chaplain.description,
      image: image as Chaplain["image"],
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
    await upsert<EventDoc>(DOC_TYPES.EVENT, {
      _id: id,
      _type: "event",
      day: event.day,
      title: event.title,
      description: event.description,
      image: image as EventDoc["image"],
      imageAlt: event.imageAlt,
    });
  }

  // --- newsItem ---
  for (const item of news) {
    const id = `newsItem-${slugify(item.title)}`;
    const image = await resolveImage(item.image);
    await upsert<NewsItem>(DOC_TYPES.NEWS_ITEM, {
      _id: id,
      _type: "newsItem",
      category: item.category,
      title: item.title,
      summary: item.summary,
      image: image as NewsItem["image"],
      imageAlt: item.imageAlt,
    });
  }

  // --- pageBanner ---
  for (const banner of PAGE_BANNERS) {
    const id = `pageBanner-${banner.route.replace(/^\//, "")}`;
    const image = await resolveImage(banner.image);
    await upsert<PageBanner>(DOC_TYPES.PAGE_BANNER, {
      _id: id,
      _type: "pageBanner",
      route: banner.route as PageBanner["route"],
      eyebrow: banner.eyebrow,
      title: banner.title,
      description: banner.description,
      image: image as PageBanner["image"],
      imageAlt: banner.imageAlt,
    });
  }

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
