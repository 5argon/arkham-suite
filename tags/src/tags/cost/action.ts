import { TagBase } from "../../base.js";

export enum TagTypeCostAction {
  CostActionDiscardFromHand = "cost-action-discard-from-hand",
  CostActionDiscardSelf = "cost-action-discard-self",
  CostActionExhaustSelf = "cost-action-exhaust-self",
  CostActionMultiple = "cost-action-multiple",
  CostActionSpendResource = "cost-action-spend-resource",
  CostActionSpendSecret = "cost-action-spend-secret",
  CostActionSpendCharge = "cost-action-spend-charge",
  CostActionSpendAmmo = "cost-action-spend-ammo",
  CostActionSpendSupply = "cost-action-spend-supply",
}

interface TagCostActionBase extends TagBase {}

export interface TagCostActionDiscardFromHand extends TagCostActionBase {
  type: TagTypeCostAction.CostActionDiscardFromHand;
}

export interface TagCostActionDiscardSelf extends TagCostActionBase {
  type: TagTypeCostAction.CostActionDiscardSelf;
}

export interface TagCostActionExhaustSelf extends TagCostActionBase {
  type: TagTypeCostAction.CostActionExhaustSelf;
}

export interface TagCostActionMultiple extends TagCostActionBase {
  type: TagTypeCostAction.CostActionMultiple;
}

export interface TagCostActionSpendResource extends TagCostActionBase {
  type: TagTypeCostAction.CostActionSpendResource;
}

/**
 * An [action]-activated ability that spends a secret (parallel to
 * CostActionSpendResource and CostFreeSpendSecret).
 */
export interface TagCostActionSpendSecret extends TagCostActionBase {
  type: TagTypeCostAction.CostActionSpendSecret;
}

/** [action] ability whose cost is spending a CHARGE use-token from this card's own pool. Ammo firearms use cost-action-spend-ammo instead. */
export interface TagCostActionSpendCharge extends TagCostActionBase {
  type: TagTypeCostAction.CostActionSpendCharge;
}

/** [action] ability whose cost is spending an AMMO use-token from this card's own pool (every 'spend 1 ammo: Fight' firearm). */
export interface TagCostActionSpendAmmo extends TagCostActionBase {
  type: TagTypeCostAction.CostActionSpendAmmo;
}

/** [action] ability whose cost is spending a supply use-token from this card's pool. */
export interface TagCostActionSpendSupply extends TagCostActionBase {
  type: TagTypeCostAction.CostActionSpendSupply;
}
