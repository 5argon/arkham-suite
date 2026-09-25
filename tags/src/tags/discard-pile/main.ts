import { TagBase } from "../../base.js";

export enum TagTypeDiscardPile {
  DiscardPileToHand = "discard-pile-to-hand",
  DiscardPileToDeck = "discard-pile-to-deck",
}

interface TagDiscardPileBase extends TagBase {}

export interface TagDiscardPileToHand extends TagDiscardPileBase {
  type: TagTypeDiscardPile.DiscardPileToHand;
}

/**
 * A card that was in a discard pile ends up back in a deck — the whole pile (Quantum Flux),
 * chosen cards (Respite), or a card used from the discard pile that then returns (Isabelle
 * Barnes, Persistence, Winging It).
 */
export interface TagDiscardPileToDeck extends TagDiscardPileBase {
  type: TagTypeDiscardPile.DiscardPileToDeck;
  /** True when it goes to the BOTTOM of the deck (Copycat, Gift of Nodens) rather than being shuffled in. */
  bottom?: boolean;
}
