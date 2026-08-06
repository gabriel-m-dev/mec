import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { sanityClient } from "@/sanity/lib/client";
import { eventSlugsWithGalleryQuery } from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";

const STATIC_ROUTES = [
  "",
  "/quienes-somos",
  "/ministerios",
  "/capellanes",
  "/cultos",
  "/eventos",
  "/noticias",
  "/contacto",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = getSiteUrl();
  const lastModified = new Date();

  // Misma query que usa `generateStaticParams` de la galería, para que el
  // sitemap no pueda listar una página que no existe ni omitir una que sí.
  const eventSlugs = await sanityClient.fetch<string[]>(
    eventSlugsWithGalleryQuery,
    {},
    { cache: "force-cache", next: { tags: [SANITY_TAGS.event] } },
  );

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${url}${route}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...eventSlugs.map((slug) => ({
      url: `${url}/eventos/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
