import { TagBase } from "../../base.js";

export enum TagTypeEnemyDebuff {
  EnemyDoesNotReady = "enemy-does-not-ready",
  EnemyCannotMoveIntoLocation = "enemy-cannot-move-into-location",
}

interface TagEnemyDebuffBase extends TagBase {}

export interface TagEnemyDoesNotReady extends TagEnemyDebuffBase {
  type: TagTypeEnemyDebuff.EnemyDoesNotReady;
}

export interface TagEnemyCannotMoveIntoLocation extends TagEnemyDebuffBase {
  type: TagTypeEnemyDebuff.EnemyCannotMoveIntoLocation;
}
