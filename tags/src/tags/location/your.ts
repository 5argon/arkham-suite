import { TagBase } from "../../base.js";

export enum TagTypeLocationYour {
  LocationYourEnemy = "your-location-enemy",
  LocationYourInvestigator = "your-location-investigator",
  LocationYourAlly = "your-location-ally",
  LocationYourClue = "your-location-clue",
}

interface TagLocationYourBase extends TagBase {}

export interface TagLocationYourEnemy extends TagLocationYourBase {
  type: TagTypeLocationYour.LocationYourEnemy;
}

/**
 * Often a multiplayer support card.
 */
export interface TagLocationYourInvestigator extends TagLocationYourBase {
  type: TagTypeLocationYour.LocationYourInvestigator;
}

/**
 * "LocationYour" is "Your Location" inversed. It doesn't mean "your ally".
 * It means any ally at your location.
 */
export interface TagLocationYourAlly extends TagLocationYourBase {
  type: TagTypeLocationYour.LocationYourAlly;
}

export interface TagLocationYourClue extends TagLocationYourBase {
  type: TagTypeLocationYour.LocationYourClue;
}
