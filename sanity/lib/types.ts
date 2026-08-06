import type { SanityImageSource } from "@sanity/image-url";

export const SOCIAL_ICONS = {
  YOUTUBE: "youtube",
  FACEBOOK: "facebook",
  INSTAGRAM: "instagram",
  GLOBE: "globe",
} as const;

export type SocialIcon = (typeof SOCIAL_ICONS)[keyof typeof SOCIAL_ICONS];

export const PAGE_BANNER_ROUTES = {
  QUIENES_SOMOS: "/quienes-somos",
  MINISTERIOS: "/ministerios",
  CAPELLANES: "/capellanes",
  CULTOS: "/cultos",
  EVENTOS: "/eventos",
  NOTICIAS: "/noticias",
  CONTACTO: "/contacto",
} as const;

export type PageBannerRoute =
  (typeof PAGE_BANNER_ROUTES)[keyof typeof PAGE_BANNER_ROUTES];

export const PAGE_SECTION_KEYS = {
  MAIN: "main",
  VALUES: "values",
  FAQ: "faq",
} as const;

export type PageSectionKey =
  (typeof PAGE_SECTION_KEYS)[keyof typeof PAGE_SECTION_KEYS];

export interface SocialLink {
  name: string;
  href: string;
  icon: SocialIcon;
}

export interface WhatsAppSettings {
  phone?: string;
  message?: string;
}

export interface SiteSettings {
  _id: string;
  _type: "siteSettings";
  address: string;
  schedule: string;
  // Los tres son opcionales: cada uno se muestra solo si está cargado, y
  // vaciarlo es la forma de sacarlo del sitio sin tocar código.
  phone?: string;
  email?: string;
  whatsapp?: WhatsAppSettings;
  socialLinks: SocialLink[];
}

export interface Venue {
  _id: string;
  _type: "venue";
  name: string;
  image: SanityImageSource;
  alt: string;
}

export interface Ministry {
  _id: string;
  _type: "ministry";
  name: string;
  description: string;
  image: SanityImageSource;
  imageAlt: string;
}

export interface Chaplain {
  _id: string;
  _type: "chaplain";
  name: string;
  role: string;
  description: string;
  image: SanityImageSource;
  imageAlt: string;
}

export interface WorshipService {
  _id: string;
  _type: "worshipService";
  title: string;
  description: string;
  detail: string;
  cta: string;
}

/**
 * Un destacado del carrusel de la portada, ya desreferenciado.
 * Sale de `homeFeaturedQuery`, no es la forma cruda de ningún documento.
 */
export interface FeaturedItem {
  _id: string;
  _type: "event" | "newsItem";
  title: string;
  description: string;
  image: SanityImageSource;
  imageAlt: string;
  /** Solo los eventos lo tienen. */
  slug?: string;
  /** Solo un evento con fotos tiene página propia. */
  hasGallery?: boolean;
}

/** La diapositiva fija de transmisión en vivo, siempre primera en el carrusel. */
export interface LiveStream {
  title: string;
  description: string;
  url: string;
  cta?: string;
  image: SanityImageSource;
  imageAlt: string;
}

export interface GalleryImage {
  _key: string;
  asset: SanityImageSource;
  /** Opcional a propósito: si falta, la página usa el título del evento. */
  alt?: string;
}

export interface Event {
  _id: string;
  _type: "event";
  day: string;
  /** Texto libre: "20:00", "20 hs", "de 19 a 22 hs". Opcional. */
  time?: string;
  title: string;
  description: string;
  image: SanityImageSource;
  imageAlt: string;
  /** `_type` incluido: es lo que escriben el Studio y las migraciones. */
  slug?: { _type?: "slug"; current: string };
  gallery?: GalleryImage[];
}

export interface NewsItem {
  _id: string;
  _type: "newsItem";
  category: string;
  title: string;
  summary: string;
  image: SanityImageSource;
  imageAlt: string;
}

export interface PageSection {
  key: PageSectionKey;
  eyebrow?: string;
  title: string;
  copy?: string;
}

export interface Faq {
  question: string;
  answer: string;
}

/** Los íconos disponibles para las tarjetas de valores de /quienes-somos. */
export const VALUE_ICONS = ["shield", "users", "serve"] as const;
export type ValueIcon = (typeof VALUE_ICONS)[number];

export interface Stat {
  value: string;
  label: string;
}

export interface AboutValue {
  icon: ValueIcon;
  title: string;
  description: string;
}

export interface Vision {
  eyebrow?: string;
  body: string;
}

export interface Story {
  eyebrow?: string;
  title: string;
  paragraphs?: string[];
  image?: SanityImageSource;
  imageAlt?: string;
}

export interface PageBanner {
  _id: string;
  _type: "pageBanner";
  route: PageBannerRoute;
  eyebrow?: string;
  title: string;
  description?: string;
  image?: SanityImageSource;
  imageAlt?: string;
  sections?: PageSection[];
  faqs?: Faq[];
  // Bloques propios de /quienes-somos. Opcionales: las otras 6 páginas
  // comparten el tipo pero no los usan.
  introParagraphs?: string[];
  introImage?: SanityImageSource;
  introImageAlt?: string;
  stats?: Stat[];
  vision?: Vision;
  story?: Story;
  values?: AboutValue[];
}
