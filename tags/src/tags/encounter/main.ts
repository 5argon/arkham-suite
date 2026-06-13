import { TagBase } from "../../base.js";

export enum TagTypeEncounter {
  EncounterRevealChoose = "encounter-reveal-choose",
}

interface TagEncounterBase extends TagBase {}

/**
 * Draw/reveal more encounter cards and choose which to resolve, discarding the
 * rest — a soft-cancel / encounter-filter distinct from cancelling the draw.
 */
export interface TagEncounterRevealChoose extends TagEncounterBase {
  type: TagTypeEncounter.EncounterRevealChoose;
}
