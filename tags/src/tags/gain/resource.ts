import { TagBase } from "../../base.js";

export enum TagTypeGainResource {
  GainResourceYou = "gain-resource-you",
  GainResourceInvestigator = "gain-resource-investigator",
  GainResourceMoveInvestigator = "gain-resource-move-investigator",
}

interface TagGainResourceBase extends TagBase {
  value: number;
}

export interface TagGainResourceYou extends TagGainResourceBase {
  type: TagTypeGainResource.GainResourceYou;

  /**
   * True when the amount gained is a DYNAMIC amount rather than the fixed
   * `value` (e.g. "gain resources equal to that enemy's printed health").
   * Set `value` to -1 in that case.
   */
  dynamic?: boolean;
}

export interface TagGainResourceInvestigator extends TagGainResourceBase {
  type: TagTypeGainResource.GainResourceInvestigator;
}

/**
 * Move resources between investigators' pools (sharing/loan/trade), distinct from
 * gaining new resources. No value: the amount is contextual, so it extends TagBase
 * directly rather than the value-bearing base. Kept in the `gain` group (resource
 * economy) with the `gain-` prefix per the one-folder-one-prefix rule.
 */
export interface TagGainResourceMoveInvestigator extends TagBase {
  type: TagTypeGainResource.GainResourceMoveInvestigator;
}
