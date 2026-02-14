import { TagBase } from "../../base.js";

// Conditions related to skill test results
export enum TagTypeSkillTestCondition {
  SkillTestConditionSuccessful = "skill-test-condition-successful",
  SkillTestConditionFail = "skill-test-condition-fail",
  SkillTestConditionSuccessfulDuringAnAttack = "skill-test-condition-successful-during-an-attack",
}

interface TagSkillTestConditionBase extends TagBase {}

export interface TagSkillTestConditionSuccessful extends TagSkillTestConditionBase {
  type: TagTypeSkillTestCondition.SkillTestConditionSuccessful;
}

export interface TagSkillTestConditionFail extends TagSkillTestConditionBase {
  type: TagTypeSkillTestCondition.SkillTestConditionFail;
}

export interface TagSkillTestConditionSuccessfulDuringAnAttack extends TagSkillTestConditionBase {
  type: TagTypeSkillTestCondition.SkillTestConditionSuccessfulDuringAnAttack;
}
