import { TagBase } from "../../base.js";

export enum TagTypeEnemyElite {
  EnemyEliteNonEliteOnly = "elite-noneliteonly",
  EnemyEliteReducedEffect = "elite-reducedeffect",
}

interface TagEnemyEliteBase extends TagBase {}

export interface TagEnemyEliteNonEliteOnly extends TagEnemyEliteBase {
  type: TagTypeEnemyElite.EnemyEliteNonEliteOnly;
}

export interface TagEnemyEliteReducedEffect extends TagEnemyEliteBase {
  type: TagTypeEnemyElite.EnemyEliteReducedEffect;
}
