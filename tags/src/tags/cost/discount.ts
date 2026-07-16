import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeCostDiscount {
  CostDiscount = "cost-discount",
  CostDiscountSelf = "cost-discount-self",
}

interface TagCostDiscountBase extends TagBase {
  /**
   * The amount of discount. Use "dynamic" for a variable (X) amount.
   */
  amount: DynamicValue;
}

/**
 * Discounts the cost of playing OTHER cards (Fence, Chuck Fergus, Ever Vigilant,
 * Robes of Endless Night) — the Economy-compound sense. A card discounting only
 * ITSELF is cost-discount-self.
 */
export interface TagCostDiscount extends TagCostDiscountBase {
  type: TagTypeCostDiscount.CostDiscount;
}

/**
 * Reduces its OWN cost conditionally, usually offsetting a huge printed cost
 * (Extensive Research's 10). NOT economy — it supports no other card (ruled
 * 2026-07-17, TDE full review: "you have been tricked").
 */
export interface TagCostDiscountSelf extends TagCostDiscountBase {
  type: TagTypeCostDiscount.CostDiscountSelf;
}
