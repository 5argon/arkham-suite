import { TagBase } from "../../base.js";

export enum TagTypeAuto {
  AutoEvade = "auto-evade",
  AutoSuccess = "auto-success",
}

interface TagAutoBase extends TagBase {}

/**
 * The card says an enemy is AUTOMATICALLY EVADED — as its whole effect (Stray Cat), or as a bonus
 * after a successful test of any kind (Cheap Shot after an attack, "Make 'em sing" after a parley).
 * Compare testless-evade: an evade in which that enemy is never tested against.
 */
export interface TagAutoEvade extends TagAutoBase {
  type: TagTypeAuto.AutoEvade;
}

export interface TagAutoSuccess extends TagAutoBase {
  type: TagTypeAuto.AutoSuccess;
}
