import { BasicAction } from "../../kohaku.js";
import { TagBase } from "../../base.js";

export enum TagTypeActionAdditional {
  ActionAdditional = "action-additional",
  ActionAdditionalAttack = "action-additional-attack",
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
