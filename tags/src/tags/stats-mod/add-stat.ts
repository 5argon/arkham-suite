import { TagBase } from "../../base.js";
import { SkillType, TestingBasicAction } from "../../kohaku.js";

export enum TagTypeStatsModAddStat {
  StatsModAddStat = "stats-mod-add-stat",
}

interface TagStatsModAddStatBase extends TagBase {
  /**
   * The donor stat whose value is ADDED on top of the test's normal skill
   * value (e.g. "add your [agility] to your skill value for this attack").
   */
  from: SkillType;
  /**
   * Which action this addition applies to, when restricted to one.
   */
  action?: TestingBasicAction;
}

/**
 * ADDS a second stat's value on top of the test's normal skill value for one
 * action. Distinct from BuffStatsReplace (a swap) and from additive boosts
 * (a flat +N).
 */
export interface TagStatsModAddStat extends TagStatsModAddStatBase {
  type: TagTypeStatsModAddStat.StatsModAddStat;
}
