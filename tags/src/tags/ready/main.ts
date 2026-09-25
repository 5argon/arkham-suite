import { TagBase } from "../../base.js";

export enum TagTypeReady {
  ReadySelf = "ready-self",
  ReadyAsset = "ready-asset",
}

interface TagReadyBase extends TagBase {}

/** Ready (unexhaust) this card. */
export interface TagReadySelf extends TagReadyBase {
  type: TagTypeReady.ReadySelf;
}

/** Ready another asset. */
export interface TagReadyAsset extends TagReadyBase {
  type: TagTypeReady.ReadyAsset;
  /** Only assets of this trait may be readied (Inspiring Presence, Bonnie Walsh: "Ally"). */
  restrictedToTrait?: string;
}

