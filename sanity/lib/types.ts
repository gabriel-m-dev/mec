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

export interface SiteSettings {
  _id: string;
  _type: "siteSettings";
  address: string;
  schedule: string;
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

export interface Event {
  _id: string;
  _type: "event";
  day: string;
  title: string;
  description: string;
  image: SanityImageSource;
  imageAlt: string;
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
}
