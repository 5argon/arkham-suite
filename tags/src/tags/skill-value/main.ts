import { TagBase } from "../../base.js";

export enum TagTypeSkillValue {
  SkillValueSucceedByDynamic = "skill-value-succeed-by-dynamic",
  SkillValueSucceedByOrMore = "skill-value-succeed-by-or-more",
  SkillValueFailByOrLess = "skill-value-fail-by-or-less",
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
  amount: number;
}

export interface TagSkillValueFailByOrLess extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueFailByOrLess;
  amount: number;
}

export interface TagSkillValueFailByDynamic extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueFailByDynamic;
}

export interface TagSkillValueSucceedByExactly extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueSucceedByExactly;
  amount: number;
}

export interface TagSkillValueFailByExactly extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueFailByExactly;
  amount: number;
}
