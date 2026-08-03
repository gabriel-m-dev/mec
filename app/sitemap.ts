import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = getSiteUrl();
  const lastModified = new Date();

  const routes = [
    "",
    "/quienes-somos",
    "/ministerios",
    "/capellanes",
    "/cultos",
    "/eventos",
    "/noticias",
    "/contacto",
  ];

  return routes.map((route) => ({
    url: `${url}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
