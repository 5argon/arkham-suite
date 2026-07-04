import { TagBase } from "../../base.js";

export enum TagTypeBuffCannot {
  CannotAttackYou = "buff-cannot-attack-you",
  CannotEngageYou = "buff-cannot-engage-you",
}

interface TagBuffCannotBase extends TagBase {}

export interface TagBuffCannotAttackYou extends TagBuffCannotBase {
  type: TagTypeBuffCannot.CannotAttackYou;
}

/** "Enemies cannot engage you" — the evasion-lock buff (Stealth). A lingering benefit ON YOU, the sibling of buff-cannot-attack-you (not a debuff on a specific enemy). */
export interface TagBuffCannotEngageYou extends TagBuffCannotBase {
  type: TagTypeBuffCannot.CannotEngageYou;
}
