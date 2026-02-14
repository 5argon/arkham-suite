import { TagBase } from "../../base.js";

export enum TagTypeDeckDiscard {
  DeckDiscardCardChoose = "deck-discard-card-choose",
  DeckDiscardCardRandom = "deck-discard-card-random",
  DeckDiscardDeck = "deck-discard-deck",
  DeckDiscardSelf = "deck-discard-self",
  DeckDiscardTreachery = "deck-discard-treachery",
  DeckDiscardZeroUses = "deck-discard-zero-uses",
}

interface TagDeckDiscardBase extends TagBase {}

export interface TagDeckDiscardCardChoose extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardCardChoose;
}

export interface TagDeckDiscardCardRandom extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardCardRandom;
}

export interface TagDeckDiscardDeck extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardDeck;
}

export interface TagDeckDiscardSelf extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardSelf;
}

export interface TagDeckDiscardTreachery extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardTreachery;
}

export interface TagDeckDiscardZeroUses extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardZeroUses;
}
