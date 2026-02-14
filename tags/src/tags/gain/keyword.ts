import { TagBase } from "../../base.js";

export enum TagTypeGainKeyword {
  GainKeywordAloof = "gain-aloof",
  GainKeywordRetaliate = "gain-retaliate",
}

interface TagGainKeywordBase extends TagBase {}

export interface TagGainKeywordAloof extends TagGainKeywordBase {
  type: TagTypeGainKeyword.GainKeywordAloof;
}

export interface TagGainKeywordRetaliate extends TagGainKeywordBase {
  type: TagTypeGainKeyword.GainKeywordRetaliate;
}
