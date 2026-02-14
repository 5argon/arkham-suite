import { TagBase } from "../../base.js";

export enum TagTypeRecursion {
  RecursionAsset = "recursion-asset",
  RecursionEvent = "recursion-event",
  RecursionSkill = "recursion-skill",
}

interface TagRecursionBase extends TagBase {}

export interface TagRecursionAsset extends TagRecursionBase {
  type: TagTypeRecursion.RecursionAsset;
}

export interface TagRecursionEvent extends TagRecursionBase {
  type: TagTypeRecursion.RecursionEvent;
}

export interface TagRecursionSkill extends TagRecursionBase {
  type: TagTypeRecursion.RecursionSkill;
}
