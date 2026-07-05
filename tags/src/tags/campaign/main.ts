import { TagBase } from "../../base.js";

export enum TagTypeCampaign {
  DeckSwapBetweenGames = "deck-swap-between-games",
}

interface TagCampaignBase extends TagBase {}

/** A between-games / campaign benefit: swap or upgrade deck cards in between scenarios (Adaptable, Arcane Research, Down the Rabbit Hole). */
export interface TagDeckSwapBetweenGames extends TagCampaignBase {
  type: TagTypeCampaign.DeckSwapBetweenGames;
}
