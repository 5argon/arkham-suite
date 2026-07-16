import { TagBase } from "../../base.js";
import type { TimingQualifier } from "../../type.js";

export enum TagTypeCostReaction {
  CostReactionDamageSelf = "cost-reaction-damage-self",
  CostReactionDiscardSelf = "cost-reaction-discard-self",
  CostReactionExhaustSelf = "cost-reaction-exhaust-self",
  CostReactionHorrorSelf = "cost-reaction-horror-self",
  CostReactionSpendCharge = "cost-reaction-spend-charge",
  CostReactionSpendResource = "cost-reaction-spend-resource",
  CostReactionSpendClue = "cost-reaction-spend-clue",
  CostReactionSpendSecret = "cost-reaction-spend-secret",
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

/**
 * Take horror on the INVESTIGATOR (you, or freely assignable like Forbidden Knowledge) as
 * a [reaction] cost. NOT horror placed on THIS card itself — that is soak (soak-sanity),
 * e.g. Aquinnah taking the redirected horror onto its own sanity, which is a tank, not
 * self-harm. The same "self = investigator, not this card" rule applies to *-damage-self.
 */
export interface TagCostReactionHorrorSelf extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionHorrorSelf;
}

export interface TagCostReactionSpendCharge extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionSpendCharge;
}

export interface TagCostReactionSpendResource extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionSpendResource;
  /**
   * Where the spent resources live: your POOL (omit — the default: Zoey's Cross,
   * Lucky Dice) or resource-USES on the card itself ("card" — Gregory Gry's
   * Uses (9 resources)). "either" for pool-or-card costs.
   */
  source?: "card" | "either";
}

/** Spend/place one of your OWN clues (pay with progress) as a reaction cost. Distinct from clue-place (a beneficial placement). */
export interface TagCostReactionSpendClue extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionSpendClue;
}

/** Spend a secret use-token as the cost of a [reaction] triggered ability. */
export interface TagCostReactionSpendSecret extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionSpendSecret;
}
