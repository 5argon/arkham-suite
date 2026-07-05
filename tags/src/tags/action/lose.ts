import { TagBase } from "../../base.js";

export enum TagTypeActionLose {
  ActionLoseAction = "action-lose",
  ActionEndTurn = "action-end-turn",
}

interface TagActionLoseBase extends TagBase {}

export interface TagActionLoseAction extends TagActionLoseBase {
  type: TagTypeActionLose.ActionLoseAction;
}

/** End your turn as a drawback/tradeoff for a powerful effect (distinct from losing a single action). */
export interface TagActionEndTurn extends TagActionLoseBase {
  type: TagTypeActionLose.ActionEndTurn;
}
