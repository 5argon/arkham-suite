import { TagBase } from "../../base.js";

export enum TagTypeDeckShuffle {
  DeckShuffleEncounter = "deck-shuffle-encounter",
  DeckShufflePlayer = "deck-shuffle-player",
}

interface TagDeckShuffleBase extends TagBase {}

export interface TagDeckShuffleEncounter extends TagDeckShuffleBase {
  type: TagTypeDeckShuffle.DeckShuffleEncounter;
}

export interface TagDeckShufflePlayer extends TagDeckShuffleBase {
  type: TagTypeDeckShuffle.DeckShufflePlayer;
}
