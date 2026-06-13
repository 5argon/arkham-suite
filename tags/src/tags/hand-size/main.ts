import { TagBase } from "../../base.js";

export enum TagTypeHandSize {
  HandSizeMaxIncrease = "hand-size-max-increase",
  HandSizeDependent = "hand-size-dependent",
}

interface TagHandSizeBase extends TagBase {}

/**
 * Increases the maximum hand size (e.g. "your maximum hand size is increased by 2").
 */
export interface TagHandSizeMaxIncrease extends TagHandSizeBase {
  type: TagTypeHandSize.HandSizeMaxIncrease;
  value: number;
}

/**
 * Effect scales with / is gated by the number of cards in your hand
 * (e.g. "while you have 5 or more cards in your hand").
 */
export interface TagHandSizeDependent extends TagHandSizeBase {
  type: TagTypeHandSize.HandSizeDependent;
}
