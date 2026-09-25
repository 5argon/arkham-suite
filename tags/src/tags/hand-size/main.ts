import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeHandSize {
  HandSizeMaxIncrease = "hand-size-max-increase",
  HandSizeMaxDecrease = "hand-size-max-decrease",
  HandSizeDependent = "hand-size-dependent",
}

interface TagHandSizeBase extends TagBase {}

/**
 * Increases the maximum hand size (e.g. "your maximum hand size is increased by 2").
 */
export interface TagHandSizeMaxIncrease extends TagHandSizeBase {
  type: TagTypeHandSize.HandSizeMaxIncrease;
  value: DynamicValue;
}

/**
 * REDUCES the maximum hand size (Drawing the Sign -5, Patrice Hathaway -3, Pelt Shipment
 * -3) — a drawback, kept out of the Big Hand compound; `value` is the positive reduction.
 */
export interface TagHandSizeMaxDecrease extends TagHandSizeBase {
  type: TagTypeHandSize.HandSizeMaxDecrease;
  value: DynamicValue;
}

/**
 * Effect scales with / is gated by the number of cards in your hand
 * (e.g. "while you have 5 or more cards in your hand").
 */
export interface TagHandSizeDependent extends TagHandSizeBase {
  type: TagTypeHandSize.HandSizeDependent;
  /**
   * "min" = MORE cards is better (Higher Education's 5+, Extensive Research's discount);
   * "max" = more cards is WORSE (Last Chance loses icons, Feed the Mind's excess horror).
   * Only "min" feeds the Big Hand compound.
   */
  comparison: "min" | "max";
}
