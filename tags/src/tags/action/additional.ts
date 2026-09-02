import { BasicAction } from "../../kohaku.js";
import { TagBase } from "../../base.js";

export enum TagTypeActionAdditional {
  ActionAdditional = "action-additional",
  ActionAdditionalAttack = "action-additional-attack",
  ActionTakeImmediate = "action-take-immediate",
}

interface TagActionAdditionalBase extends TagBase {}

export interface TagActionAdditional extends TagActionAdditionalBase {
  type: TagTypeActionAdditional.ActionAdditional;
  canOnlyBeUsedTo?: BasicAction;

  /**
   * Assume 1 action if not specified.
   */
  value?: number;

  /**
   * Who receives the additional action(s): "self" (default) or a chosen
   * "investigator" (e.g. Guidance, Lifeline). Omit for self.
   */
  target?: "self" | "investigator";
}

/**
 * An extra ATTACK within the resolution of a single card ("fight that enemy
 * again"), NOT a new game action — so distinct from ActionAdditional which
 * grants a usable action. A burst-damage archetype.
 */
export interface TagActionAdditionalAttack extends TagActionAdditionalBase {
  type: TagTypeActionAdditional.ActionAdditionalAttack;
}

/**
 * Take an action IMMEDIATELY, outside the normal action sequence ("take an
 * action as if it were your turn" / Haste's "take another action of that type
 * again") — Quick Thinking, Swift Reflexes, Haste, The Stars Are Right. NOT a
 * pool of extra actions for the turn (that's action-additional — Leo De Luca);
 * both roll into the Extra Actions compound.
 */
export interface TagActionTakeImmediate extends TagActionAdditionalBase {
  type: TagTypeActionAdditional.ActionTakeImmediate;
  /**
   * Who takes the immediate action: "self" (default) or a chosen "investigator"
   * (The Stars Are Right).
   */
  target?: "self" | "investigator";
}
