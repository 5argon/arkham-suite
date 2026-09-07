import { TagBase } from "../../base.js";

export enum TagTypeDiscardPile {
  DiscardPileToHand = "discard-pile-to-hand",
  DiscardPileToBottomDeck = "discard-pile-to-bottom-deck",
  DiscardPileToDeck = "discard-pile-to-deck",
}

interface TagDiscardPileBase extends TagBase {}

export interface TagDiscardPileToHand extends TagDiscardPileBase {
  type: TagTypeDiscardPile.DiscardPileToHand;
}

export interface TagDiscardPileToBottomDeck extends TagDiscardPileBase {
  type: TagTypeDiscardPile.DiscardPileToBottomDeck;
}

export interface TagDiscardPileToDeck extends TagDiscardPileBase {
  type: TagTypeDiscardPile.DiscardPileToDeck;
}
