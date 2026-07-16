import { TagBase } from "../../base.js";

export enum TagTypeCondition {
  ConditionResource = "condition-resource",
  ConditionSanity = "condition-sanity",
  ConditionHandSize = "condition-hand-size",
  ConditionEngagedAlone = "condition-engaged-alone",
  ConditionClueHeld = "condition-clue-held",
  ConditionOwnCopies = "condition-own-copies",
}

interface TagConditionBase extends TagBase {
  /** Whether the threshold is an at-least (`min`) or at-most (`max`) gate. */
  comparison: "min" | "max";
  /** The threshold the investigator's current self-state is compared against. */
  value: number;
}

/** Gates or scales on the investigator's current resource count. */
export interface TagConditionResource extends TagConditionBase {
  type: TagTypeCondition.ConditionResource;
}

/** Gates or scales on the investigator's current remaining sanity. */
export interface TagConditionSanity extends TagConditionBase {
  type: TagTypeCondition.ConditionSanity;
}

/** Gates or scales on the number of cards in the investigator's hand. */
export interface TagConditionHandSize extends TagConditionBase {
  type: TagTypeCondition.ConditionHandSize;
}

/**
 * Gates on a lone engagement — the relevant enemy is the ONLY enemy engaged with you
 * (e.g. Machete's "+1 damage if it is the only enemy engaged with you"). A flag, not a
 * numeric threshold, so it does not carry a comparison/value.
 */
export interface TagConditionEngagedAlone extends TagBase {
  type: TagTypeCondition.ConditionEngagedAlone;
}

/**
 * Cares about the number of clues the INVESTIGATOR personally holds — GATES on a threshold
 * (Newspaper: bonus if you control 2+ clues → comparison/value set) or SCALES with the
 * count (Search for the Truth: draw cards equal to clues on you → no threshold, args omitted).
 */
export interface TagConditionClueHeld extends TagBase {
  type: TagTypeCondition.ConditionClueHeld;
  /** Comparison for a threshold gate; omit when the effect simply scales with the count. */
  comparison?: "min" | "max";
  /** Threshold value for a gate; omit when scaling. */
  value?: number;
}

/**
 * Cares about MULTIPLE COPIES of itself — the Dream-Eaters "copies matter" family:
 * Segment of Onyx (3 in play → assemble), Three Aces (3 committed to one test),
 * Fortuitous Discovery (X = copies in your discard), Dream-Enhancing Serum
 * (duplicate copies in hand don't count toward hand size). `zone` = where the
 * copies are counted.
 */
export interface TagConditionOwnCopies extends TagBase {
  type: TagTypeCondition.ConditionOwnCopies;
  zone?: "in-play" | "hand" | "discard" | "committed";
}
