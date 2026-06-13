import { TagBase } from "../../base.js";

export enum TagTypeExile {
  ExileSelf = "exile-self",
}

interface TagExileBase extends TagBase {}

/**
 * Exile: this card is removed from your deck/collection when used (a campaign
 * deckbuilding mechanic with XP-repurchase implications). Distinct from
 * discard-from-play (recoverable) and remove-from-game (scenario-only).
 */
export interface TagExileSelf extends TagExileBase {
  type: TagTypeExile.ExileSelf;
}
