import { TagBase } from "../../base.js";

export enum TagTypeCampaign {
  DeckSwapBetweenGames = "campaign-deck-swap-between-games",
}

interface TagCampaignBase extends TagBase {}

/**
 * A between-scenarios DECKBUILDING benefit: swap cards (Adaptable), or upgrade / purchase them
 * for less experience (Arcane Research, Down the Rabbit Hole, Déjà Vu, Shrewd Analysis, Pelt
 * Shipment), or advance a customizable upgrade sheet (The Raven Quill, Refine).
 */
export interface TagDeckSwapBetweenGames extends TagCampaignBase {
  type: TagTypeCampaign.DeckSwapBetweenGames;
}
