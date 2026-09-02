import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeGainResource {
  GainResourceYou = "gain-resource-you",
  GainResourceInvestigator = "gain-resource-investigator",
  GainResourceMoveInvestigator = "gain-resource-move-investigator",
}

interface TagGainResourceBase extends TagBase {
  value: DynamicValue;
}

export interface TagGainResourceYou extends TagGainResourceBase {
  type: TagTypeGainResource.GainResourceYou;
}

export interface TagGainResourceInvestigator extends TagGainResourceBase {
  type: TagTypeGainResource.GainResourceInvestigator;
}

/**
 * Move resources between investigators' pools (sharing/loan/trade), distinct from
 * gaining new resources. No value: the amount is contextual.
 */
export interface TagGainResourceMoveInvestigator extends TagBase {
  type: TagTypeGainResource.GainResourceMoveInvestigator;
}
