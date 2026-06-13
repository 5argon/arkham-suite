import { TagBase } from "../../base.js";

export enum TagTypeEnemyDebuff {
  EnemyDoesNotReady = "enemy-does-not-ready",
  EnemyCannotMoveIntoLocation = "enemy-cannot-move-into-location",
  EnemyCannotAttack = "enemy-cannot-attack",
  EnemyCannotMove = "enemy-cannot-move",
  EnemyCannotEngage = "enemy-cannot-engage",
  EnemyExhaust = "enemy-exhaust",
}

interface TagEnemyDebuffBase extends TagBase {}

export interface TagEnemyDoesNotReady extends TagEnemyDebuffBase {
  type: TagTypeEnemyDebuff.EnemyDoesNotReady;
}

export interface TagEnemyCannotMoveIntoLocation extends TagEnemyDebuffBase {
  type: TagTypeEnemyDebuff.EnemyCannotMoveIntoLocation;
}

/** "Attached enemy cannot attack" — a recurring lock-down. */
export interface TagEnemyCannotAttack extends TagEnemyDebuffBase {
  type: TagTypeEnemyDebuff.EnemyCannotAttack;
}

/**
 * "Attached enemy cannot move" — distinct from EnemyCannotMoveIntoLocation
 * (about a location).
 */
export interface TagEnemyCannotMove extends TagEnemyDebuffBase {
  type: TagTypeEnemyDebuff.EnemyCannotMove;
}

/** "That enemy cannot engage you" — evasion-lock (Stealth). */
export interface TagEnemyCannotEngage extends TagEnemyDebuffBase {
  type: TagTypeEnemyDebuff.EnemyCannotEngage;
}

/** Force an enemy to exhaust (tempo/lockdown). */
export interface TagEnemyExhaust extends TagEnemyDebuffBase {
  type: TagTypeEnemyDebuff.EnemyExhaust;
}
