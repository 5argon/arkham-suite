import { TestingBasicAction } from "../../kohaku.js";
import { TagBase } from "../../base.js";
import { BoostValue } from "../../type.js";

export enum TagTypeStatsModBoostLasting {
  StatsModBoostLastingCombat = "stats-mod-boost-lasting-combat",
  StatsModBoostLastingAgility = "stats-mod-boost-lasting-agility",
  StatsModBoostLastingIntellect = "stats-mod-boost-lasting-intellect",
  StatsModBoostLastingWillpower = "stats-mod-boost-lasting-willpower",
  StatsModBoostLastingAny = "stats-mod-boost-lasting-any",
}

/**
 * A boost that LINGERS on the investigator across multiple tests for a duration — it adds
 * to the skill and stays there (pair with a `duration-*` tag). Distinct from a single-test
 * boost (`stats-mod-boost-in-test-*`, gone after one test) and from an always-on printed
 * boost (`stats-mod-boost-passive-*`). Example: Encyclopedia — "choose a skill; it gets +2
 * until the end of the phase."
 */
interface TagStatsModBoostLastingBase extends TagBase {
  value: BoostValue;
  action?: TestingBasicAction;
}

export interface TagStatsModBoostLastingCombat extends TagStatsModBoostLastingBase {
  type: TagTypeStatsModBoostLasting.StatsModBoostLastingCombat;
}

export interface TagStatsModBoostLastingAgility extends TagStatsModBoostLastingBase {
  type: TagTypeStatsModBoostLasting.StatsModBoostLastingAgility;
}

export interface TagStatsModBoostLastingIntellect extends TagStatsModBoostLastingBase {
  type: TagTypeStatsModBoostLasting.StatsModBoostLastingIntellect;
}

export interface TagStatsModBoostLastingWillpower extends TagStatsModBoostLastingBase {
  type: TagTypeStatsModBoostLasting.StatsModBoostLastingWillpower;
}

export interface TagStatsModBoostLastingAny extends TagStatsModBoostLastingBase {
  type: TagTypeStatsModBoostLasting.StatsModBoostLastingAny;
}
