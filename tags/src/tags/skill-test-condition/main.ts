import { TagBase } from "../../base.js";

// Conditions related to skill test results
export enum TagTypeSkillTestCondition {
  SkillTestConditionSuccessful = "skill-test-condition-successful",
  SkillTestConditionFail = "skill-test-condition-fail",
  SkillTestConditionSuccessfulDuringAnAttack = "skill-test-condition-successful-during-an-attack",
  SkillTestConditionSuccessfulDuringAnEvade = "skill-test-condition-successful-during-an-evade",
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

/** Fires on a successful test performed during an EVADE — the symmetric sibling of skill-test-condition-successful-during-an-attack. */
export interface TagSkillTestConditionSuccessfulDuringAnEvade extends TagSkillTestConditionBase {
  type: TagTypeSkillTestCondition.SkillTestConditionSuccessfulDuringAnEvade;
}
