import { TagBase } from "../../base.js";

export enum TagTypeRfg {
  RfgSelf = "rfg-self",
}

interface TagRfgBase extends TagBase {}

/**
 * Remove from the game as a self-effect/cost: gone for the rest of the scenario
 * and NOT repurchasable (distinct from exile, which is a campaign/deckbuilding cost).
 */
export interface TagRfgSelf extends TagRfgBase {
  type: TagTypeRfg.RfgSelf;
}
