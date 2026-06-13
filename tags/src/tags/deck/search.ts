import { TagBase } from "../../base.js";

export enum TagTypeDeckSearch {
  DeckSearchDiscard = "deck-search-discard",
  DeckSearchEncounter = "deck-search-encounter",
  DeckSearchYou = "deck-search-you",
  DeckSearchInvestigator = "deck-search-investigator",
  DeckSearchBonded = "deck-search-bonded",
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

/**
 * Search your BONDED cards (set aside, out of play) for a specific card — the
 * defining engine of the bonded archetype (Miss Doyle, Gate Box, Hallowed
 * Mirror, Occult Lexicon). The base "range" is typically "all".
 */
export interface TagDeckSearchBonded extends TagDeckSearchBase {
  type: TagTypeDeckSearch.DeckSearchBonded;
}
