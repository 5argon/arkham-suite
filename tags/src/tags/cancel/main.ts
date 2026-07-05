import { TagBase } from "../../base.js";

export enum TagTypeCancel {
  CancelAttack = "cancel-attack",
  CancelChaos = "cancel-chaos",
  CancelDamage = "cancel-damage",
  CancelEncounterDraw = "cancel-encounter-draw",
  CancelEncounterEffect = "cancel-encounter-effect",
  CancelHorror = "cancel-horror",
  CancelRevelation = "cancel-revelation",
  CancelLoseAction = "cancel-lose-action",
  CancelLoseResource = "cancel-lose-resource",
  CancelDiscardFromHand = "cancel-discard-from-hand",
  CancelFailedTestEffects = "cancel-failed-test-effects",
  CancelWeaknessDraw = "cancel-weakness-draw",
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

/** Ignore/cancel the "lose actions" aspect of an incoming effect (e.g. Deny Existence). */
export interface TagCancelLoseAction extends TagCancelBase {
  type: TagTypeCancel.CancelLoseAction;
}

/** Ignore/cancel the "lose resources" aspect of an incoming effect (e.g. Deny Existence). */
export interface TagCancelLoseResource extends TagCancelBase {
  type: TagTypeCancel.CancelLoseResource;
}

/** Ignore/cancel a forced hand-discard aspect of an incoming effect (e.g. Deny Existence). */
export interface TagCancelDiscardFromHand extends TagCancelBase {
  type: TagTypeCancel.CancelDiscardFromHand;
}

/** Cancel all effects/consequences of a (failed) skill test (e.g. Neither Rain nor Snow). */
export interface TagCancelFailedTestEffects extends TagCancelBase {
  type: TagTypeCancel.CancelFailedTestEffects;
}

/** Cancel/suppress a drawn weakness's effects (e.g. Ikiaq). */
export interface TagCancelWeaknessDraw extends TagCancelBase {
  type: TagTypeCancel.CancelWeaknessDraw;
}
