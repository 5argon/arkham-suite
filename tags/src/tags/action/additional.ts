import { BasicAction } from "../../kohaku.js";
import { TagBase } from "../../base.js";

export enum TagTypeActionAdditional {
  ActionAdditional = "action-additional",
}

interface TagActionAdditionalBase extends TagBase {}

export interface TagActionAdditional extends TagActionAdditionalBase {
  type: TagTypeActionAdditional.ActionAdditional;
  canOnlyBeUsedTo?: BasicAction;

  /**
   * Assume 1 action if not specified.
   */
  value?: number;
}
