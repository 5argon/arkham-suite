import { TagBase } from "../../base.js";

export enum TagTypeEnemyValue {
  EnemyValueDamage = "enemy-value-damage",
  EnemyValueEvade = "enemy-value-evade",
  EnemyValueEvadeReduction = "enemy-value-evade-reduction",
  EnemyValueFight = "enemy-value-fight",
  EnemyValueFightReduction = "enemy-value-fight-reduction",
  EnemyValueHealthReduction = "enemy-value-health-reduction",
  EnemyValueHorror = "enemy-value-horror",
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
