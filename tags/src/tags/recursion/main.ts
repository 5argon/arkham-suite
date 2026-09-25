import { TagBase } from "../../base.js";

export enum TagTypeRecursion {
  RecursionAsset = "recursion-asset",
  RecursionEvent = "recursion-event",
  RecursionSkill = "recursion-skill",
  RecursionPlayFromDiscard = "recursion-play-from-discard",
  RecursionSelfToHand = "recursion-self-to-hand",
  RecursionReplay = "recursion-replay",
}

interface TagRecursionBase extends TagBase {}

export interface TagRecursionAsset extends TagRecursionBase {
  type: TagTypeRecursion.RecursionAsset;
}

export interface TagRecursionEvent extends TagRecursionBase {
  type: TagTypeRecursion.RecursionEvent;
}

export interface TagRecursionSkill extends TagRecursionBase {
  type: TagTypeRecursion.RecursionSkill;
}

/**
 * Play/resolve a card DIRECTLY from the discard pile (not first returned to
 * hand). The graveyard-value archetype.
 */
export interface TagRecursionPlayFromDiscard extends TagRecursionBase {
  type: TagTypeRecursion.RecursionPlayFromDiscard;
}

/**
 * A card returns ITSELF to hand instead of being discarded (often gated on
 * succeed-by), enabling repeated reuse.
 */
export interface TagRecursionSelfToHand extends TagRecursionBase {
  type: TagTypeRecursion.RecursionSelfToHand;
}

/**
 * Replay an event CARD in place ("play that event again as if it were in your hand" —
 * Dayana Esperence, Double, Double). Distinct from RecursionEvent (returns from discard);
 * resolving an ABILITY again is action-activate-ignoring-cost.
 */
export interface TagRecursionReplay extends TagRecursionBase {
  type: TagTypeRecursion.RecursionReplay;
}
