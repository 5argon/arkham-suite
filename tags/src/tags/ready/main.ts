import { TagBase } from "../../base.js";

export enum TagTypeReady {
  ReadySelf = "ready-self",
  ReadyAsset = "ready-asset",
  ReadyAlly = "ready-ally",
}

interface TagReadyBase extends TagBase {}

/** Ready (unexhaust) this card. */
export interface TagReadySelf extends TagReadyBase {
  type: TagTypeReady.ReadySelf;
}

/** Ready another asset. */
export interface TagReadyAsset extends TagReadyBase {
  type: TagTypeReady.ReadyAsset;
}

/** Ready an ally asset. */
export interface TagReadyAlly extends TagReadyBase {
  type: TagTypeReady.ReadyAlly;
}
