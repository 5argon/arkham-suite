import { TagBase } from "../../base.js";

// Timing triggers that occur after specific game events
export enum TagTypeTimingAfter {
  TimingAfterEnemyAttacks = "timing-after-enemy-attacks",
  TimingAfterEnemyDealDamageSelf = "timing-after-enemy-deal-damage-self",
  TimingAfterEnemyDealDamageYou = "timing-after-enemy-deal-damage-you",
  TimingAfterEnemyDealDamageInvestigator = "timing-after-enemy-deal-damage-investigator",
  TimingAfterEntersPlay = "timing-after-enters-play",
  TimingAfterSuccessfullyInvestigate = "timing-after-successfully-investigate",
}

interface TagTimingAfterBase extends TagBase {}

export interface TagTimingAfterEnemyAttacks extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEnemyAttacks;
}

export interface TagTimingAfterEnemyDealDamageSelf extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEnemyDealDamageSelf;
}

export interface TagTimingAfterEnemyDealDamageYou extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEnemyDealDamageYou;
}

export interface TagTimingAfterEnemyDealDamageInvestigator extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEnemyDealDamageInvestigator;
}

export interface TagTimingAfterEntersPlay extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEntersPlay;
}

export interface TagTimingAfterSuccessfullyInvestigate extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterSuccessfullyInvestigate;
}
