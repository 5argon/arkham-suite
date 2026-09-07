import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";
import { TestingBasicAction } from "../../kohaku.js";

export enum TagTypeTestDifficulty {
  TestDifficultyReduce = "test-difficulty-reduce",
  TestDifficultyIncrease = "test-difficulty-increase",
  TestDifficultyCondition = "test-difficulty-condition",
}

interface TagTestDifficultyBase extends TagBase {
  /** Amount the difficulty (target number) is changed by. "dynamic" for a dynamic amount. */
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

/**
 * RAISE the difficulty of a skill test as a cost or drawback — Drawing Thin ("increase
 * the difficulty of this skill test by 2" to gain), Quick Learner's +1 on your first
 * action, Fake Credentials' +1 per suspicion. The downside sibling of
 * test-difficulty-reduce; `value` is the increase ("dynamic" when it scales).
 */
export interface TagTestDifficultyIncrease extends TagTestDifficultyBase {
  type: TagTypeTestDifficulty.TestDifficultyIncrease;
}

/**
 * GATES on the test's difficulty value itself — "only if the difficulty of that test is
 * higher than your base skill value" (Rise to the Occasion, Signum Crucis), "only if the
 * difficulty of this test is currently 0" (Exploit Weakness, Shed a Light), "a skill test
 * with a difficulty of 4 or higher" (Called by the Mists). A condition, so it carries no
 * value; the reduce/increase siblings CHANGE the difficulty instead.
 */
export interface TagTestDifficultyCondition extends TagBase {
  type: TagTypeTestDifficulty.TestDifficultyCondition;
}
