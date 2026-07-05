import { TagBase } from "../../base.js";

export enum TagTypeEnemyEngage {
  EnemyEngageEffect = "enemy-engage-effect",
  EnemyEngageEnemy = "enemy-engage",
  EnemyEngageNone = "enemy-engage-none",
  EnemyEngageNotWithYou = "enemy-engage-not-with-you",
  EnemyEngageRelated = "enemy-engage-related",
  EnemyEngageWithAnother = "enemy-engage-with-another",
  EnemyEngageWithYou = "enemy-engage-with-you",
  EnemyEngageTargetEngaged = "enemy-engage-target-engaged",
  EnemyEngageDisengage = "enemy-engage-disengage",
  EnemyEngageEvadeMultiple = "enemy-evade-multiple",
  EnemyEngageWithYouMultiple = "enemy-engage-with-you-multiple",
}

interface TagEnemyEngageBase extends TagBase {}

/**
 * The card ENGAGES enemies as an effect — it causes one or more enemies to become engaged
 * (with you or another investigator) through an ability, not the [Engage] basic action.
 * The base "you engage them" effect; the with-you / with-you-multiple / with-another tags
 * qualify WHO and HOW MANY. (Taunt, Get over here!, Heroic Rescue, On the Hunt, …)
 */
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

/**
 * FORCE an enemy to become engaged with you (Taunt, Heroic Rescue, On the Hunt,
 * "Get over here!") — the tank pull. Feeds Engagement. For effects that merely
 * TARGET an enemy already engaged with you, use engage-target-engaged instead.
 */
export interface TagEnemyEngageWithYou extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageWithYou;
}

/**
 * Targets or conditions on "an enemy engaged with you" (Flamethrower, Mano a Mano,
 * Oops!) — a targeting scope, not an engage effect. Split from engage-with-you so
 * the Engagement compound only collects genuine force-engages.
 */
export interface TagEnemyEngageTargetEngaged extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageTargetEngaged;
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
