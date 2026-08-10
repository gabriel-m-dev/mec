import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { fetchContent } from "@/sanity/lib/fetch";
import {
  chosenActivitySlugsWithGalleryQuery,
  eventSlugsWithGalleryQuery,
  newsItemSlugsQuery,
} from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";

const STATIC_ROUTES = [
  "",
  "/quienes-somos",
  "/the-chosen",
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
  const [eventSlugs, chosenSlugs, newsSlugs] = await Promise.all([
    fetchContent<string[]>(eventSlugsWithGalleryQuery, SANITY_TAGS.event),
    fetchContent<string[]>(
      chosenActivitySlugsWithGalleryQuery,
      SANITY_TAGS.chosenActivity,
    ),
    fetchContent<string[]>(newsItemSlugsQuery, SANITY_TAGS.newsItem),
  ]);

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
    ...chosenSlugs.map((slug) => ({
      url: `${url}/the-chosen/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...newsSlugs.map((slug) => ({
      url: `${url}/noticias/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
