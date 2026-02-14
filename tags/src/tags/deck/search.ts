import { TagBase } from "../../base.js";

export enum TagTypeDeckSearch {
  DeckSearchDiscard = "deck-search-discard",
  DeckSearchEncounter = "deck-search-encounter",
  DeckSearchYou = "deck-search-you",
  DeckSearchInvestigator = "deck-search-investigator",
}

interface TagDeckSearchBase extends TagBase {
  range:
    | "all"
    | {
        type: "top";
        cards: number;
      }
    | {
        type: "bottom";
        cards: number;
      };
}

export interface TagDeckSearchDiscard extends TagDeckSearchBase {
  type: TagTypeDeckSearch.DeckSearchDiscard;
}

export interface TagDeckSearchEncounter extends TagDeckSearchBase {
  type: TagTypeDeckSearch.DeckSearchEncounter;
}

export interface TagDeckSearchYou extends TagDeckSearchBase {
  type: TagTypeDeckSearch.DeckSearchYou;
}

/**
 * This means it is possible to search other investigators' decks
 * as well as your own.
 */
export interface TagDeckSearchInvestigator extends TagDeckSearchBase {
  type: TagTypeDeckSearch.DeckSearchInvestigator;
}
