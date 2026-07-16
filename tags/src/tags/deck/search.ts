import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeDeckSearch {
  DeckSearchDiscard = "deck-search-discard",
  DeckSearchEncounter = "deck-search-encounter",
  DeckSearchYou = "deck-search-you",
  DeckSearchInvestigator = "deck-search-investigator",
  DeckSearchReaction = "deck-search-reaction",
}

interface TagDeckSearchBase extends TagBase {
  range:
    | "all"
    | {
        type: "top";
        cards: DynamicValue;
      }
    | {
        type: "bottom";
        cards: DynamicValue;
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
 * The card REACTS to being among the cards you searched — "[reaction] When you
 * search your deck and X is among the searched cards" (the Dream-Eaters Research
 * archetype: Occult Evidence, Astounding Revelation, Surprising Find). No range:
 * this is the found card's own trigger, not a search effect. (No TagDeckSearchBase —
 * its required `range` belongs to searches, not to being found.)
 */
export interface TagDeckSearchReaction extends TagBase {
  type: TagTypeDeckSearch.DeckSearchReaction;
}
