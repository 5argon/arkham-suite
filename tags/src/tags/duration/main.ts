import { TagBase } from "../../base.js";

export enum TagTypeDuration {
  DurationEnemyPhase = "duration-enemy-phase",
  DurationNext = "duration-next",
  DurationUntilEndPhase = "duration-until-end-phase",
  DurationUntilEndRound = "duration-until-end-round",
  DurationUntilEndTurn = "duration-until-end-turn",
}

interface TagDurationBase extends TagBase {}

export interface TagDurationEnemyPhase extends TagDurationBase {
  type: TagTypeDuration.DurationEnemyPhase;
}

/**
 * A one-shot effect that applies to the NEXT occurrence of something (usually your next skill
 * test or attack) and then ends — Fieldwork, Iron Sights, One in the Chamber, The Red Clock.
 * Distinct from the until-end-* family, which lasts the whole window.
 */
export interface TagDurationNext extends TagDurationBase {
  type: TagTypeDuration.DurationNext;
  /** The "next" must happen within this window, or the effect lapses; omit when unbounded (The Red Clock). */
  window?: "turn" | "phase" | "round";
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
