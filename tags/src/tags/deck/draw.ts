import { TagBase } from "../../base.js";

export enum TagTypeDeckDraw {
  DeckDrawYou = "deck-draw-you",
  DeckDrawInvestigator = "deck-draw-investigator",
  DeckDrawReplaceSelf = "deck-draw-replace-self",
}

interface TagDeckDrawBase extends TagBase {
  value: number;
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

export interface TagDeckDrawReplaceSelf extends TagDeckDrawBase {
  type: TagTypeDeckDraw.DeckDrawReplaceSelf;
}
