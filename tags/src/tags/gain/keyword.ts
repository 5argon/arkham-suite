import { TagBase } from "../../base.js";

export enum TagTypeGainKeyword {
  GainKeywordAloof = "gain-aloof",
  GainKeywordRetaliate = "gain-retaliate",
  GainKeywordAlert = "gain-alert",
  GainKeywordFastOther = "gain-fast-other",
}

interface TagGainKeywordBase extends TagBase {}

export interface TagGainKeywordAloof extends TagGainKeywordBase {
  type: TagTypeGainKeyword.GainKeywordAloof;
}

export interface TagGainKeywordRetaliate extends TagGainKeywordBase {
  type: TagTypeGainKeyword.GainKeywordRetaliate;
}

/**
 * An enemy gains ALERT (attacks on evade attempts) — Daring's enable-the-payoff
 * twin of gain-retaliate.
 */
export interface TagGainKeywordAlert extends TagGainKeywordBase {
  type: TagTypeGainKeyword.GainKeywordAlert;
}

/**
 * Grant the FAST keyword to ANOTHER card you play (Daisy's Tote Bag, Directive,
 * Chuck Fergus, Fence). Distinct from cost/fast tags that describe a card that
 * IS fast; this grants fast to other cards — a tempo/action-compression enabler.
 */
export interface TagGainKeywordFastOther extends TagGainKeywordBase {
  type: TagTypeGainKeyword.GainKeywordFastOther;
}
