import { TagBase } from "../../base.js";

export enum TagTypeCostOther {
  CostDamageSelf = "cost-damage-self",
  CostHorrorSelf = "cost-horror-self",
  CostDiscardCard = "cost-discard-card",
  CostAddDoomSelf = "cost-add-doom-self",
  CostAlternatePayment = "cost-alternate-payment",
  CostPlaySpendAction = "cost-play-spend-action",
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

/**
 * Resources ON this card may be spent to pay for cards of given traits — the
 * EOTE savings-wallet family (Prophetic, Sleuth, Bruiser, Crafty, Antiquary,
 * Schoffner's Catalogue). `traits` = which cards the wallet pays for.
 * (Created autonomously 2026-07-17 — review welcome.)
 */
export interface TagCostAlternatePayment extends TagCostOtherBase {
  type: TagTypeCostOther.CostAlternatePayment;
  traits?: string[];
}

/**
 * "Double" (FHV keyword): as an ADDITIONAL COST TO PLAY this card, spend an
 * action — a play cost, not an ability cost (11 FHV members). Distinct from the
 * cost-*-spend families (which are triggered-ability costs before a colon).
 * (Created autonomously 2026-07-17, FHV ingestion — REVIEW WELCOME.)
 */
export interface TagCostPlaySpendAction extends TagCostOtherBase {
  type: TagTypeCostOther.CostPlaySpendAction;
}
