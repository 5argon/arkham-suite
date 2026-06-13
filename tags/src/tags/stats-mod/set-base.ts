import { TagBase } from "../../base.js";

export enum TagTypeStatsModSetBase {
  StatsModSetBase = "stats-mod-set-base",
}

interface TagStatsModSetBaseBase extends TagBase {
  value: number;
}

/**
 * Sets / overrides the BASE value of a skill to a fixed number
 * (e.g. "attack with a base [combat] skill of 6").
 * Distinct from additive boosts (boost-in-test / boost-passive) and from
 * BuffStatsReplace (a stat-for-stat swap).
 */
export interface TagStatsModSetBase extends TagStatsModSetBaseBase {
  type: TagTypeStatsModSetBase.StatsModSetBase;
}
