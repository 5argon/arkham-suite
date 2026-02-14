import { TagBase } from "../../base.js";

export enum TagTypeActionBold {
  ActionBoldFight = "action-bold-fight",
  ActionBoldEngage = "action-bold-engage",
  ActionBoldEvade = "action-bold-evade",
  ActionBoldInvestigate = "action-bold-investigate",
  ActionBoldMove = "action-bold-move",
  ActionBoldParley = "action-bold-parley",
  ActionBoldResign = "action-bold-resign",
}

interface TagActionBoldBase extends TagBase {}

export interface TagActionBoldFight extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldFight;
}

export interface TagActionBoldEngage extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldEngage;
}

export interface TagActionBoldEvade extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldEvade;
}

export interface TagActionBoldInvestigate extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldInvestigate;
}

export interface TagActionBoldMove extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldMove;
}

export interface TagActionBoldParley extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldParley;
}

export interface TagActionBoldResign extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldResign;
}
