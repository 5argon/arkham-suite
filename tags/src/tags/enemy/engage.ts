import { TagBase } from "../../base.js";

export enum TagTypeEnemyEngage {
  EnemyEngageEffect = "engage-effect",
  EnemyEngageEnemy = "engage-enemy",
  EnemyEngageNone = "engage-none",
  EnemyEngageNotWithYou = "engage-not-with-you",
  EnemyEngageRelated = "engage-related",
  EnemyEngageWithAnother = "engage-with-another",
  EnemyEngageWithYou = "engage-with-you",
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
