import { TagBase } from "../../base.js";

export enum TagTypeDeckDiscard {
  DeckDiscardCardChoose = "deck-discard-card-choose",
  DeckDiscardCardRandom = "deck-discard-card-random",
  DeckDiscardDeck = "deck-discard-deck",
  DeckDiscardSelf = "deck-discard-self",
  DeckDiscardTreachery = "deck-discard-treachery",
  DeckDiscardEncounter = "deck-discard-encounter",
}

interface TagDeckDiscardBase extends TagBase {}

/**
 * Discard a card of your CHOICE from your HAND (Mists of R'lyeh's symbol penalty).
 * Despite the deck- prefix (its group folder), this is a HAND discard — milling
 * the player deck is deck-discard-deck.
 */
export interface TagDeckDiscardCardChoose extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardCardChoose;
}

/**
 * Discard a RANDOM card from your HAND (Obsessive, Liquid Courage's failed test).
 * Despite the deck- prefix (its group folder), this is a HAND discard — milling
 * the player deck is deck-discard-deck.
 */
export interface TagDeckDiscardCardRandom extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardCardRandom;
}

/**
 * Discard from the top of the PLAYER deck — mill (Crisis of Identity, Daredevil,
 * Scroll of Secrets' bottom-card discard).
 */
export interface TagDeckDiscardDeck extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardDeck;
}

export interface TagDeckDiscardSelf extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardSelf;
}

export interface TagDeckDiscardTreachery extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardTreachery;
}

/**
 * Proactively discard/thin the top of the ENCOUNTER deck (Split the Angle).
 * DeckDiscardDeck/Self target the player deck; this targets the encounter deck.
 */
export interface TagDeckDiscardEncounter extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardEncounter;
}
