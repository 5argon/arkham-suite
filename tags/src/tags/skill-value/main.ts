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
}

interface TagSkillValueBase extends TagBase {}

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
