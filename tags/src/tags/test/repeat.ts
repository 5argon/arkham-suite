import { TagBase } from "../../base.js";

export enum TagTypeTestRepeat {
  TestRepeatFailed = "test-repeat-failed",
}

interface TagTestRepeatBase extends TagBase {}

/**
 * Re-attempt/repeat a failed skill test ("attempt that test again") — a distinct
 * second-chance effect, part of the fail-forward archetype. Not a new test
 * (initiate.ts) nor a margin effect (skill-value/result).
 */
export interface TagTestRepeatFailed extends TagTestRepeatBase {
  type: TagTypeTestRepeat.TestRepeatFailed;
}
