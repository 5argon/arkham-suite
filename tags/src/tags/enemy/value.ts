import { TagBase } from "../../base.js";

export enum TagTypeEnemyValue {
  EnemyValueDamage = "enemy-value-damage",
  EnemyValueEvade = "enemy-value-evade",
  EnemyValueEvadeReduction = "enemy-value-evade-reduction",
  EnemyValueFight = "enemy-value-fight",
  EnemyValueFightReduction = "enemy-value-fight-reduction",
  EnemyValueHealthReduction = "enemy-value-health-reduction",
  EnemyValueHorror = "enemy-value-horror",
  EnemyValueRemainingHealth = "enemy-value-remaining-health",
  EnemyValueHealth = "enemy-value-health",
}

interface TagEnemyValueBase extends TagBase {}

export interface TagEnemyValueDamage extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueDamage;
}

export interface TagEnemyValueEvade extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueEvade;
}

export interface TagEnemyValueEvadeReduction extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueEvadeReduction;
}

export interface TagEnemyValueFight extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueFight;
}

export interface TagEnemyValueFightReduction extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueFightReduction;
}

/** Reduces an enemy's printed health ("attacked enemy gets -1 health" — Wither (4)). */
export interface TagEnemyValueHealthReduction extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueHealthReduction;
}

export interface TagEnemyValueHorror extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueHorror;
}

/**
 * Cares about damage already ON an enemy / its remaining health — a finisher
 * gate (Garrote Wire: "exactly 1 remaining health" → comparison "exact",
 * value 1) or a scaling payoff (Followed: +1 [intellect] per damage on the
 * chosen enemy → args omitted).
 */
export interface TagEnemyValueRemainingHealth extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueRemainingHealth;
  comparison?: "exact" | "min" | "max";
  value?: number;
}

/** References an enemy's PRINTED health as a value (Ancestral Token: bless = health; Blackmail File: difficulty = health) — the health member of the enemy-value family, parallel to fight/evade/horror/damage. */
export interface TagEnemyValueHealth extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueHealth;
}
