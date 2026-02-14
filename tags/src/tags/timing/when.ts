import { TagBase } from "../../base.js";

// Consolidated timing triggers from fast/free/reaction
// No longer distinguishes between fast action, free triggered ability, or reaction
export enum TagTypeTimingWhen {
  TimingWhenEnemyAttacks = "timing-when-enemy-attacks",
  TimingWhenDefeatEnemy = "timing-when-defeat-enemy",
  TimingWhenEnemySpawnsYourLocation = "timing-when-enemy-spawns-your-location",
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
