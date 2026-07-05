import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";
import { TestingBasicAction } from "../../kohaku.js";

export enum TagTypeTestDifficulty {
  TestDifficultyReduce = "test-difficulty-reduce",
}

interface TagTestDifficultyBase extends TagBase {
  /** Amount the difficulty (target number) is reduced by. "dynamic" for a dynamic amount. */
  value: DynamicValue;
  /** Restrict to a specific action's tests (e.g. Fine Clothes = parley only). Omit = any test. */
  action?: TestingBasicAction;
}

/**
 * Reduce the difficulty (target number) of a skill test directly, rather than
 * boosting your own skill value or reducing a location's shroud.
 */
export interface TagTestDifficultyReduce extends TagTestDifficultyBase {
  type: TagTypeTestDifficulty.TestDifficultyReduce;
}
