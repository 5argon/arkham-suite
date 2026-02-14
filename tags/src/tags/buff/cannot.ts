import { TagBase } from "../../base.js";

export enum TagTypeBuffCannot {
  CannotAttackYou = "buff-cannot-attack-you",
}

interface TagBuffCannotBase extends TagBase {}

export interface TagBuffCannotAttackYou extends TagBuffCannotBase {
  type: TagTypeBuffCannot.CannotAttackYou;
}
