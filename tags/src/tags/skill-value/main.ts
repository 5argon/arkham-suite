import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeSkillValue {
  SkillValueSucceedByDynamic = "skill-value-succeed-by-dynamic",
  SkillValueSucceedByOrMore = "skill-value-succeed-by-or-more",
  SkillValueFailByOrLess = "skill-value-fail-by-or-less",
  SkillValueFailByOrMore = "skill-value-fail-by-or-more",
  SkillValueFailByDynamic = "skill-value-fail-by-dynamic",
  SkillValueSucceedByExactly = "skill-value-succeed-by-exactly",
  SkillValueFailByExactly = "skill-value-fail-by-exactly",
  SkillValueMarginAdjust = "skill-value-margin-adjust",
}

interface TagSkillValueBase extends TagBase {}

/**
 * The effect SCALES with the margin you succeed by — "for each point you succeed by" (the
 * Shotguns' damage, Hold Up's resources). Margin tags mark a margin the card REWARDS; a
 * penalty keyed to a margin (Divination's "if you succeed by 0, discard a card") is untagged.
 */
export interface TagSkillValueSucceedByDynamic extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueSucceedByDynamic;
}

export interface TagSkillValueSucceedByOrMore extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueSucceedByOrMore;
  amount: DynamicValue;
}

export interface TagSkillValueFailByOrLess extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueFailByOrLess;
  amount: DynamicValue;
}

export interface TagSkillValueFailByOrMore extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueFailByOrMore;
  amount: DynamicValue;
}

export interface TagSkillValueFailByDynamic extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueFailByDynamic;
}

export interface TagSkillValueSucceedByExactly extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueSucceedByExactly;
  amount: DynamicValue;
}

export interface TagSkillValueFailByExactly extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueFailByExactly;
  amount: DynamicValue;
}

/**
 * SHIFT how much a test succeeds or fails by without flipping the result — Steady-Handed
 * ("succeed by 1 more or 1 less"), Inquisitive, Granny Orne ("fails by either 1 less or 1
 * more") — or set it (Lab Coat: "You succeed by 0, instead"). The enabler for exact-margin
 * payoffs; joins both Succeed By and Fail By.
 */
export interface TagSkillValueMarginAdjust extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueMarginAdjust;
}
