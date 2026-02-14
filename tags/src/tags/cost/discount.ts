import { TagBase } from "../../base.js";

export enum TagTypeCostDiscount {
  CostDiscount = "cost-discount",
}

interface TagCostDiscountBase extends TagBase {
  /**
   * The amount of discount. Use -1 or a special value for X.
   */
  amount: number;
}

export interface TagCostDiscount extends TagCostDiscountBase {
  type: TagTypeCostDiscount.CostDiscount;
}
