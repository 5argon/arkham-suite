import { TagBase } from "../../base.js";

export enum TagTypeAttach {
  AttachAsset = "attach-asset",
  AttachEnemy = "attach-enemy",
  AttachLocation = "attach-location",
}

interface TagAttachBase extends TagBase {}

export interface TagAttachAsset extends TagAttachBase {
  type: TagTypeAttach.AttachAsset;
}

export interface TagAttachEnemy extends TagAttachBase {
  type: TagTypeAttach.AttachEnemy;
}

export interface TagAttachLocation extends TagAttachBase {
  type: TagTypeAttach.AttachLocation;
}
