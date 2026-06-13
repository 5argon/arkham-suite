import { TagBase } from "../../base.js";

// Consolidated timing triggers from fast/free/reaction
// No longer distinguishes between fast action, free triggered ability, or reaction
export enum TagTypeTimingWhen {
  TimingWhenEnemyAttacks = "timing-when-enemy-attacks",
  TimingWhenDefeatEnemy = "timing-when-defeat-enemy",
  TimingWhenEnemySpawnsYourLocation = "timing-when-enemy-spawns-your-location",
  TimingWhenWouldFailTest = "timing-when-would-fail-test",
}

interface TagTimingWhenBase extends TagBase {}

export interface TagTimingWhenEnemyAttacks extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenEnemyAttacks;
}

export interface TagTimingWhenDefeatEnemy extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenDefeatEnemy;
}

export interface TagTimingWhenEnemySpawnsYourLocation extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenEnemySpawnsYourLocation;
}

/** Reactive window at the moment a test WOULD fail (modified value known, failure not yet locked) — lets a last-second boost flip it (Lucky!). Distinct from timing-after-fail-skill-test. */
export interface TagTimingWhenWouldFailTest extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenWouldFailTest;
}
