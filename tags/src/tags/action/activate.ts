import { TagBase } from "../../base.js";

export enum TagTypeActionActivate {
  ActionActivateIgnoringCost = "action-activate-ignoring-cost",
  ActionActivateFromHand = "action-activate-from-hand",
}

interface TagActionActivateBase extends TagBase {}

/**
 * Resolve another card's [action]/[fast] ability without paying its cost
 * (Hand-Eye Coordination, Dirty Deeds, Flurry of Blows; also resolving a Fight
 * ability on a never-deployed weapon). A major action-compression/combo enabler.
 */
export interface TagActionActivateIgnoringCost extends TagActionActivateBase {
  type: TagTypeActionActivate.ActionActivateIgnoringCost;
}

/**
 * Activate an asset's printed [action] ability while it is still IN YOUR HAND
 * (the Anchor Chain / Hand Hook / Nautical Charts cycle).
 */
export interface TagActionActivateFromHand extends TagActionActivateBase {
  type: TagTypeActionActivate.ActionActivateFromHand;

  /** True when activating discards the card instead of exhausting it. */
  discardInstead?: boolean;
}
