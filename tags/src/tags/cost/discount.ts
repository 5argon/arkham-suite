import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeCostDiscount {
  CostDiscount = "cost-discount",
}

interface TagCostDiscountBase extends TagBase {
  /**
   * The amount of discount. Use "dynamic" for a variable (X) amount.
   */
  amount: DynamicValue;
}

export interface TagCostDiscount extends TagCostDiscountBase {
  type: TagTypeCostDiscount.CostDiscount;
}
