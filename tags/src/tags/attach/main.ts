import { TagBase } from "../../base.js";

export enum TagTypeAttach {
  AttachAsset = "attach-asset",
  AttachEnemy = "attach-enemy",
  AttachInvestigator = "attach-investigator",
  AttachLocation = "attach-location",
}

interface TagAttachBase extends TagBase {}

export interface TagAttachAsset extends TagAttachBase {
  type: TagTypeAttach.AttachAsset;
}

export interface TagAttachEnemy extends TagAttachBase {
  type: TagTypeAttach.AttachEnemy;
}

/** Attaches to an investigator (Delay the Inevitable) — rides with that investigator rather than a zone. */
export interface TagAttachInvestigator extends TagAttachBase {
  type: TagTypeAttach.AttachInvestigator;
}

export interface TagAttachLocation extends TagAttachBase {
  type: TagTypeAttach.AttachLocation;
}
