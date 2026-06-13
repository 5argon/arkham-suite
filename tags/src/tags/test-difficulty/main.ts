import { TagBase } from "../../base.js";

export enum TagTypeTestDifficulty {
  TestDifficultyReduce = "test-difficulty-reduce",
}

interface TagTestDifficultyBase extends TagBase {
  /** Amount the difficulty (target number) is reduced by. -1 for a dynamic amount. */
  value: number;
}

/**
 * Reduce the difficulty (target number) of a skill test directly, rather than
 * boosting your own skill value or reducing a location's shroud.
 */
export interface TagTestDifficultyReduce extends TagTestDifficultyBase {
  type: TagTypeTestDifficulty.TestDifficultyReduce;
}
