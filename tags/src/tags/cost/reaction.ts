import { TagBase } from "../../base.js";
import type { TimingQualifier } from "../../type.js";

export enum TagTypeCostReaction {
  CostReactionDamageSelf = "cost-reaction-damage-self",
  CostReactionDiscardSelf = "cost-reaction-discard-self",
  CostReactionExhaustSelf = "cost-reaction-exhaust-self",
  CostReactionHorrorSelf = "cost-reaction-horror-self",
  CostReactionSpendCharge = "cost-reaction-spend-charge",
  CostReactionSpendResource = "cost-reaction-spend-resource",
}

interface TagCostReactionBase extends TagBase {
}

export interface TagCostReactionDamageSelf extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionDamageSelf;
}

export interface TagCostReactionDiscardSelf extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionDiscardSelf;
}

export interface TagCostReactionExhaustSelf extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionExhaustSelf;
}

export interface TagCostReactionHorrorSelf extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionHorrorSelf;
}

export interface TagCostReactionSpendCharge extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionSpendCharge;
}

export interface TagCostReactionSpendResource extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionSpendResource;
}
