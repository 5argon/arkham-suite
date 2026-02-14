import { TagBase } from "../../base.js";

export enum TagTypeCostAction {
  CostActionDiscardFromHand = "cost-action-discard-from-hand",
  CostActionDiscardSelf = "cost-action-discard-self",
  CostActionExhaustSelf = "cost-action-exhaust-self",
  CostActionMultiple = "cost-action-multiple",
  CostActionSpendResource = "cost-action-spend-resource",
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
