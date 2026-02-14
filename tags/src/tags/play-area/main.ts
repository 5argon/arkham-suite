import { TagBase } from "../../base.js";

export enum TagTypePlayArea {
  PlayAreaToHand = "play-area-to-hand",
  PlayAreaToDeck = "play-area-to-deck",
}

interface TagPlayAreaBase extends TagBase {}

export interface TagPlayAreaToHand extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaToHand;
}

export interface TagPlayAreaToDeck extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaToDeck;
}
