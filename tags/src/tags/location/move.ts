import { TagBase } from "../../base.js";

export enum TagTypeLocationMove {
  LocationMoveClue = "move-clue",
  LocationMoveDamage = "move-damage",
  LocationMoveEnemyControl = "move-enemy-control",
  LocationMoveEnemyDisplace = "move-enemy-displace",
  LocationMoveEnemyToYou = "move-enemy-to-you",
  LocationMoveInvestigatorAny = "move-investigator-any",
  LocationMoveInvestigatorSelf = "move-investigator-self",
  LocationMoveInvestigatorPerformer = "move-investigator-performer",
}

interface TagLocationMoveBase extends TagBase {}

export interface TagLocationMoveClue extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveClue;
}

export interface TagLocationMoveDamage extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveDamage;
}

export interface TagLocationMoveEnemyControl extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveEnemyControl;
}

export interface TagLocationMoveEnemyDisplace extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveEnemyDisplace;
}

export interface TagLocationMoveEnemyToYou extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveEnemyToYou;
}

export interface TagLocationMoveInvestigatorAny extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveInvestigatorAny;
}

export interface TagLocationMoveInvestigatorSelf extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveInvestigatorSelf;
}

/**
 * The PERFORMING investigator moves — for a skill card whose effect applies to whoever
 * performs the test it is committed to (text: "the evading/investigating/performing
 * investigator"), which may be another player at your location. This is what makes such a
 * skill a true SUPPORT card; contrast move-investigator-self (the owner only — e.g. Guts,
 * not support). See the Support compound.
 */
export interface TagLocationMoveInvestigatorPerformer extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveInvestigatorPerformer;
}
