import { TagBase } from "../../base.js";

export enum TagTypeCostOther {
  CostDamageSelf = "cost-damage-self",
  CostHorrorSelf = "cost-horror-self",
  CostDiscardCard = "cost-discard-card",
  CostAddDoomSelf = "cost-add-doom-self",
}

interface TagCostOtherBase extends TagBase {}

export interface TagCostDamageSelf extends TagCostOtherBase {
  type: TagTypeCostOther.CostDamageSelf;
}

/**
 * Take horror on yourself as a flat cost of the card's effect, NOT tied to a [free]/
 * [reaction] triggered-ability icon — e.g. Ward of Protection ("Cancel … you take 1
 * horror"). The horror twin of cost-damage-self; feeds the Self-Harm (horror) archetype.
 */
export interface TagCostHorrorSelf extends TagCostOtherBase {
  type: TagTypeCostOther.CostHorrorSelf;
}

export interface TagCostDiscardCard extends TagCostOtherBase {
  type: TagTypeCostOther.CostDiscardCard;
}

/**
 * "Power at the price of doom": place doom on a card you control as an
 * activation cost. Distinct from the generic DoomAdd (to the agenda).
 */
export interface TagCostAddDoomSelf extends TagCostOtherBase {
  type: TagTypeCostOther.CostAddDoomSelf;
  value: number;
}
