import { TagBase } from "../../base.js";

export enum TagTypeCostFree {
  CostFreeDamageSelf = "cost-free-damage-self",
  CostFreeDiscardSelf = "cost-free-discard-self",
  CostFreeExhaustSelf = "cost-free-exhaust-self",
  CostFreeSpendCharge = "cost-free-spend-charge",
  CostFreeSpendResource = "cost-free-spend-resource",
  CostFreeSpendSecret = "cost-free-spend-secret",
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
}

export interface TagCostFreeSpendSecret extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeSpendSecret;
}
