import { TagBase } from "../../base.js";

export enum TagTypeCostFast {
  CostFastDiscardSelf = "cost-fast-discard-self",
  CostFastExhaustSelf = "cost-fast-exhaust-self",
  CostFastSpendResource = "cost-fast-spend-resource",
}

interface TagCostFastBase extends TagBase {}

export interface TagCostFastDiscardSelf extends TagCostFastBase {
  type: TagTypeCostFast.CostFastDiscardSelf;
}

export interface TagCostFastExhaustSelf extends TagCostFastBase {
  type: TagTypeCostFast.CostFastExhaustSelf;
}

export interface TagCostFastSpendResource extends TagCostFastBase {
  type: TagTypeCostFast.CostFastSpendResource;
}
