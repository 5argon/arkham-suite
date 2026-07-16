import { TagBase } from "../../base.js";

/**
 * Costs of a FREE TRIGGERED ABILITY — the [free] icon (historically printed as
 * [fast]; same thing). The cost is whatever appears before the colon, e.g.
 * "[free] Discard X: ..." → CostFreeDiscardSelf.
 *
 * NOTE: do NOT confuse the [free] icon with the "Fast." KEYWORD on an event/asset/
 * skill (which lets the card be played without spending an action). That keyword is
 * a play-timing property, not a triggered-ability cost, and is obvious from the text.
 */
export enum TagTypeCostFree {
  CostFreeDamageSelf = "cost-free-damage-self",
  CostFreeDiscardSelf = "cost-free-discard-self",
  CostFreeExhaustSelf = "cost-free-exhaust-self",
  CostFreeSpendCharge = "cost-free-spend-charge",
  CostFreeSpendResource = "cost-free-spend-resource",
  CostFreeSpendSecret = "cost-free-spend-secret",
  CostFreeSpendSupply = "cost-free-spend-supply",
  CostFreeHorrorSelf = "cost-free-horror-self",
  CostFreeSpendClue = "cost-free-spend-clue",
}

interface TagCostFreeBase extends TagBase {}

export interface TagCostFreeDamageSelf extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeDamageSelf;
}

export interface TagCostFreeDiscardSelf extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeDiscardSelf;
}

export interface TagCostFreeExhaustSelf extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeExhaustSelf;
}

export interface TagCostFreeSpendCharge extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeSpendCharge;
}

export interface TagCostFreeSpendResource extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeSpendResource;
  /** Where the spent resources live: pool (omit, default), the card's own uses ("card"), or pool-or-card ("either" — the Physical Training family). */
  source?: "card" | "either";
}

export interface TagCostFreeSpendSecret extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeSpendSecret;
}

/** Spend a supply use-token as the cost of a [free] triggered ability. */
export interface TagCostFreeSpendSupply extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeSpendSupply;
}

/** Take horror on yourself as the cost of a [free] triggered ability (the horror twin of cost-free-damage-self). */
export interface TagCostFreeHorrorSelf extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeHorrorSelf;
}

/** Spend/place one of your OWN clues as the cost of a [free] triggered ability (pay with progress). */
export interface TagCostFreeSpendClue extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeSpendClue;
}
