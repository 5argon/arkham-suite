import { TagBase } from "../../base.js";

export enum TagTypeCancel {
  CancelAttack = "cancel-attack",
  CancelChaos = "cancel-chaos",
  CancelDamage = "cancel-damage",
  CancelEncounterDraw = "cancel-encounter-draw",
  CancelEncounterEffect = "cancel-encounter-effect",
  CancelHorror = "cancel-horror",
  CancelRevelation = "cancel-revelation",
}

interface TagCancelBase extends TagBase {}

export interface TagCancelAttack extends TagCancelBase {
  type: TagTypeCancel.CancelAttack;
}

export interface TagCancelChaos extends TagCancelBase {
  type: TagTypeCancel.CancelChaos;
}

export interface TagCancelDamage extends TagCancelBase {
  type: TagTypeCancel.CancelDamage;
}

export interface TagCancelEncounterDraw extends TagCancelBase {
  type: TagTypeCancel.CancelEncounterDraw;
}

export interface TagCancelEncounterEffect extends TagCancelBase {
  type: TagTypeCancel.CancelEncounterEffect;
}

export interface TagCancelHorror extends TagCancelBase {
  type: TagTypeCancel.CancelHorror;
}

export interface TagCancelRevelation extends TagCancelBase {
  type: TagTypeCancel.CancelRevelation;
}
