import { TagBase } from "../../base.js";

export enum TagTypeLocationConnecting {
  LocationConnectingEnemy = "location-connecting-enemy",
  LocationConnectingInvestigator = "location-connecting-investigator",
  LocationCreateConnection = "location-create-connection",
}

interface TagLocationConnectingBase extends TagBase {}

/** An enemy located AT a connecting location — a TARGETING SCOPE (attack/evade/choose it there), NOT "move an enemy TO a connecting location" (that is a move-* displacement). */
export interface TagLocationConnectingEnemy extends TagLocationConnectingBase {
  type: TagTypeLocationConnecting.LocationConnectingEnemy;
}

/** An investigator located AT a connecting location — a TARGETING SCOPE (affect them there), NOT "move to a connecting location" (that is a move-investigator-* effect). */
export interface TagLocationConnectingInvestigator extends TagLocationConnectingBase {
  type: TagTypeLocationConnecting.LocationConnectingInvestigator;
}

/**
 * CREATES a connection between locations that wouldn't otherwise exist (Open
 * Gate pairs: "investigators may move between any two locations with an
 * attached Open Gate as if connected"). A Mobility-compound member.
 */
export interface TagLocationCreateConnection extends TagLocationConnectingBase {
  type: TagTypeLocationConnecting.LocationCreateConnection;
}
