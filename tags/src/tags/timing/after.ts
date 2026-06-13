import { TagBase } from "../../base.js";

// Timing triggers that occur after specific game events
export enum TagTypeTimingAfter {
  TimingAfterEnemyAttacks = "timing-after-enemy-attacks",
  TimingAfterEnemyDealDamageSelf = "timing-after-enemy-deal-damage-self",
  TimingAfterEnemyDealDamageYou = "timing-after-enemy-deal-damage-you",
  TimingAfterEnemyDealDamageInvestigator = "timing-after-enemy-deal-damage-investigator",
  TimingAfterEntersPlay = "timing-after-enters-play",
  TimingAfterSuccessfullyInvestigate = "timing-after-successfully-investigate",
  TimingAfterFailSkillTest = "timing-after-fail-skill-test",
  TimingAfterEngageEnemy = "timing-after-engage-enemy",
  TimingAfterEvadeEnemy = "timing-after-evade-enemy",
  TimingAfterPlayCardOfTrait = "timing-after-play-card-of-trait",
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

/**
 * The "after you fail a skill test" reaction/play window — the defining Survivor
 * fail-forward trigger. Distinct from SkillTestConditionFail (a result-gate).
 */
export interface TagTimingAfterFailSkillTest extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterFailSkillTest;
}

/** "After you engage an enemy" trigger (e.g. Zoey's Cross). */
export interface TagTimingAfterEngageEnemy extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEngageEnemy;
}

/** Reaction/play window after an enemy is evaded (you evade, or an enemy at your location is evaded) — the evade counterpart to timing-after-engage-enemy. */
export interface TagTimingAfterEvadeEnemy extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEvadeEnemy;
}

/** Reaction/forced trigger firing 'after you play a card of trait X' (Heirloom of Hyperborea). Distinct from trait-support-X (synergy, not a timing window). */
export interface TagTimingAfterPlayCardOfTrait extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterPlayCardOfTrait;
  /** The played card's trait, e.g. "Spell", "Item", "Tactic". */
  trait: string;
}
