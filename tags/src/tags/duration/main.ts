import { TagBase } from "../../base.js";

export enum TagTypeDuration {
  DurationEnemyPhase = "duration-enemy-phase",
  DurationNext = "duration-next",
  DurationNextSkillTestThisPhase = "duration-next-skill-test-this-phase",
  DurationNextSkillTestThisTurn = "duration-next-skill-test-this-turn",
  DurationUntilEndPhase = "duration-until-end-phase",
  DurationUntilEndRound = "duration-until-end-round",
  DurationUntilEndTurn = "duration-until-end-turn",
}

interface TagDurationBase extends TagBase {}

export interface TagDurationEnemyPhase extends TagDurationBase {
  type: TagTypeDuration.DurationEnemyPhase;
}

export interface TagDurationNext extends TagDurationBase {
  type: TagTypeDuration.DurationNext;
}

export interface TagDurationNextSkillTestThisPhase extends TagDurationBase {
  type: TagTypeDuration.DurationNextSkillTestThisPhase;
}

export interface TagDurationNextSkillTestThisTurn extends TagDurationBase {
  type: TagTypeDuration.DurationNextSkillTestThisTurn;
}

export interface TagDurationUntilEndPhase extends TagDurationBase {
  type: TagTypeDuration.DurationUntilEndPhase;
}

export interface TagDurationUntilEndRound extends TagDurationBase {
  type: TagTypeDuration.DurationUntilEndRound;
}

export interface TagDurationUntilEndTurn extends TagDurationBase {
  type: TagTypeDuration.DurationUntilEndTurn;
}
