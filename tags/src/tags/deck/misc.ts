import { TagBase } from "../../base.js";

export enum TagTypeDeckMisc {
  DeckRestriction = "deck-restriction",
}

interface TagDeckMiscBase extends TagBase {}

export interface TagDeckRestriction extends TagDeckMiscBase {
  type: TagTypeDeckMisc.DeckRestriction;
}
