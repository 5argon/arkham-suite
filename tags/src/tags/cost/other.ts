import { TagBase } from "../../base.js";

export enum TagTypeCostOther {
  CostDamageSelf = "cost-damage-self",
  CostDiscardCard = "cost-discard-card",
}

interface TagCostOtherBase extends TagBase {}

export interface TagCostDamageSelf extends TagCostOtherBase {
  type: TagTypeCostOther.CostDamageSelf;
}

export interface TagCostDiscardCard extends TagCostOtherBase {
  type: TagTypeCostOther.CostDiscardCard;
}
