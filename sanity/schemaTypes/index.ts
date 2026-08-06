import { chaplain } from "./chaplain";
import { chaplaincyActivity } from "./chaplaincyActivity";
import { chosenActivity } from "./chosenActivity";
import { chosenLeader } from "./chosenLeader";
import { event } from "./event";
import { homePage } from "./homePage";
import { newsItem } from "./newsItem";
import { pageBanner } from "./pageBanner";
import { siteSettings } from "./siteSettings";
import { venue } from "./venue";
import { worshipService } from "./worshipService";

export const schemaTypes = [
  homePage,
  siteSettings,
  venue,
  chosenLeader,
  chosenActivity,
  chaplain,
  chaplaincyActivity,
  worshipService,
  event,
  newsItem,
  pageBanner,
];
