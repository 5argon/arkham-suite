import { TagBase } from "../../base.js";

export enum TagTypeLocationProperty {
  LocationClueExist = "location-clue-exist",
  LocationClueZero = "location-clue-zero",
  LocationEnemyZero = "location-enemy-zero",
  LocationIgnoreEffects = "location-ignore-effects",
}

interface TagLocationPropertyBase extends TagBase {}

export interface TagLocationPropertyClueExist extends TagLocationPropertyBase {
  type: TagTypeLocationProperty.LocationClueExist;
}

export interface TagLocationPropertyClueZero extends TagLocationPropertyBase {
  type: TagTypeLocationProperty.LocationClueZero;
}

export interface TagLocationPropertyEnemyZero extends TagLocationPropertyBase {
  type: TagTypeLocationProperty.LocationEnemyZero;
}

/**
 * Ignore effects/keywords on your location while acting there (Read the Signs:
 * "ignore any effect or keyword on your location which would trigger during
 * this investigation"). Future member: Mesmeric Influence (FHV). The location
 * counterpart of enemy-ignore-keyword.
 */
export interface TagLocationIgnoreEffects extends TagLocationPropertyBase {
  type: TagTypeLocationProperty.LocationIgnoreEffects;
}
