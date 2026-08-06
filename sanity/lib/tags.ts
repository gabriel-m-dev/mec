/**
 * One cache tag per Sanity document type. Every `client.fetch` call for a
 * given type MUST use that type's tag so the revalidate webhook can
 * selectively invalidate only the pages that consume it.
 */
export const SANITY_TAGS = {
  homePage: "homePage",
  siteSettings: "siteSettings",
  venue: "venue",
  chosenLeader: "chosenLeader",
  chosenActivity: "chosenActivity",
  chaplain: "chaplain",
  chaplaincyActivity: "chaplaincyActivity",
  worshipService: "worshipService",
  event: "event",
  newsItem: "newsItem",
  pageBanner: "pageBanner",
} as const;

export type SanityTag = (typeof SANITY_TAGS)[keyof typeof SANITY_TAGS];
