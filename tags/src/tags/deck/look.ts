import { TagBase } from "../../base.js";

export enum TagTypeDeckLook {
  DeckLookYou = "deck-look-you",
  DeckLookEncounter = "deck-look-encounter",
  DeckLookInvestigator = "deck-look-investigator",
  DeckLookBottom = "deck-look-bottom",
}

interface TagDeckLookBase extends TagBase {
  /** Number of cards looked at (-1 for a variable/dynamic amount). */
  value: number;
  /** Whether the looked-at cards may be reordered (vs. only looked at). */
  reorder: boolean;
}

/**
 * Look at the top N cards of a player deck and optionally reorder them, WITHOUT
 * pulling a specific card out. DeckSearch implies extracting a target; this is
 * the non-search "look at" effect (e.g. Gloria Goldberg cares about these).
 */
export interface TagDeckLookYou extends TagDeckLookBase {
  type: TagTypeDeckLook.DeckLookYou;
}

/** Look at / reorder the top of the encounter deck (encounter-deck "look at"). */
export interface TagDeckLookEncounter extends TagDeckLookBase {
  type: TagTypeDeckLook.DeckLookEncounter;
}

/** Look at / reorder the top N cards of ANOTHER investigator's deck (multiplayer deck smoothing). */
export interface TagDeckLookInvestigator extends TagDeckLookBase {
  type: TagTypeDeckLook.DeckLookInvestigator;
}

/** Move a looked-at card to the BOTTOM of the deck — draw-smoothing distinct from reorder-on-top. Accompanies a deck-look-* tag. */
export interface TagDeckLookBottom extends TagBase {
  type: TagTypeDeckLook.DeckLookBottom;
}
