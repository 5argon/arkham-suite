import { TestingBasicAction } from "../../kohaku.js";
import { TagBase } from "../../base.js";
import { BoostValue } from "../../type.js";

export enum TagTypeStatsModBoostPassive {
  StatsModBoostPassiveCombat = "stats-mod-boost-passive-combat",
  StatsModBoostPassiveAgility = "stats-mod-boost-passive-agility",
  StatsModBoostPassiveIntellect = "stats-mod-boost-passive-intellect",
  StatsModBoostPassiveWillpower = "stats-mod-boost-passive-willpower",
  StatsModBoostPassiveAny = "stats-mod-boost-passive-any",
}

interface TagStatsModBoostPassivesBase extends TagBase {
  value: BoostValue;
  action?: TestingBasicAction;
}

export interface TagStatsModBoostPassiveCombat extends TagStatsModBoostPassivesBase {
  type: TagTypeStatsModBoostPassive.StatsModBoostPassiveCombat;
}

export interface TagStatsModBoostPassiveAgility extends TagStatsModBoostPassivesBase {
  type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAgility;
}

export interface TagStatsModBoostPassiveIntellect extends TagStatsModBoostPassivesBase {
  type: TagTypeStatsModBoostPassive.StatsModBoostPassiveIntellect;
}

export interface TagStatsModBoostPassiveWillpower extends TagStatsModBoostPassivesBase {
  type: TagTypeStatsModBoostPassive.StatsModBoostPassiveWillpower;
}

export interface TagStatsModBoostPassiveAny extends TagStatsModBoostPassivesBase {
  type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAny;
}
