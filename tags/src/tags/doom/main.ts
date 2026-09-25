import { TagBase } from "../../base.js";

export enum TagTypeDoom {
  DoomAdd = "doom-add",
  DoomCheck = "doom-check",
  DoomRemove = "doom-remove",
  DoomPreventAdvance = "doom-prevent-advance",
  DoomMove = "doom-move",
}

interface TagDoomBase extends TagBase {}

/**
 * Places doom. `target` says WHERE: "own-card" is the Marie/Amina archetype (doom on an
 * asset or investigator you control — Arcane Initiate, Baron Samedi, Ghastly Possession),
 * "agenda" is a pure penalty (Dark Memory, The Price of Failure), "enemy" puts it on an
 * enemy (The Nameless Lurker). Only own-card feeds the Doom Adding compound.
 */
export interface TagDoomAdd extends TagDoomBase {
  type: TagTypeDoom.DoomAdd;
  target?: "own-card" | "agenda" | "enemy";
}

export interface TagDoomCheck extends TagDoomBase {
  type: TagTypeDoom.DoomCheck;
}

export interface TagDoomRemove extends TagDoomBase {
  type: TagTypeDoom.DoomRemove;
}

/**
 * Keep doom from advancing the agenda — a stall effect: the agenda cannot advance by reaching
 * its threshold (Mystifying Song), doom on a card does not count toward it (Elle Rubash), or
 * doom cannot be placed / is cancelled as it is placed (Handcuffs, Fortune or Fate).
 */
export interface TagDoomPreventAdvance extends TagDoomBase {
  type: TagTypeDoom.DoomPreventAdvance;
}

/**
 * RELOCATE doom from one card to another live destination — an asset to the agenda
 * (Deafening Silence), between two cards at your location (Amina Zidane's elder sign),
 * or from an asset onto itself (Sin-Eater). Not removal (doom-remove returns the token
 * to the pool) and not placement from the pool (doom-add / cost-add-doom-self).
 */
export interface TagDoomMove extends TagDoomBase {
  type: TagTypeDoom.DoomMove;
}
