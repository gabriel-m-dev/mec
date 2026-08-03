/**
 * One cache tag per Sanity document type. Every `client.fetch` call for a
 * given type MUST use that type's tag so the revalidate webhook can
 * selectively invalidate only the pages that consume it.
 */
export const SANITY_TAGS = {
  siteSettings: "siteSettings",
  venue: "venue",
  ministry: "ministry",
  chaplain: "chaplain",
  worshipService: "worshipService",
  event: "event",
  newsItem: "newsItem",
  pageBanner: "pageBanner",
} as const;

export type SanityTag = (typeof SANITY_TAGS)[keyof typeof SANITY_TAGS];
