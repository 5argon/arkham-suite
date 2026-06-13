import { TagBase } from "../../base.js";

export enum TagTypeEnemyEngage {
  EnemyEngageEffect = "engage-effect",
  EnemyEngageEnemy = "engage-enemy",
  EnemyEngageNone = "engage-none",
  EnemyEngageNotWithYou = "engage-not-with-you",
  EnemyEngageRelated = "engage-related",
  EnemyEngageWithAnother = "engage-with-another",
  EnemyEngageWithYou = "engage-with-you",
  EnemyEngageDisengage = "engage-disengage",
  EnemyEngageEvadeMultiple = "evade-multiple",
  EnemyEngageWithYouMultiple = "engage-with-you-multiple",
}

interface TagEnemyEngageBase extends TagBase {}

export interface TagEnemyEngageEffect extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageEffect;
}

export interface TagEnemyEngageEnemy extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageEnemy;
}

export interface TagEnemyEngageNone extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageNone;
}

export interface TagEnemyEngageNotWithYou extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageNotWithYou;
}

export interface TagEnemyEngageRelated extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageRelated;
}

export interface TagEnemyEngageWithAnother extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageWithAnother;
}

export interface TagEnemyEngageWithYou extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageWithYou;
}

/**
 * Forcibly disengage an enemy from investigators, or you disengage from each
 * engaged enemy — the core of the evasion/escape package. "withoutExhaust"
 * flags the Stealth variant (disengaged but kept ready).
 */
export interface TagEnemyEngageDisengage extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageDisengage;
  withoutExhaust?: boolean;
  /** True when you disengage from EVERY enemy engaged with you at once (Elusive, Cat Burglar) — a mass getaway. */
  fromAll?: boolean;
}

/** Evade ALL/each enemy engaged with you (or at your location) at once — mass evade, the evade analog of testless-damage-your-location-multiple. */
export interface TagEnemyEngageEvadeMultiple extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageEvadeMultiple;
}

/** Engage MULTIPLE / any number of enemies at your location at once (mass-engage / tank pull). */
export interface TagEnemyEngageWithYouMultiple extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageWithYouMultiple;
}
