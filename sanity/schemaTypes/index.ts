import { chaplain } from "./chaplain";
import { event } from "./event";
import { homePage } from "./homePage";
import { ministry } from "./ministry";
import { newsItem } from "./newsItem";
import { pageBanner } from "./pageBanner";
import { siteSettings } from "./siteSettings";
import { venue } from "./venue";
import { worshipService } from "./worshipService";

export const schemaTypes = [
  homePage,
  siteSettings,
  venue,
  ministry,
  chaplain,
  worshipService,
  event,
  newsItem,
  pageBanner,
];
