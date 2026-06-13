import { TagBase } from "../../base.js";

export enum TagTypeDoom {
  DoomAdd = "doom-add",
  DoomCheck = "doom-check",
  DoomRemove = "doom-remove",
  DoomPreventAdvance = "doom-prevent-advance",
}

interface TagDoomBase extends TagBase {}

export interface TagDoomAdd extends TagDoomBase {
  type: TagTypeDoom.DoomAdd;
}

export interface TagDoomCheck extends TagDoomBase {
  type: TagTypeDoom.DoomCheck;
}

export interface TagDoomRemove extends TagDoomBase {
  type: TagTypeDoom.DoomRemove;
}

/**
 * Prevent the agenda from advancing when it reaches its doom threshold
 * ("the agenda cannot advance by reaching its doom threshold") — a stall effect.
 */
export interface TagDoomPreventAdvance extends TagDoomBase {
  type: TagTypeDoom.DoomPreventAdvance;
}
