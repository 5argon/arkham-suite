import { TagBase } from "../../base.js";

export enum TagTypeEncounter {
  EncounterRevealChoose = "encounter-reveal-choose",
  EncounterOffload = "encounter-offload",
}

interface TagEncounterBase extends TagBase {}

/**
 * Draw/reveal more encounter cards and choose which to resolve, discarding the
 * rest — a soft-cancel / encounter-filter distinct from cancelling the draw.
 */
export interface TagEncounterRevealChoose extends TagEncounterBase {
  type: TagTypeEncounter.EncounterRevealChoose;
}

/**
 * A DIFFERENT investigator resolves an encounter card you would have — pushing
 * yours away ("You handle this one!") or choosing recipients for a batch (First
 * Watch's distribution). The opposite direction, taking another's card onto
 * yourself, is tank-redirect-encounter (a card can carry both — First Watch).
 */
export interface TagEncounterOffload extends TagEncounterBase {
  type: TagTypeEncounter.EncounterOffload;
}
