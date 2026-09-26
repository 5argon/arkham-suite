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
 * Play ANOTHER card without spending an action — it gains FAST (Daisy's Tote Bag, Directive,
 * Chuck Fergus, Fence), or you play it through a fast ability, a reaction, or a Fast event
 * (Joey "The Rat" Vigil, Farsight, Dexter Drake, Marion Tavares, Leading Lady). Distinct from
 * a card that IS fast itself; a tempo / action-compression enabler.
 */
export interface TagGainKeywordFastOther extends TagGainKeywordBase {
  type: TagTypeGainKeyword.GainKeywordFastOther;
}
