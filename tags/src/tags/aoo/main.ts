import { TestingBasicAction } from "../../kohaku.js";
import { TagBase } from "../../base.js";

export enum TagTypeAoo {
  AooNoProvoke = "aoo-no-provoke",
}

interface TagAooBase extends TagBase {}

/**
 * This action does not provoke attacks of opportunity. The optional `action`
 * distinguishes blanket protection (e.g. engage actions do not provoke) from a
 * single ability's protection.
 */
export interface TagAooNoProvoke extends TagAooBase {
  type: TagTypeAoo.AooNoProvoke;
  action?: TestingBasicAction;
}
