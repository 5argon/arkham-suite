import { TagBase } from "../../base.js";

export enum TagTypeControl {
  ControlYourCard = "control-your-card",
  ControlTransferAsset = "control-transfer-asset",
}

interface TagControlBase extends TagBase {}

/** The effect targets an asset or investigator YOU CONTROL (ownership scope, distinct from location scope) — e.g. Moonlight Ritual removing doom from an asset/investigator you control. */
export interface TagControlYourCard extends TagControlBase {
  type: TagTypeControl.ControlYourCard;
}

/**
 * Control of an ASSET moves between investigators — giving (Teamwork, Solemn Vow
 * played under another's control) or taking (Kleptomania). Resource transfers are
 * gain-resource-move-investigator; this is the asset-control half.
 */
export interface TagControlTransferAsset extends TagControlBase {
  type: TagTypeControl.ControlTransferAsset;
}
