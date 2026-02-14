import { TagBase } from "../../base.js";

export enum TagTypeLocationProperty {
  LocationClueExist = "location-clue-exist",
  LocationClueZero = "location-clue-zero",
  LocationEnemyZero = "location-enemy-zero",
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
