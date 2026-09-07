import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeDeckDraw {
  DeckDrawYou = "deck-draw-you",
  DeckDrawInvestigator = "deck-draw-investigator",
  DeckDrawFillHand = "deck-draw-fill-hand",
  DeckDrawEncounter = "deck-draw-encounter",
}

interface TagDeckDrawBase extends TagBase {
  value: DynamicValue;
}

export interface TagDeckDrawYou extends TagDeckDrawBase {
  type: TagTypeDeckDraw.DeckDrawYou;
}

/**
 * This means it is possible to make other investigators draw cards
 * as well as yourself.
 */
export interface TagDeckDrawInvestigator extends TagDeckDrawBase {
  type: TagTypeDeckDraw.DeckDrawInvestigator;
}

/**
 * Draw cards until you reach your maximum hand size (variable bulk draw). The
 * base "value" is dynamic here, so set it to "dynamic".
 */
export interface TagDeckDrawFillHand extends TagDeckDrawBase {
  type: TagTypeDeckDraw.DeckDrawFillHand;
}

/** Voluntarily draw/resolve a card from the ENCOUNTER deck (Drawn to the Flame, Delve Too Deep) — a self-inflicted encounter, usually for a payoff. */
export interface TagDeckDrawEncounter extends TagDeckDrawBase {
  type: TagTypeDeckDraw.DeckDrawEncounter;
}
