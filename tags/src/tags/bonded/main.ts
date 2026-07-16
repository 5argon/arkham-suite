import { TagBase } from "../../base.js";

export enum TagTypeBonded {
  BondedCard = "bonded-card",
  BondedFetch = "bonded-fetch",
}

interface TagBondedBase extends TagBase {}

/**
 * This card is BONDED: it starts set aside, out of play, and returns to set-aside
 * instead of the discard/deck (Soothing Melody, Blood-Rite, Wish Eater, Essence of
 * the Dream). Was `deck-bonded` — regrouped 2026-07-16 because bonded cards live
 * OUTSIDE the deck; the deck- prefix was a lie.
 */
export interface TagBondedCard extends TagBondedBase {
  type: TagTypeBonded.BondedCard;
}

/**
 * Fetch a card from your SET-ASIDE bonded pool (Gate Box, Hallowed Mirror, Occult
 * Lexicon, Dream Diary, Empty Vessel's swap). Was `deck-search-bonded` — this is
 * not a deck search (and is deliberately NOT a member of the Search compound), so
 * it carries no range.
 */
export interface TagBondedFetch extends TagBondedBase {
  type: TagTypeBonded.BondedFetch;
}
