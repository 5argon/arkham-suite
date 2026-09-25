import { TagBase } from "../../base.js";

export enum TagTypeEncounter {
  EncounterOffload = "encounter-offload",
  EncounterBlankText = "encounter-blank-text",
}

interface TagEncounterBase extends TagBase {}

/**
 * A DIFFERENT investigator resolves an encounter card you would have — pushing
 * yours away ("You handle this one!") or choosing recipients for a batch (First
 * Watch's distribution). The opposite direction, taking another's card onto
 * yourself, is tank-redirect-encounter (a card can carry both — First Watch).
 */
export interface TagEncounterOffload extends TagEncounterBase {
  type: TagTypeEncounter.EncounterOffload;
}

/**
 * Blank an encounter card's TEXT BOX (it loses all abilities and keywords; traits remain) —
 * an enemy (Mind Wipe) or a treachery (Orphic Theory). The hard version of ignoring a single
 * keyword (enemy-ignore-keyword).
 */
export interface TagEncounterBlankText extends TagEncounterBase {
  type: TagTypeEncounter.EncounterBlankText;
  target: "enemy" | "treachery";
}
