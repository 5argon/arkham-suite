import { TestingBasicAction } from "../../kohaku.js";
import { TagBase } from "../../base.js";
import { BoostValue } from "../../type.js";

export enum TagTypeStatsModBoostInTest {
  StatsModBoostInTestCombat = "stats-mod-boost-in-test-combat",
  StatsModBoostInTestAgility = "stats-mod-boost-in-test-agility",
  StatsModBoostInTestIntellect = "stats-mod-boost-in-test-intellect",
  StatsModBoostInTestWillpower = "stats-mod-boost-in-test-willpower",
  StatsModBoostInTestAny = "stats-mod-boost-in-test-any",
}

interface TagStatsModBoostInTestsBase extends TagBase {
  value: BoostValue;
  action?: TestingBasicAction;
}

export interface TagStatsModBoostInTestCombat extends TagStatsModBoostInTestsBase {
  type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat;
}

export interface TagStatsModBoostInTestAgility extends TagStatsModBoostInTestsBase {
  type: TagTypeStatsModBoostInTest.StatsModBoostInTestAgility;
}

export interface TagStatsModBoostInTestIntellect extends TagStatsModBoostInTestsBase {
  type: TagTypeStatsModBoostInTest.StatsModBoostInTestIntellect;
}

export interface TagStatsModBoostInTestWillpower extends TagStatsModBoostInTestsBase {
  type: TagTypeStatsModBoostInTest.StatsModBoostInTestWillpower;
}

export interface TagStatsModBoostInTestAny extends TagStatsModBoostInTestsBase {
  type: TagTypeStatsModBoostInTest.StatsModBoostInTestAny;
}
