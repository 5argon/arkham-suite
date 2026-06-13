import { TagBase } from "../../base.js";
import { SkillType, TestingBasicAction } from "../../kohaku.js";

export enum TagTypeStatsModUseInstead {
  StatsModUseInstead = "stats-mod-use-instead",
}

interface TagStatsModUseInsteadBase extends TagBase {
  /**
   * The stat that is used for the test.
   */
  use: SkillType;
  /**
   * The stat that would normally be used, now replaced.
   */
  instead: SkillType;
  /**
   * Which action's test this per-test substitution applies to, when
   * restricted to one.
   */
  action?: TestingBasicAction;
}

/**
 * Per-action, per-test stat substitution (e.g. "this attack uses [agility]
 * instead of [combat]"). Distinct from BuffStatsReplace, which is a PASSIVE
 * card-wide from->to replacement; these are action-scoped one-shot overrides.
 */
export interface TagStatsModUseInstead extends TagStatsModUseInsteadBase {
  type: TagTypeStatsModUseInstead.StatsModUseInstead;
}
