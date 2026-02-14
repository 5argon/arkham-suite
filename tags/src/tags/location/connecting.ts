import { TagBase } from "../../base.js";

export enum TagTypeLocationConnecting {
  LocationConnectingEnemy = "connecting-location-enemy",
  LocationConnectingInvestigator = "connecting-location-investigator",
}

interface TagLocationConnectingBase extends TagBase {}

export interface TagLocationConnectingEnemy extends TagLocationConnectingBase {
  type: TagTypeLocationConnecting.LocationConnectingEnemy;
}

export interface TagLocationConnectingInvestigator extends TagLocationConnectingBase {
  type: TagTypeLocationConnecting.LocationConnectingInvestigator;
}
