import { TagBase } from "../../base.js";

export enum TagTypeActionLose {
  ActionLoseAction = "lose-action",
}

interface TagActionLoseBase extends TagBase {}

export interface TagActionLoseAction extends TagActionLoseBase {
  type: TagTypeActionLose.ActionLoseAction;
}
