import { TagBase } from "../../base.js";

export enum TagTypeControl {
  ControlYourCard = "control-your-card",
}

interface TagControlBase extends TagBase {}

/** The effect targets an asset or investigator YOU CONTROL (ownership scope, distinct from location scope) — e.g. Moonlight Ritual removing doom from an asset/investigator you control. */
export interface TagControlYourCard extends TagControlBase {
  type: TagTypeControl.ControlYourCard;
}
