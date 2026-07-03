import { TagBase } from "../../base.js";

export enum TagTypeDeckMisc {
  DeckRestriction = "deck-restriction",
  DeckBonded = "deck-bonded",
}

interface TagDeckMiscBase extends TagBase {}

export interface TagDeckRestriction extends TagDeckMiscBase {
  type: TagTypeDeckMisc.DeckRestriction;
}

/**
 * The card IS a Bonded card (Soothing Melody, Blood-Rite): it is never deckbuilt,
 * living set aside out of play and entering via its bonded owner card. The owner
 * side is tagged with deck-search-bonded instead.
 */
export interface TagDeckBonded extends TagDeckMiscBase {
  type: TagTypeDeckMisc.DeckBonded;
}
